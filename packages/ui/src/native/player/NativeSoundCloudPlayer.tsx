import { safeWrap, safeWrapAsync } from '@vibes/shared';
import {
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState, Image, Linking, View } from 'react-native';
import {
  WebView,
  type WebViewMessageEvent,
  type WebViewNavigation,
} from 'react-native-webview';

export interface NativeSoundCloudPlayerProps {
  artworkUrl: string;
  height: number;
  isPlaying: boolean;
  onEnded?: () => void;
  onError?: (message: string) => void;
  onLocalPositionObserved?: (positionMs: number) => void;
  positionMs: number;
  providerUrl?: string;
  resetVersion: number | string;
  sourceId: string;
  synchronizePosition: boolean;
  width: number;
}

export function NativeSoundCloudPlayer({
  artworkUrl,
  height,
  isPlaying,
  onEnded,
  onError,
  onLocalPositionObserved,
  positionMs,
  providerUrl,
  resetVersion,
  sourceId,
  synchronizePosition,
  width,
}: NativeSoundCloudPlayerProps) {
  const playerRef = useRef<WebView>(null);
  const previousPosition = useRef(positionMs);
  const lastResetVersion = useRef<number | string>(resetVersion);
  const desiredPlaying = useRef(isPlaying);
  const latestPosition = useRef(positionMs);
  const expectedPosition = useRef<ExpectedPosition | null>(null);
  const [ready, setReady] = useState(false);
  const playerHtml = useMemo(
    () => getPlayerHtml(sourceId, providerUrl),
    [providerUrl, sourceId],
  );

  const setPlayerPlaying = useCallback((playing: boolean) => {
    playerRef.current?.injectJavaScript(
      `window.zoffSetPlaying?.(${playing ? 'true' : 'false'}); true;`,
    );
  }, []);

  const seekToPosition = useCallback((nextPositionMs: number) => {
    expectedPosition.current = {
      commandedAt: Date.now(),
      positionMs: nextPositionMs,
    };
    seekPlayer(playerRef.current, nextPositionMs);
  }, []);

  useEffect(() => {
    desiredPlaying.current = isPlaying;
    if (!ready) return;
    setPlayerPlaying(isPlaying);
  }, [isPlaying, ready, setPlayerPlaying]);

  useEffect(() => {
    latestPosition.current = positionMs;
    const positionChanged = Math.abs(positionMs - previousPosition.current);
    previousPosition.current = positionMs;
    if (!ready || !synchronizePosition || positionChanged < seekChangeThreshold)
      return;
    seekToPosition(positionMs);
  }, [positionMs, ready, seekToPosition, synchronizePosition]);

  useEffect(() => {
    if (!ready || lastResetVersion.current === resetVersion) return;
    lastResetVersion.current = resetVersion;
    expectedPosition.current = {
      commandedAt: Date.now(),
      positionMs,
    };
    resetPlayer(playerRef.current, positionMs);
  }, [positionMs, ready, resetVersion]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active' || !ready) return;
      seekToPosition(latestPosition.current);
      setPlayerPlaying(desiredPlaying.current);
    });
    return () => subscription.remove();
  }, [ready, seekToPosition, setPlayerPlaying]);

  const handleReady = useCallback(() => {
    setReady(true);
    seekToPosition(latestPosition.current);
    setPlayerPlaying(desiredPlaying.current);
  }, [seekToPosition, setPlayerPlaying]);

  const handlePlayerMessage = useCallback(
    (event: WebViewMessageEvent) => {
      const [messageError, message] = safeWrap<unknown>(() =>
        JSON.parse(event.nativeEvent.data),
      );
      if (messageError || !isPlayerMessage(message)) return;
      if (message.type === 'ready') {
        handleReady();
        return;
      }
      if (message.type === 'playing') {
        return;
      }
      if (message.type === 'position') {
        if (
          shouldSuppressExpectedPosition(
            expectedPosition,
            message.positionMs,
            Date.now(),
          )
        ) {
          return;
        }
        onLocalPositionObserved?.(message.positionMs);
        return;
      }
      if (message.type === 'seek') {
        return;
      }
      if (message.type === 'ended') {
        onEnded?.();
        return;
      }
      onError?.('SoundCloud could not play this track.');
    },
    [handleReady, onEnded, onError, onLocalPositionObserved],
  );

  const handleNavigationRequest = useCallback(
    (request: WebViewNavigation) => {
      const url = request.mainDocumentURL || request.url;
      if (isPlayerNavigation(url)) return true;
      const openExternal = async () => {
        const [openError] = await safeWrapAsync(Linking.openURL(url));
        if (openError) {
          onError?.('This SoundCloud link could not be opened on this device.');
        }
      };
      void openExternal();
      return false;
    },
    [onError],
  );

  return (
    <View
      style={{
        backgroundColor: '#000000',
        height,
        overflow: 'hidden',
        width,
      }}
    >
      <WebView
        ref={playerRef}
        allowsInlineMediaPlayback
        allowsLinkPreview={false}
        bounces={false}
        mediaPlaybackRequiresUserAction={false}
        onError={() => onError?.('Could not load the SoundCloud player.')}
        onHttpError={() => onError?.('Could not load the SoundCloud player.')}
        onMessage={handlePlayerMessage}
        onShouldStartLoadWithRequest={handleNavigationRequest}
        originWhitelist={['https://*']}
        scrollEnabled={false}
        setSupportMultipleWindows={false}
        source={{ baseUrl: platformUrl, html: playerHtml }}
        style={{
          backgroundColor: '#000000',
          height,
          opacity: 0.01,
          position: 'absolute',
          width,
        }}
      />
      <View pointerEvents="auto" style={{ height, width }}>
        <Image
          accessibilityIgnoresInvertColors
          resizeMode="cover"
          source={{ uri: artworkUrl }}
          style={{ height, width }}
        />
      </View>
    </View>
  );
}

