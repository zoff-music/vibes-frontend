import { safeWrap, safeWrapAsync } from '@vibes/shared';
import {
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState, Linking, Pressable, Text, View } from 'react-native';
import {
  WebView,
  type WebViewMessageEvent,
  type WebViewNavigation,
} from 'react-native-webview';
import { escapePlayerAttribute } from './html';

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
  const [blocked, setBlocked] = useState(isPlaying);
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
    setBlocked(false);
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
    expectedPosition.current = {
      commandedAt: Date.now(),
      positionMs: latestPosition.current,
    };
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

      if (message.type === 'blocked') {
        setBlocked(message.blocked);

        return;
      }

      if (message.type === 'playing') {
        if (message.isPlaying) setBlocked(false);
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
      {blocked && interactive && isPlaying && (
        <View className="absolute inset-0 items-center justify-center bg-black">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Click to play SoundCloud"
            className="rounded-full border border-white/30 bg-black/80 px-5 py-2 active:bg-black"
            onPress={() => {
              setBlocked(false);
              expectedPosition.current = {
                commandedAt: Date.now(),
                positionMs: latestPosition.current,
              };
              playerRef.current?.injectJavaScript(
                `window.zoffRetry?.(${Math.max(0, Math.round(latestPosition.current))}); true;`,
              );
            }}
          >
            <Text className="text-sm text-white">▶ Click to play</Text>
          </Pressable>
        </View>
      )}
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

interface BlockedMessage {
  blocked: boolean;
  type: 'blocked';
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
  | BlockedMessage
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
    message.type === 'blocked' &&
    'blocked' in message &&
    typeof message.blocked === 'boolean'
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
      ? `<img id="artwork" src="${escapePlayerAttribute(artworkUrl)}" alt="" />`
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
    <iframe id="player" allow="autoplay; encrypted-media" src="${escapePlayerAttribute(widgetUrl)}"></iframe>
    <script src="https://w.soundcloud.com/player/api.js"></script>
    <script>
      const playerFrame = document.getElementById('player');
      const player = SC.Widget(playerFrame);
      const post = (message) => window.ReactNativeWebView.postMessage(JSON.stringify(message));
      let ready = false;
      let loading = false;
      let shouldPlay = false;
      let pendingSeekMs = null;
      let pendingSeekAt = 0;
      let expectedSeekCommandedAt = 0;
      let expectedSeekPositionMs = null;
      let expectedSeekRetryCount = 0;
      let lastSeekAt = 0;
      let generation = 0;
      let positionRequestAt = 0;
      let lastSamplePosition = null;
      let lastSampleAt = 0;
      let lastProgressAt = 0;
      let startupAt = 0;
      let started = false;
      let widgetPlaying = false;
      let commandedPlaying = false;
      let pauseTimer = null;
      let blocked = false;
      let lastPaintRefreshAt = 0;
      let paintRefreshPhase = false;

      const refreshPlayerPaint = () => {
        const now = Date.now();
        if (now - lastPaintRefreshAt < ${paintRefreshIntervalMs}) return;
        lastPaintRefreshAt = now;
        paintRefreshPhase = !paintRefreshPhase;
        playerFrame.style.opacity = paintRefreshPhase ? '0.999' : '1';
      };

      const setBlocked = (nextBlocked) => {
        if (blocked === nextBlocked) return;
        blocked = nextBlocked;
        post({type: 'blocked', blocked});
      };
      const queuePosition = (positionMs) => {
        if (!Number.isFinite(positionMs)) return;
        pendingSeekMs = Math.max(0, positionMs);
        pendingSeekAt = Date.now();
        expectedSeekRetryCount = 0;
      };
      const flushPosition = () => {
        if (!ready || pendingSeekMs === null || (shouldPlay && !started)) return;
        const now = Date.now();
        if (now - lastSeekAt < ${minimumSeekIntervalMs}) return;
        const target = pendingSeekMs + (shouldPlay ? now - pendingSeekAt : 0);
        pendingSeekMs = null;
        expectedSeekPositionMs = target;
        expectedSeekCommandedAt = now;
        lastSeekAt = now;
        lastSamplePosition = null;
        startupAt = now;
        player.seekTo(target);
      };
      const syncPlayback = () => {
        if (!ready) return;
        clearTimeout(pauseTimer);
        pauseTimer = null;
        if (!shouldPlay) {
          setBlocked(false);
          widgetPlaying = false;
          commandedPlaying = true;
          player.pause();
          flushPosition();
          return;
        }
        if (widgetPlaying) {
          flushPosition();
          return;
        }
        startupAt = Date.now();
        commandedPlaying = true;
        player.play();
        flushPosition();
      };
      const markReady = () => {
        if (ready) return;
        ready = true;
        post({ type: 'ready' });
      };

      window.zoffInitialize = (positionMs, playing) => {
        queuePosition(positionMs);
        shouldPlay = playing;
        syncPlayback();
      };
      window.zoffSetPlaying = (playing) => {
        if (shouldPlay === playing) return;
        shouldPlay = playing;
        syncPlayback();
      };
      window.zoffSeek = (positionMs) => {
        queuePosition(positionMs);
        flushPosition();
      };
      window.zoffReset = (positionMs, playing) => {
        shouldPlay = playing;
        queuePosition(positionMs);
        if (!ready) return;
        player.setVolume(100);
        syncPlayback();
      };
      window.zoffRetry = (positionMs) => {
        setBlocked(false);
        started = false;
        lastSamplePosition = null;
        shouldPlay = true;
        queuePosition(positionMs);
        syncPlayback();
      };
      window.zoffLoad = (nextTrackUrl, nextArtworkUrl) => {
        clearTimeout(pauseTimer);
        pauseTimer = null;
        ready = false;
        loading = true;
        generation += 1;
        const loadGeneration = generation;
        pendingSeekMs = null;
        positionRequestAt = 0;
        lastSamplePosition = null;
        lastProgressAt = 0;
        lastSeekAt = 0;
        started = false;
        widgetPlaying = false;
        setBlocked(false);
        expectedSeekPositionMs = null;
        expectedSeekCommandedAt = 0;
        expectedSeekRetryCount = 0;
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
          callback: () => {
            if (generation !== loadGeneration) return;
            loading = false;
            markReady();
          },
        });
      };

      player.bind(SC.Widget.Events.READY, () => {
        if (!loading) markReady();
      });
      player.bind(SC.Widget.Events.PLAY, () => {
        if (!ready) return;
        clearTimeout(pauseTimer);
        pauseTimer = null;
        if (!shouldPlay) {
          shouldPlay = true;
          commandedPlaying = false;
        }
        startupAt = Date.now();
        lastSamplePosition = null;
      });
      player.bind(SC.Widget.Events.PAUSE, () => {
        if (!ready) return;
        const wasPlaying = widgetPlaying;
        widgetPlaying = false;
        if (!shouldPlay || Date.now() - lastSeekAt < ${seekSettlingMs}) return;
        if (wasPlaying && !commandedPlaying) {
          const pauseGeneration = generation;
          clearTimeout(pauseTimer);
          // The widget emits PAUSE before FINISH; only a persistent user
          // pause may change app playback, not a completed track.
          pauseTimer = setTimeout(() => {
            pauseTimer = null;
            if (!ready || generation !== pauseGeneration || widgetPlaying || !shouldPlay) return;
            shouldPlay = false;
            setBlocked(false);
            post({ type: 'playing', isPlaying: false, commanded: false });
          }, ${pauseConfirmationMs});
        }
      });
      player.bind(SC.Widget.Events.PLAY_PROGRESS, (event) => {
        if (!Number.isFinite(event.currentPosition)) return;
        refreshPlayerPaint();
      });
      player.bind(SC.Widget.Events.SEEK, () => {
        const seekGeneration = generation;
        player.getPosition((positionMs) => {
          if (!ready || seekGeneration !== generation || !Number.isFinite(positionMs)) return;
          const roundedPositionMs = Math.round(positionMs);
          const commanded =
            expectedSeekPositionMs !== null || pendingSeekMs !== null ||
            Date.now() - lastSeekAt < ${seekSettlingMs};
          lastSamplePosition = null;
          startupAt = Date.now();
          post({ commanded, type: 'seek', positionMs: roundedPositionMs });
        });
      });
      setInterval(() => {
        if (!ready) return;
        const now = Date.now();
        flushPosition();
        if (shouldPlay && now - Math.max(lastProgressAt, startupAt) > ${progressStartTimeoutMs}) {
          setBlocked(true);
          widgetPlaying = false;
        }
        if (positionRequestAt && now - positionRequestAt < ${positionRequestTimeoutMs}) return;
        const requestGeneration = generation;
        const requestedAt = now;
        positionRequestAt = requestedAt;
        player.getPosition((positionMs) => {
          if (!ready || requestGeneration !== generation || positionRequestAt !== requestedAt) return;
          positionRequestAt = 0;
          if (!Number.isFinite(positionMs)) return;
          const observedAt = Date.now();
          const delta = lastSamplePosition === null ? 0 : positionMs - lastSamplePosition;
          const elapsed = observedAt - lastSampleAt;
          lastSamplePosition = positionMs;
          lastSampleAt = observedAt;
          const progressed = delta > 20 && delta <= elapsed * 2 + 500;
          if (shouldPlay && progressed) {
            lastProgressAt = observedAt;
            started = true;
            setBlocked(false);
            if (!widgetPlaying) {
              widgetPlaying = true;
              post({type: 'playing', isPlaying: true, commanded: commandedPlaying});
              commandedPlaying = false;
            }
          }
          if (expectedSeekPositionMs !== null) {
            const target = expectedSeekPositionMs + (shouldPlay ? observedAt - expectedSeekCommandedAt : 0);
            if (Math.abs(positionMs - target) <= ${expectedSeekToleranceMs}) {
              expectedSeekPositionMs = null;
            } else if (observedAt - expectedSeekCommandedAt >= ${seekSettlingMs}) {
              if (expectedSeekRetryCount < ${maximumExpectedSeekRetries}) {
                expectedSeekRetryCount += 1;
                pendingSeekMs = target;
                pendingSeekAt = observedAt;
                flushPosition();
              } else expectedSeekPositionMs = null;
            }
          }
          if (pendingSeekMs !== null || expectedSeekPositionMs !== null || (shouldPlay && !widgetPlaying)) return;
          post({type: 'position', positionMs: Math.round(positionMs)});
        });
      }, ${positionPollIntervalMs});
      player.bind(SC.Widget.Events.FINISH, () => {
        clearTimeout(pauseTimer);
        pauseTimer = null;
        widgetPlaying = false;
        shouldPlay = false;
        setBlocked(false);
        post({ type: 'ended' });
      });
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
const minimumSeekIntervalMs = 1_000;
const seekSettlingMs = 4_000;
const expectedPositionToleranceMs = 5_000;
const expectedPositionTimeoutMs = 8_000;
const progressStartTimeoutMs = 10_000;
const positionPollIntervalMs = 500;
const positionRequestTimeoutMs = 2_000;
const pauseConfirmationMs = 250;
const maximumExpectedSeekRetries = 3;
const paintRefreshIntervalMs = 500;
const allowedPlayerUrls = [platformUrl, 'https://w.soundcloud.com/'];
