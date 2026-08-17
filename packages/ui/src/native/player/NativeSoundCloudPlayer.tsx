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

export interface NativeSoundCloudPlayerProps {
  artworkUrl: string;
  blankArtworkColor?: string;
  height: number;
  interactive?: boolean;
  isPlaying: boolean;
  onEnded?: () => void;
  onError?: (message: string) => void;
  onLocalPositionObserved?: (positionMs: number) => void;
  onLocalSeek?: (positionMs: number) => void;
  onPlayingChange?: (isPlaying: boolean) => void;
  positionMs: number;
  providerUrl?: string;
  resetVersion: number | string;
  sourceId: string;
  synchronizePosition: boolean;
  width: number;
}

export function NativeSoundCloudPlayer({
  artworkUrl,
  blankArtworkColor = '#000000',
  height,
  interactive = true,
  isPlaying,
  onEnded,
  onError,
  onLocalPositionObserved,
  onLocalSeek,
  onPlayingChange,
  positionMs,
  providerUrl,
  resetVersion,
  sourceId,
  synchronizePosition,
  width,
}: NativeSoundCloudPlayerProps) {
  const playerRef = useRef<WebView>(null);
  const desiredPlaying = useRef(isPlaying);
  const expectedPosition = useRef<ExpectedPosition | null>(null);
  const lastResetVersion = useRef<number | string>(resetVersion);
  const latestPosition = useRef(positionMs);
  const previousPosition = useRef(positionMs);
  const initialTrackUrl = useRef(
    getSoundCloudTrackUrl(sourceId, providerUrl),
  ).current;
  const initialArtworkUrl = useRef(artworkUrl).current;
  const loadedTrackUrl = useRef(initialTrackUrl);
  const [ready, setReady] = useState(false);
  const trackUrl = getSoundCloudTrackUrl(sourceId, providerUrl);
  const widgetHeight = Math.min(height, widgetHeightPixels);
  const artworkHeight = Math.max(0, height - widgetHeight);
  const playerHtml = useMemo(
    () =>
      getPlayerHtml(
        initialTrackUrl,
        initialArtworkUrl,
        artworkHeight,
        blankArtworkColor,
      ),
    [artworkHeight, blankArtworkColor, initialArtworkUrl, initialTrackUrl],
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
    playerRef.current?.injectJavaScript(
      `window.zoffSeek?.(${Math.max(0, Math.round(nextPositionMs))}); true;`,
    );
  }, []);

  useEffect(() => {
    if (!ready || loadedTrackUrl.current === trackUrl) return;
    loadedTrackUrl.current = trackUrl;
    setReady(false);
    playerRef.current?.injectJavaScript(
      `window.zoffLoad?.(${JSON.stringify(trackUrl)}, ${JSON.stringify(artworkUrl)}); true;`,
    );
  }, [artworkUrl, ready, trackUrl]);

  useEffect(() => {
    desiredPlaying.current = isPlaying;
    if (!ready) return;
    setPlayerPlaying(isPlaying);
  }, [isPlaying, ready, setPlayerPlaying]);

  useEffect(() => {
    latestPosition.current = positionMs;
    const positionChanged = Math.abs(positionMs - previousPosition.current);
    previousPosition.current = positionMs;
    if (
      !ready ||
      !synchronizePosition ||
      positionChanged < seekChangeThreshold
    ) {
      return;
    }
    seekToPosition(positionMs);
  }, [positionMs, ready, seekToPosition, synchronizePosition]);

  useEffect(() => {
    if (!ready || lastResetVersion.current === resetVersion) return;
    lastResetVersion.current = resetVersion;
    expectedPosition.current = {
      commandedAt: Date.now(),
      positionMs,
    };
    playerRef.current?.injectJavaScript(
      `window.zoffReset?.(${Math.max(0, Math.round(positionMs))}, ${desiredPlaying.current ? 'true' : 'false'}); true;`,
    );
  }, [positionMs, ready, resetVersion]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active' || !ready) return;
      playerRef.current?.injectJavaScript(
        `window.zoffReset?.(${Math.max(0, Math.round(latestPosition.current))}, ${desiredPlaying.current ? 'true' : 'false'}); true;`,
      );
    });
    return () => subscription.remove();
  }, [ready]);

  const handleReady = useCallback(() => {
    setReady(true);
    playerRef.current?.injectJavaScript(
      `window.zoffInitialize?.(${Math.max(0, Math.round(latestPosition.current))}, ${desiredPlaying.current ? 'true' : 'false'}); true;`,
    );
  }, []);

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
        if (!message.commanded) onPlayingChange?.(message.isPlaying);
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
        if (!message.commanded) onLocalSeek?.(message.positionMs);
        return;
      }
      if (message.type === 'ended') {
        onEnded?.();
        return;
      }
      onError?.('SoundCloud could not play this track.');
    },
    [
      handleReady,
      onEnded,
      onError,
      onLocalPositionObserved,
      onLocalSeek,
      onPlayingChange,
    ],
  );

  const handleNavigationRequest = useCallback(
    (request: WebViewNavigation) => {
      const url = request.mainDocumentURL || request.url;
      if (url.startsWith('about:') || isPlayerNavigation(url)) return true;
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
      className="overflow-hidden"
      style={{
        backgroundColor: blankArtworkColor,
        height,
        width,
      }}
    >
      <View
        pointerEvents={interactive ? 'auto' : 'none'}
        style={{ height, width }}
      >
        <WebView
          ref={playerRef}
          allowsInlineMediaPlayback
          allowsLinkPreview={false}
          allowsProtectedMedia
          bounces={false}
          mediaPlaybackRequiresUserAction={false}
          onError={() => onError?.('Could not load the SoundCloud player.')}
          onHttpError={() => onError?.('Could not load the SoundCloud player.')}
          onMessage={handlePlayerMessage}
          onShouldStartLoadWithRequest={handleNavigationRequest}
          originWhitelist={['about:*', 'https://*']}
          scrollEnabled={false}
          setSupportMultipleWindows={false}
          source={{ baseUrl: platformUrl, html: playerHtml }}
          style={{
            backgroundColor: blankArtworkColor,
            height,
            width,
          }}
        />
      </View>
    </View>
  );
}

