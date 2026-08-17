import { safeWrap, safeWrapAsync } from '@vibes/shared';
import {
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState, Linking, View } from 'react-native';
import {
  WebView,
  type WebViewMessageEvent,
  type WebViewNavigation,
} from 'react-native-webview';

export interface NativeYouTubePlayerProps {
  height: number;
  isPlaying: boolean;
  onError?: (message: string) => void;
  onLocalPositionObserved?: (positionMs: number) => void;
  onLocalSeek?: (positionMs: number) => void;
  onPlayingChange?: (isPlaying: boolean) => void;
  positionMs: number;
  resetVersion: number | string;
  sourceId: string;
  synchronizePosition: boolean;
  width: number;
}

export function NativeYouTubePlayer({
  height,
  isPlaying,
  onError,
  onLocalPositionObserved,
  onLocalSeek,
  onPlayingChange,
  positionMs,
  resetVersion,
  sourceId,
  synchronizePosition,
  width,
}: NativeYouTubePlayerProps) {
  const playerRef = useRef<WebView>(null);
  const previousPosition = useRef(positionMs);
  const previousObservedPosition = useRef<ObservedPosition | null>(null);
  const expectedPosition = useRef<ExpectedPosition | null>(null);
  const lastReportedSeekAt = useRef(0);
  const lastResetVersion = useRef<number | string>(resetVersion);
  const appState = useRef(AppState.currentState);
  const desiredPlaying = useRef(isPlaying);
  const pendingPlayingCommand = useRef<boolean | null>(null);
  const initialSourceId = useRef(sourceId).current;
  const loadedSourceId = useRef(sourceId);
  const [ready, setReady] = useState(false);
  const playerHtml = useMemo(
    () => getPlayerHtml(initialSourceId),
    [initialSourceId],
  );

  const setPlayerPlaying = useCallback((playing: boolean) => {
    pendingPlayingCommand.current = playing;
    playerRef.current?.injectJavaScript(
      `window.zoffSetPlaying?.(${playing ? 'true' : 'false'}); true;`,
    );
  }, []);

  const seekToPosition = useCallback((nextPositionMs: number) => {
    expectedPosition.current = {
      commandedAt: Date.now(),
      positionMs: nextPositionMs,
    };
    previousObservedPosition.current = null;
    seekPlayer(playerRef.current, nextPositionMs);
  }, []);

  useEffect(() => {
    desiredPlaying.current = isPlaying;
    if (!ready) return;
    setPlayerPlaying(isPlaying);
  }, [isPlaying, ready, setPlayerPlaying]);

  useEffect(() => {
    if (!ready || loadedSourceId.current === sourceId) return;
    loadedSourceId.current = sourceId;
    expectedPosition.current = {
      commandedAt: Date.now(),
      positionMs,
    };
    previousObservedPosition.current = null;
    pendingPlayingCommand.current = isPlaying;
    playerRef.current?.injectJavaScript(
      `window.zoffLoad?.(${JSON.stringify(sourceId)}, ${Math.max(0, positionMs)}, ${isPlaying ? 'true' : 'false'}); true;`,
    );
  }, [isPlaying, positionMs, ready, sourceId]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      appState.current = nextState;
      if (nextState !== 'active' || !desiredPlaying.current) return;
      setPlayerPlaying(true);
    });
    return () => subscription.remove();
  }, [setPlayerPlaying]);

  useEffect(() => {
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
    previousObservedPosition.current = null;
    resetPlayer(playerRef.current, positionMs);
  }, [positionMs, ready, resetVersion]);

  const handleReady = useCallback(() => {
    setReady(true);
    seekToPosition(positionMs);
    setPlayerPlaying(desiredPlaying.current);
  }, [positionMs, seekToPosition, setPlayerPlaying]);

  const handlePlayingChange = useCallback(
    (playing: boolean) => {
      const pendingCommand = pendingPlayingCommand.current;
      if (pendingCommand !== null) {
        if (playing !== pendingCommand) {
          setPlayerPlaying(pendingCommand);
          return;
        }
        pendingPlayingCommand.current = null;
      }

      if (playing !== desiredPlaying.current) {
        onPlayingChange?.(playing);
      }
    },
    [onPlayingChange, setPlayerPlaying],
  );

  const handleObservedPosition = useCallback(
    (observedPositionMs: number, observedAt: number) => {
      if (
        shouldSuppressExpectedPosition(
          expectedPosition,
          observedPositionMs,
          observedAt,
        )
      ) {
        return;
      }
      onLocalPositionObserved?.(observedPositionMs);
      const positionSeconds = observedPositionMs / millisecondsPerSecond;
      const previous = previousObservedPosition.current;
      previousObservedPosition.current = { observedAt, positionSeconds };
      if (!previous || !onLocalSeek) return;
      const elapsedSeconds = desiredPlaying.current
        ? (observedAt - previous.observedAt) / millisecondsPerSecond
        : 0;
      const expectedObservedPosition =
        previous.positionSeconds + elapsedSeconds;
      const seekDistance = Math.abs(positionSeconds - expectedObservedPosition);
      if (
        seekDistance < localSeekThresholdSeconds ||
        observedAt - lastReportedSeekAt.current < localSeekDebounceMs
      ) {
        return;
      }
      lastReportedSeekAt.current = observedAt;
      onLocalSeek(observedPositionMs);
    },
    [onLocalPositionObserved, onLocalSeek],
  );

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
        handlePlayingChange(message.isPlaying);
        return;
      }
      if (message.type === 'position') {
        handleObservedPosition(message.positionMs, Date.now());
        return;
      }
      onError?.(`YouTube could not play this video: ${message.code}`);
    },
    [handleObservedPosition, handlePlayingChange, handleReady, onError],
  );

  const handleNavigationRequest = useCallback(
    (request: WebViewNavigation) => {
      const url = request.mainDocumentURL || request.url;
      if (isPlayerNavigation(url)) return true;
      const openExternal = async () => {
        const [openError] = await safeWrapAsync(Linking.openURL(url));
        if (openError) {
          onError?.('This YouTube link could not be opened on this device.');
        }
      };
      void openExternal();
      return false;
    },
    [onError],
  );

  return (
    <View style={{ height, width }}>
      <WebView
        ref={playerRef}
        allowsFullscreenVideo
        allowsInlineMediaPlayback
        allowsLinkPreview={false}
        bounces={false}
        mediaPlaybackRequiresUserAction={false}
        onMessage={handlePlayerMessage}
        onShouldStartLoadWithRequest={handleNavigationRequest}
        originWhitelist={['https://*']}
        scrollEnabled={false}
        setSupportMultipleWindows={false}
        source={{ baseUrl: platformUrl, html: playerHtml }}
        className="bg-black"
      />
    </View>
  );
}

