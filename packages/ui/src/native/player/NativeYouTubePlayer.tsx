import { safeWrapAsync } from '@vibes/shared';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Linking } from 'react-native';
import type { ShouldStartLoadRequest } from 'react-native-webview/lib/WebViewTypes';
import YoutubeIframe, {
  PLAYER_STATES,
  type YoutubeIframeRef,
} from 'react-native-youtube-iframe';

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
  const playerRef = useRef<YoutubeIframeRef>(null);
  const previousPosition = useRef(positionMs);
  const previousObservedPosition = useRef<ObservedPosition | null>(null);
  const lastReportedSeekAt = useRef(0);
  const lastResetVersion = useRef<number | string>(resetVersion);
  const appState = useRef(AppState.currentState);
  const desiredPlaying = useRef(isPlaying);
  const resumeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [ready, setReady] = useState(false);
  const [shouldPlay, setShouldPlay] = useState(false);

  useEffect(() => {
    desiredPlaying.current = isPlaying;
    if (!ready) return;
    setShouldPlay(isPlaying);
  }, [isPlaying, ready]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      appState.current = nextState;
      if (nextState !== 'active' || !desiredPlaying.current) return;
      setShouldPlay(false);
      if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
      resumeTimeout.current = setTimeout(() => setShouldPlay(true), 0);
    });
    return () => {
      subscription.remove();
      if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
    };
  }, []);

  useEffect(() => {
    const positionChanged = Math.abs(positionMs - previousPosition.current);
    previousPosition.current = positionMs;
    if (!ready || !synchronizePosition || positionChanged < seekChangeThreshold)
      return;
    playerRef.current?.seekTo(
      Math.max(0, positionMs) / millisecondsPerSecond,
      true,
    );
  }, [positionMs, ready, sourceId, synchronizePosition]);

  useEffect(() => {
    if (!ready || lastResetVersion.current === resetVersion) return;
    lastResetVersion.current = resetVersion;
    previousObservedPosition.current = null;
    playerRef.current?.seekTo(
      Math.max(0, positionMs) / millisecondsPerSecond,
      true,
    );
  }, [positionMs, ready, resetVersion]);

  useEffect(() => {
    if (!ready || (!onLocalPositionObserved && !onLocalSeek)) return;
    previousObservedPosition.current = null;
    const samplePosition = async () => {
      const player = playerRef.current;
      if (!player) return;
      const [error, positionSeconds] = await safeWrapAsync(
        player.getCurrentTime(),
      );
      if (error || positionSeconds === null) return;
      const observedAt = Date.now();
      const observedPositionMs = Math.round(
        positionSeconds * millisecondsPerSecond,
      );
      onLocalPositionObserved?.(observedPositionMs);
      const previous = previousObservedPosition.current;
      previousObservedPosition.current = { observedAt, positionSeconds };
      if (!previous || !onLocalSeek) return;
      const elapsedSeconds = shouldPlay
        ? (observedAt - previous.observedAt) / millisecondsPerSecond
        : 0;
      const expectedPosition = previous.positionSeconds + elapsedSeconds;
      const seekDistance = Math.abs(positionSeconds - expectedPosition);
      if (
        seekDistance < localSeekThresholdSeconds ||
        observedAt - lastReportedSeekAt.current < localSeekDebounceMs
      ) {
        return;
      }
      lastReportedSeekAt.current = observedAt;
      onLocalSeek(observedPositionMs);
    };
    void samplePosition();
    const interval = setInterval(
      () => void samplePosition(),
      localSeekSampleMs,
    );
    return () => clearInterval(interval);
  }, [onLocalPositionObserved, onLocalSeek, ready, shouldPlay]);

  const handleReady = useCallback(() => {
    setReady(true);
    if (positionMs > 0) {
      playerRef.current?.seekTo(
        Math.max(0, positionMs) / millisecondsPerSecond,
        true,
      );
    }
  }, [positionMs]);

  const handleStateChange = useCallback(
    (state: PLAYER_STATES) => {
      if (state === PLAYER_STATES.PLAYING) {
        onPlayingChange?.(true);
        return;
      }
      if (state === PLAYER_STATES.PAUSED && appState.current === 'active') {
        onPlayingChange?.(false);
      }
    },
    [onPlayingChange],
  );

  const handleNavigationRequest = useCallback(
    (request: ShouldStartLoadRequest) => {
      if (isPlayerNavigation(request.url)) return true;
      const openExternal = async () => {
        const [openError] = await safeWrapAsync(Linking.openURL(request.url));
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
    <YoutubeIframe
      ref={playerRef}
      baseUrlOverride={platformUrl}
      forceAndroidAutoplay
      height={height}
      initialPlayerParams={{
        controls: true,
        preventFullScreen: false,
        rel: false,
      }}
      onChangeState={handleStateChange}
      onError={(error: string) =>
        onError?.(`YouTube could not play this video: ${error}`)
      }
      onReady={handleReady}
      play={shouldPlay}
      useLocalHTML
      videoId={sourceId}
      webViewProps={{
        allowsInlineMediaPlayback: true,
        allowsLinkPreview: false,
        bounces: false,
        mediaPlaybackRequiresUserAction: false,
        onShouldStartLoadWithRequest: handleNavigationRequest,
        scrollEnabled: false,
        setSupportMultipleWindows: false,
      }}
      webViewStyle={{ backgroundColor: '#000000' }}
      width={width}
    />
  );
}

interface ObservedPosition {
  observedAt: number;
  positionSeconds: number;
}

const platformUrl = 'https://zoff.me';

const millisecondsPerSecond = 1_000;

const seekChangeThreshold = 5_000;

const localSeekSampleMs = 500;

const localSeekThresholdSeconds = 2;

const localSeekDebounceMs = 1_000;

function isPlayerNavigation(url: string) {
  return allowedPlayerUrls.some((allowedUrl) => url.startsWith(allowedUrl));
}

const allowedPlayerUrls = [
  'about:blank',
  platformUrl,
  'https://www.youtube.com/embed/',
  'https://www.youtube-nocookie.com/embed/',
];