interface ExpectedPosition {
  commandedAt: number;
  positionMs: number;
}

interface ReadyMessage {
  type: 'ready';
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
  commanded: boolean;
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
  if (
    (message.type === 'position' || message.type === 'seek') &&
    'positionMs' in message &&
    typeof message.positionMs === 'number'
  ) {
    return (
      message.type === 'position' ||
      ('commanded' in message && typeof message.commanded === 'boolean')
    );
  }
  return false;
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

function getSoundCloudTrackUrl(sourceId: string, providerUrl?: string) {
  if (providerUrl) return providerUrl;
  if (sourceId.startsWith('http')) return sourceId;
  const trackId = sourceId.replace(soundCloudTrackUrnPattern, '');
  return `https://api.soundcloud.com/tracks/${trackId}`;
}

function isPlayerNavigation(url: string) {
  return allowedPlayerUrls.some((allowedUrl) => url.startsWith(allowedUrl));
}

function getPlayerHtml(
  trackUrl: string,
  artworkUrl: string,
  artworkHeight: number,
  blankArtworkColor: string,
) {
  const widgetUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(trackUrl)}&auto_play=false&single_active=false&visual=false&show_artwork=true&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`;
  const artworkMarkup =
    artworkHeight >= minimumArtworkHeight
      ? `<img id="artwork" src=${JSON.stringify(artworkUrl)} alt="" />`
      : '';
  return `<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
    <style>
      html, body { background: ${blankArtworkColor}; height: 100%; margin: 0; overflow: hidden; padding: 0; width: 100%; }
      #artwork-frame { align-items: center; display: flex; height: ${artworkHeight}px; justify-content: center; width: 100%; }
      #artwork { height: 100%; object-fit: contain; width: 100%; }
      #player {
        border: 0;
        display: block;
        height: ${widgetHeightPixels}px;
        transform: translateZ(0);
        -webkit-transform: translateZ(0);
        will-change: opacity;
        width: 100%;
      }
    </style>
  </head>
  <body>
    <div id="artwork-frame">${artworkMarkup}</div>
    <iframe id="player" allow="autoplay; encrypted-media" src=${JSON.stringify(widgetUrl)}></iframe>
    <script src="https://w.soundcloud.com/player/api.js"></script>
    <script>
      const playerFrame = document.getElementById('player');
      const player = SC.Widget(playerFrame);
      const post = (message) => window.ReactNativeWebView.postMessage(JSON.stringify(message));
      let ready = false;
      let shouldPlay = false;
      let pendingSeekMs = null;
      let expectedPlayingState = null;
      let expectedSeekCommandedAt = 0;
      let expectedSeekPositionMs = null;
      let expectedSeekRetryCount = 0;
      let expectedSeekRetryTimer = null;
      let restartTimer = null;
      let restartAfterExpectedSeek = false;
      let seekRestartTimer = null;
      let initializationTimer = null;
      let progressWatchdogTimer = null;
      let progressRecoveryAttempts = 0;
      let widgetPlaying = false;
      let lastPaintRefreshAt = 0;
      let paintRefreshPhase = false;

      const refreshPlayerPaint = () => {
        const now = Date.now();
        if (now - lastPaintRefreshAt < ${paintRefreshIntervalMs}) return;
        lastPaintRefreshAt = now;
        paintRefreshPhase = !paintRefreshPhase;
        playerFrame.style.opacity = paintRefreshPhase ? '0.999' : '1';
      };

      const clearProgressWatchdog = () => {
        if (progressWatchdogTimer === null) return;
        clearTimeout(progressWatchdogTimer);
        progressWatchdogTimer = null;
      };
      const watchForProgress = () => {
        clearProgressWatchdog();
        if (progressRecoveryAttempts >= ${maximumProgressRecoveryAttempts}) {
          return;
        }
        progressWatchdogTimer = setTimeout(() => {
          progressWatchdogTimer = null;
          if (!ready || !shouldPlay || !widgetPlaying) return;
          progressRecoveryAttempts += 1;
          player.pause();
          setTimeout(() => {
            if (!ready || !shouldPlay) return;
            expectedPlayingState = true;
            player.play();
          }, ${seekRestartDelayMs});
        }, ${progressStartTimeoutMs});
      };

      const setPosition = (positionMs) => {
        const nextPositionMs = Math.max(0, positionMs);
        expectedSeekCommandedAt = Date.now();
        expectedSeekPositionMs = nextPositionMs;
        expectedSeekRetryCount = 0;
        if (expectedSeekRetryTimer !== null) {
          clearTimeout(expectedSeekRetryTimer);
          expectedSeekRetryTimer = null;
        }
        restartAfterExpectedSeek = shouldPlay && widgetPlaying;
        player.seekTo(nextPositionMs);
      };
      const syncPlayback = () => {
        if (!ready) return;
        if (pendingSeekMs !== null) {
          setPosition(pendingSeekMs);
          pendingSeekMs = null;
        }
        if (!shouldPlay) {
          clearProgressWatchdog();
          if (restartTimer !== null) {
            clearTimeout(restartTimer);
            restartTimer = null;
          }
          if (seekRestartTimer !== null) {
            clearTimeout(seekRestartTimer);
            seekRestartTimer = null;
          }
          expectedPlayingState = false;
          player.pause();
          return;
        }
        expectedPlayingState = true;
        player.play();
      };
      const markReady = () => {
        if (ready) return;
        ready = true;
        post({ type: 'ready' });
      };

      window.zoffInitialize = (positionMs, playing) => {
        pendingSeekMs = Math.max(0, positionMs);
        shouldPlay = playing;
        if (initializationTimer !== null) clearTimeout(initializationTimer);
        initializationTimer = setTimeout(() => {
          initializationTimer = null;
          syncPlayback();
        }, ${initializationDelayMs});
      };
      window.zoffSetPlaying = (playing) => {
        shouldPlay = playing;
        if (initializationTimer !== null) return;
        syncPlayback();
      };
      window.zoffSeek = (positionMs) => {
        pendingSeekMs = Math.max(0, positionMs);
        if (initializationTimer !== null) return;
        syncPlayback();
      };
      window.zoffReset = (positionMs, playing) => {
        if (initializationTimer !== null) {
          clearTimeout(initializationTimer);
          initializationTimer = null;
        }
        shouldPlay = playing;
        pendingSeekMs = Math.max(0, positionMs);
        if (!ready) return;
        player.setVolume(100);
        syncPlayback();
      };
      window.zoffLoad = (nextTrackUrl, nextArtworkUrl) => {
        ready = false;
        pendingSeekMs = null;
        restartAfterExpectedSeek = false;
        clearProgressWatchdog();
        progressRecoveryAttempts = 0;
        widgetPlaying = false;
        expectedSeekRetryCount = 0;
        if (expectedSeekRetryTimer !== null) {
          clearTimeout(expectedSeekRetryTimer);
          expectedSeekRetryTimer = null;
        }
        if (initializationTimer !== null) {
          clearTimeout(initializationTimer);
          initializationTimer = null;
        }
        if (seekRestartTimer !== null) {
          clearTimeout(seekRestartTimer);
          seekRestartTimer = null;
        }
        const artwork = document.getElementById('artwork');
        if (artwork) artwork.src = nextArtworkUrl;
        player.load(nextTrackUrl, {
          auto_play: false,
          hide_related: true,
          show_artwork: true,
          show_comments: false,
          show_reposts: false,
          show_teaser: false,
          show_user: true,
          single_active: false,
          visual: false,
          callback: markReady,
        });
      };

      player.bind(SC.Widget.Events.READY, markReady);
      player.bind(SC.Widget.Events.PLAY, () => {
        widgetPlaying = true;
        if (!shouldPlay) {
          expectedPlayingState = false;
          player.pause();
          return;
        }
        if (restartTimer !== null) {
          clearTimeout(restartTimer);
          restartTimer = null;
        }
        const commanded = expectedPlayingState === true;
        expectedPlayingState = null;
        watchForProgress();
        post({ type: 'playing', isPlaying: true, commanded });
      });
      player.bind(SC.Widget.Events.PAUSE, () => {
        clearProgressWatchdog();
        widgetPlaying = false;
        if (shouldPlay) {
          if (restartTimer === null) {
            restartTimer = setTimeout(() => {
              restartTimer = null;
              if (!ready || !shouldPlay) return;
              expectedPlayingState = true;
              player.play();
            }, ${pauseRecoveryDelayMs});
          }
          return;
        }
        const commanded = expectedPlayingState === false;
        expectedPlayingState = null;
        post({ type: 'playing', isPlaying: false, commanded });
      });
      player.bind(SC.Widget.Events.PLAY_PROGRESS, (event) => {
        if (!Number.isFinite(event.currentPosition)) return;
        refreshPlayerPaint();
        clearProgressWatchdog();
        progressRecoveryAttempts = 0;
        const shouldRetryExpectedSeek =
          expectedSeekPositionMs !== null &&
          expectedSeekRetryCount < ${maximumExpectedSeekRetries} &&
          Date.now() - expectedSeekCommandedAt >= ${expectedSeekRetryDelayMs} &&
          Math.abs(event.currentPosition - expectedSeekPositionMs) > ${expectedSeekToleranceMs};
        if (shouldRetryExpectedSeek) {
          expectedSeekRetryCount += 1;
          expectedSeekCommandedAt = Date.now();
          restartAfterExpectedSeek = shouldPlay;
          player.seekTo(expectedSeekPositionMs);
          return;
        }
        post({ type: 'position', positionMs: Math.round(event.currentPosition) });
      });
      player.bind(SC.Widget.Events.SEEK, () => {
        player.getPosition((positionMs) => {
          const roundedPositionMs = Math.round(positionMs);
          const commanded =
            expectedSeekPositionMs !== null &&
            Date.now() - expectedSeekCommandedAt <= ${expectedSeekCommandWindowMs} &&
            Math.abs(roundedPositionMs - expectedSeekPositionMs) <= ${expectedSeekToleranceMs};
          const failedExpectedSeek =
            expectedSeekPositionMs !== null &&
            Date.now() - expectedSeekCommandedAt <= ${expectedSeekCommandWindowMs} &&
            !commanded;
          if (
            failedExpectedSeek &&
            expectedSeekRetryCount < ${maximumExpectedSeekRetries}
          ) {
            const retryPositionMs = expectedSeekPositionMs;
            expectedSeekRetryCount += 1;
            if (expectedSeekRetryTimer !== null) {
              clearTimeout(expectedSeekRetryTimer);
            }
            expectedSeekRetryTimer = setTimeout(() => {
              expectedSeekRetryTimer = null;
              expectedSeekCommandedAt = Date.now();
              restartAfterExpectedSeek = shouldPlay;
              player.seekTo(retryPositionMs);
            }, ${expectedSeekRetryDelayMs});
            return;
          }
          const needsRestart =
            shouldPlay && (!commanded || restartAfterExpectedSeek);
          expectedSeekCommandedAt = 0;
          expectedSeekPositionMs = null;
          expectedSeekRetryCount = 0;
          if (expectedSeekRetryTimer !== null) {
            clearTimeout(expectedSeekRetryTimer);
            expectedSeekRetryTimer = null;
          }
          restartAfterExpectedSeek = false;
          post({ commanded, type: 'seek', positionMs: roundedPositionMs });
          if (needsRestart) {
            player.pause();
            if (seekRestartTimer !== null) clearTimeout(seekRestartTimer);
            seekRestartTimer = setTimeout(() => {
              seekRestartTimer = null;
              if (!ready || !shouldPlay) return;
              expectedPlayingState = true;
              player.play();
            }, ${seekRestartDelayMs});
          }
        });
      });
      player.bind(SC.Widget.Events.FINISH, () => post({ type: 'ended' }));
      player.bind(SC.Widget.Events.ERROR, () => post({ type: 'error' }));
    </script>
  </body>
</html>`;
}

const platformUrl = 'https://zoff.me';
const soundCloudTrackUrnPattern = /^(?:soundcloud:tracks:)+/;
const widgetHeightPixels = 166;
const minimumArtworkHeight = 96;
const seekChangeThreshold = 5_000;
const expectedSeekToleranceMs = 1_000;
const expectedSeekCommandWindowMs = 2_000;
const expectedSeekRetryDelayMs = 300;
const expectedPositionToleranceMs = 5_000;
const expectedPositionTimeoutMs = 8_000;
const pauseRecoveryDelayMs = 350;
const initializationDelayMs = 300;
const seekRestartDelayMs = 100;
const progressStartTimeoutMs = 1_200;
const maximumProgressRecoveryAttempts = 2;
const maximumExpectedSeekRetries = 3;
const paintRefreshIntervalMs = 500;
const allowedPlayerUrls = [platformUrl, 'https://w.soundcloud.com/'];
