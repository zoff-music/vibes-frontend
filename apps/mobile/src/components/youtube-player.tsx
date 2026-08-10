import type { PlaybackState } from '@vibes/models';
import { safeWrapAsync } from '@vibes/shared';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import YoutubeIframe, {
  PLAYER_STATES,
  type YoutubeIframeRef,
} from 'react-native-youtube-iframe';

interface YouTubePlayerProps {
  height: number;
  onError: (message: string) => void;
  onLocalPositionObserved: (positionMs: number) => void;
  onLocalSeek: (positionMs: number) => void;
  onPlayingChange: (isPlaying: boolean) => void;
  playback: PlaybackState | null;
  resetVersion: number;
  sourceId: string;
  synchronizePosition: boolean;
  width: number;
}

export function YouTubePlayer({
  height,
  onError,
  onLocalPositionObserved,
  onLocalSeek,
  onPlayingChange,
  playback,
  resetVersion,
  sourceId,
  synchronizePosition,
  width,
}: YouTubePlayerProps) {
  const playerRef = useRef<YoutubeIframeRef>(null);
  const previousPosition = useRef(playback?.positionMs ?? 0);
  const previousObservedPosition = useRef<ObservedPosition | null>(null);
  const lastReportedSeekAt = useRef(0);
  const lastResetVersion = useRef(resetVersion);
  const appState = useRef(AppState.currentState);
  const desiredPlaying = useRef(playback?.isPlaying ?? false);
  const resumeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [ready, setReady] = useState(false);
  const [shouldPlay, setShouldPlay] = useState(false);

  useEffect(() => {
    const isPlaying = playback?.isPlaying ?? false;
    desiredPlaying.current = isPlaying;
    if (!ready) return;
    setShouldPlay(isPlaying);
  }, [playback?.isPlaying, ready]);

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
    const position = playback?.positionMs ?? 0;
    const positionChanged = Math.abs(position - previousPosition.current);
    previousPosition.current = position;
    if (!ready || !synchronizePosition || positionChanged < seekChangeThreshold)
      return;
    playerRef.current?.seekTo(Math.max(0, position) / 1000, true);
  }, [playback?.positionMs, ready, sourceId, synchronizePosition]);

  useEffect(() => {
    if (!ready || lastResetVersion.current === resetVersion) return;
    lastResetVersion.current = resetVersion;
    previousObservedPosition.current = null;
    playerRef.current?.seekTo(
      Math.max(0, playback?.positionMs ?? 0) / 1_000,
      true,
    );
  }, [playback?.positionMs, ready, resetVersion]);

  useEffect(() => {
    if (!ready) return;
    previousObservedPosition.current = null;
    const samplePosition = async () => {
      const player = playerRef.current;
      if (!player) return;
      const [positionError, positionSeconds] = await safeWrapAsync(
        player.getCurrentTime(),
      );
      if (positionError || positionSeconds === null) return;
      const observedAt = Date.now();
      const positionMs = Math.round(positionSeconds * 1_000);
      onLocalPositionObserved(positionMs);
      const previous = previousObservedPosition.current;
      previousObservedPosition.current = { observedAt, positionSeconds };
      if (!previous) return;
      const elapsedSeconds = shouldPlay
        ? (observedAt - previous.observedAt) / 1_000
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
      onLocalSeek(positionMs);
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
    const position = Math.max(0, playback?.positionMs ?? 0);
    if (position > 0) {
      playerRef.current?.seekTo(position / 1000, true);
    }
  }, [playback?.positionMs]);

  const handleStateChange = useCallback(
    (state: PLAYER_STATES) => {
      if (state === PLAYER_STATES.PLAYING) {
        onPlayingChange(true);
        return;
      }
      if (state === PLAYER_STATES.PAUSED && appState.current === 'active') {
        onPlayingChange(false);
      }
    },
    [onPlayingChange],
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
        onError(`YouTube could not play this video: ${error}`)
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
        scrollEnabled: false,
        setSupportMultipleWindows: false,
      }}
      webViewStyle={{ backgroundColor: '#000000' }}
      width={width}
    />
  );
}

const platformUrl = 'https://zoff.me';

const seekChangeThreshold = 5_000;

const localSeekSampleMs = 500;

const localSeekThresholdSeconds = 2;

const localSeekDebounceMs = 1_000;

interface ObservedPosition {
  observedAt: number;
  positionSeconds: number;
}