interface ReadyMessage {
  type: 'ready';
}

interface ExpectedPosition {
  commandedAt: number;
  positionMs: number;
}

interface PlayingMessage {
  commanded: boolean;
  isPlaying: boolean;
  type: 'playing';
}

interface PositionMessage {
  positionMs: number;
  type: 'position';
}

interface SeekMessage {
  positionMs: number;
  type: 'seek';
}

interface EndedMessage {
  type: 'ended';
}

interface ErrorMessage {
  type: 'error';
}

type PlayerMessage =
  | EndedMessage
  | ErrorMessage
  | PlayingMessage
  | PositionMessage
  | ReadyMessage
  | SeekMessage;

function isPlayerMessage(message: unknown): message is PlayerMessage {
  if (!message || typeof message !== 'object' || !('type' in message)) {
    return false;
  }
  if (
    message.type === 'ready' ||
    message.type === 'ended' ||
    message.type === 'error'
  ) {
    return true;
  }
  if (
    message.type === 'playing' &&
    'commanded' in message &&
    typeof message.commanded === 'boolean' &&
    'isPlaying' in message &&
    typeof message.isPlaying === 'boolean'
  ) {
    return true;
  }
  return (
    (message.type === 'position' || message.type === 'seek') &&
    'positionMs' in message &&
    typeof message.positionMs === 'number'
  );
}

function seekPlayer(player: WebView | null, positionMs: number) {
  player?.injectJavaScript(
    `window.zoffSeek?.(${Math.max(0, Math.round(positionMs))}); true;`,
  );
}

function resetPlayer(player: WebView | null, positionMs: number) {
  player?.injectJavaScript(
    `window.zoffReset?.(${Math.max(0, Math.round(positionMs))}); true;`,
  );
}

function shouldSuppressExpectedPosition(
  expectedPosition: RefObject<ExpectedPosition | null>,
  observedPositionMs: number,
  observedAt: number,
) {
  const expected = expectedPosition.current;
  if (!expected) return false;
  const isAligned =
    Math.abs(observedPositionMs - expected.positionMs) <=
    expectedPositionToleranceMs;
  const didTimeOut =
    observedAt - expected.commandedAt >= expectedPositionTimeoutMs;
  if (isAligned || didTimeOut) {
    expectedPosition.current = null;
    return false;
  }
  return true;
}