interface ObservedPosition {
  observedAt: number;
  positionSeconds: number;
}

interface ExpectedPosition {
  commandedAt: number;
  positionMs: number;
}

interface ReadyMessage {
  type: 'ready';
}

interface PlayingMessage {
  isPlaying: boolean;
  type: 'playing';
}

interface PositionMessage {
  positionMs: number;
  type: 'position';
}

interface ErrorMessage {
  code: string;
  type: 'error';
}

type PlayerMessage =
  | ErrorMessage
  | PlayingMessage
  | PositionMessage
  | ReadyMessage;

const platformUrl = 'https://zoff.me';
const millisecondsPerSecond = 1_000;
const seekChangeThreshold = 5_000;
const localSeekThresholdSeconds = 2;
const localSeekDebounceMs = 1_000;

function seekPlayer(player: WebView | null, positionMs: number) {
  player?.injectJavaScript(
    `window.zoffSeek?.(${Math.max(0, positionMs)}); true;`,
  );
}

function resetPlayer(player: WebView | null, positionMs: number) {
  player?.injectJavaScript(
    `window.zoffReset?.(${Math.max(0, positionMs)}); true;`,
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

function isPlayerMessage(message: unknown): message is PlayerMessage {
  if (!message || typeof message !== 'object' || !('type' in message)) {
    return false;
  }
  if (message.type === 'ready') return true;
  if (
    message.type === 'playing' &&
    'isPlaying' in message &&
    typeof message.isPlaying === 'boolean'
  ) {
    return true;
  }
  if (
    message.type === 'position' &&
    'positionMs' in message &&
    typeof message.positionMs === 'number'
  ) {
    return true;
  }
  return (
    message.type === 'error' &&
    'code' in message &&
    typeof message.code === 'string'
  );
}

function isPlayerNavigation(url: string) {
  return allowedPlayerUrls.some((allowedUrl) => url.startsWith(allowedUrl));
}

const allowedPlayerUrls = [
  'about:blank',
  platformUrl,
  'https://www.youtube.com/',
  'https://www.youtube-nocookie.com/',
  'https://googleads.g.doubleclick.net/',
  'https://static.doubleclick.net/',
];

function getPlayerHtml(sourceId: string) {
  const serializedSourceId = JSON.stringify(sourceId);
  const serializedOrigin = JSON.stringify(platformUrl);
  return `<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
    <style>
      html, body, #player { background: #000; height: 100%; margin: 0; overflow: hidden; padding: 0; width: 100%; }
    </style>
  </head>
  <body>
    <div id="player"></div>
    <script>
      let player;
      let ready = false;
      let sourceTransition = false;
      let shouldPlay = false;
      let initialPositionSeconds = 0;
      let resetAfterTransition = false;
      const post = (message) => window.ReactNativeWebView.postMessage(JSON.stringify(message));
      const syncPlayback = () => {
        if (!ready || !player) return;
        const state = player.getPlayerState();
        if (shouldPlay && state !== YT.PlayerState.PLAYING) player.playVideo();
        if (!shouldPlay && state === YT.PlayerState.PLAYING) player.pauseVideo();
      };
      window.zoffSetPlaying = (playing) => {
        shouldPlay = playing;
        if (sourceTransition) return;
        syncPlayback();
      };
      window.zoffSeek = (positionMs) => {
        initialPositionSeconds = Math.max(0, positionMs) / 1000;
        if (sourceTransition) return;
        if (ready && player) player.seekTo(initialPositionSeconds, true);
      };
      window.zoffReset = (positionMs) => {
        initialPositionSeconds = Math.max(0, positionMs) / 1000;
        if (!ready || !player) return;
        if (sourceTransition) {
          resetAfterTransition = true;
          return;
        }
        player.unMute();
        player.setVolume(100);
        player.seekTo(initialPositionSeconds, true);
        syncPlayback();
      };
      window.zoffLoad = (videoId, positionMs, playing) => {
        if (!ready || !player) return;
        sourceTransition = true;
        shouldPlay = playing;
        initialPositionSeconds = Math.max(0, positionMs) / 1000;
        player.loadVideoById({ videoId, startSeconds: initialPositionSeconds });
      };
      window.onYouTubeIframeAPIReady = () => {
        player = new YT.Player('player', {
          height: '100%',
          width: '100%',
          videoId: ${serializedSourceId},
          playerVars: {
            autoplay: 0,
            controls: 1,
            enablejsapi: 1,
            fs: 1,
            origin: ${serializedOrigin},
            playsinline: 1,
            rel: 0
          },
          events: {
            onReady: () => {
              ready = true;
              if (initialPositionSeconds > 0) player.seekTo(initialPositionSeconds, true);
              syncPlayback();
              post({ type: 'ready' });
            },
            onStateChange: (event) => {
              if (
                sourceTransition &&
                event.data === YT.PlayerState.PLAYING
              ) {
                sourceTransition = false;
                if (resetAfterTransition) {
                  player.unMute();
                  player.setVolume(100);
                  resetAfterTransition = false;
                }
                player.seekTo(initialPositionSeconds, true);
                syncPlayback();
              }
              if (event.data === YT.PlayerState.PLAYING) post({ type: 'playing', isPlaying: true });
              if (event.data === YT.PlayerState.PAUSED) post({ type: 'playing', isPlaying: false });
            },
            onError: (event) => post({ type: 'error', code: String(event.data) })
          }
        });
      };
      setInterval(() => {
        if (!ready || !player) return;
        const position = player.getCurrentTime();
        if (Number.isFinite(position)) post({ type: 'position', positionMs: Math.round(position * 1000) });
      }, 500);
    </script>
    <script src="https://www.youtube.com/iframe_api"></script>
  </body>
</html>`;
}

const expectedPositionToleranceMs = 5_000;
const expectedPositionTimeoutMs = 8_000;
