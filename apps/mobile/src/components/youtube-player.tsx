import type { PlaybackState } from '@vibes/models';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import YoutubeIframe, {
  PLAYER_STATES,
  type YoutubeIframeRef,
} from 'react-native-youtube-iframe';

interface YouTubePlayerProps {
  height: number;
  onError: (message: string) => void;
  onPlayingChange: (isPlaying: boolean) => void;
  playback: PlaybackState | null;
  sourceId: string;
  synchronizePosition: boolean;
  width: number;
}

export function YouTubePlayer({
  height,
  onError,
  onPlayingChange,
  playback,
  sourceId,
  synchronizePosition,
  width,
}: YouTubePlayerProps) {
  const playerRef = useRef<YoutubeIframeRef>(null);
  const previousPosition = useRef(playback?.positionMs ?? 0);
  const appState = useRef(AppState.currentState);
  const desiredPlaying = useRef(playback?.isPlaying ?? false);
  const resumeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [ready, setReady] = useState(false);
  const [shouldPlay, setShouldPlay] = useState(playback?.isPlaying ?? false);

  useEffect(() => {
    const isPlaying = playback?.isPlaying ?? false;
    desiredPlaying.current = isPlaying;
    setShouldPlay(isPlaying);
  }, [playback?.isPlaying]);

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