function isPlayerNavigation(url: string) {
  return allowedPlayerUrls.some((allowedUrl) => url.startsWith(allowedUrl));
}

function getPlayerHtml(sourceId: string, providerUrl?: string) {
  const trackUrl =
    providerUrl ??
    (sourceId.startsWith('http')
      ? sourceId
      : `https://api.soundcloud.com/tracks/${sourceId}`);
  const widgetUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(trackUrl)}&auto_play=false&visual=false&show_artwork=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false`;
  const serializedWidgetUrl = JSON.stringify(widgetUrl);
  return `<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
    <style>
      html, body, #player { background: #000; border: 0; height: 100%; margin: 0; overflow: hidden; padding: 0; width: 100%; }
    </style>
  </head>
  <body>
    <iframe id="player" allow="autoplay; encrypted-media"></iframe>
    <script src="https://w.soundcloud.com/player/api.js"></script>
    <script>
      let ready = false;
      let shouldPlay = false;
      let initialPositionMs = 0;
      let expectedPlayingState = null;
      let expectedSeekPositionMs = null;
      const playerElement = document.getElementById('player');
      playerElement.src = ${serializedWidgetUrl};
      const player = SC.Widget(playerElement);
      const post = (message) => window.ReactNativeWebView.postMessage(JSON.stringify(message));
      const syncPlayback = () => {
        if (!ready) return;
        if (shouldPlay) player.play();
        else player.pause();
      };
      window.zoffSetPlaying = (playing) => {
        shouldPlay = playing;
        expectedPlayingState = playing;
        syncPlayback();
      };
      window.zoffSeek = (positionMs) => {
        initialPositionMs = Math.max(0, positionMs);
        expectedSeekPositionMs = initialPositionMs;
        if (ready) player.seekTo(initialPositionMs);
      };
      window.zoffReset = (positionMs) => {
        initialPositionMs = Math.max(0, positionMs);
        expectedSeekPositionMs = initialPositionMs;
        if (!ready) return;
        player.setVolume(100);
        player.seekTo(initialPositionMs);
        syncPlayback();
      };
      player.bind(SC.Widget.Events.READY, () => {
        ready = true;
        if (initialPositionMs > 0) {
          expectedSeekPositionMs = initialPositionMs;
          player.seekTo(initialPositionMs);
        }
        post({ type: 'ready' });
      });
      player.bind(SC.Widget.Events.PLAY, () => {
        const commanded = expectedPlayingState === true;
        expectedPlayingState = null;
        post({ type: 'playing', isPlaying: true, commanded });
      });
      player.bind(SC.Widget.Events.PAUSE, () => {
        const commanded = expectedPlayingState === false;
        expectedPlayingState = null;
        post({ type: 'playing', isPlaying: false, commanded });
      });
      player.bind(SC.Widget.Events.PLAY_PROGRESS, (event) => {
        if (Number.isFinite(event.currentPosition)) {
          post({ type: 'position', positionMs: Math.round(event.currentPosition) });
        }
      });
      player.bind(SC.Widget.Events.SEEK, () => {
        player.getPosition((positionMs) => {
          const roundedPositionMs = Math.round(positionMs);
          if (
            expectedSeekPositionMs !== null &&
            Math.abs(roundedPositionMs - expectedSeekPositionMs) <= ${expectedSeekToleranceMs}
          ) {
            expectedSeekPositionMs = null;
            return;
          }
          expectedSeekPositionMs = null;
          post({ type: 'seek', positionMs: roundedPositionMs });
        });
      });
      player.bind(SC.Widget.Events.FINISH, () => post({ type: 'ended' }));
      player.bind(SC.Widget.Events.ERROR, () => post({ type: 'error' }));
    </script>
  </body>
</html>`;
}

const platformUrl = 'https://zoff.me';
const seekChangeThreshold = 5_000;
const expectedSeekToleranceMs = 1_000;
const expectedPositionToleranceMs = 5_000;
const expectedPositionTimeoutMs = 8_000;
const allowedPlayerUrls = [
  'about:blank',
  platformUrl,
  'https://w.soundcloud.com/',
];
