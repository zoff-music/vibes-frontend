import type { PlaybackState } from '@vibes/models';
import { useCallback, useEffect, useRef, useState } from 'react';
import YoutubeIframe, {
  PLAYER_STATES,
  type YoutubeIframeRef,
} from 'react-native-youtube-iframe';

interface YouTubePlayerProps {
  height: number;
  onError: (message: string) => void;
  playback: PlaybackState | null;
  sourceId: string;
  width: number;
}

export function YouTubePlayer({
  height,
  onError,
  playback,
  sourceId,
  width,
}: YouTubePlayerProps) {
  const playerRef = useRef<YoutubeIframeRef>(null);
  const previousPosition = useRef(playback?.positionMs ?? 0);
  const [playing, setPlaying] = useState(playback?.isPlaying ?? false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setPlaying(playback?.isPlaying ?? false);
  }, [playback?.isPlaying, sourceId]);

  useEffect(() => {
    const position = playback?.positionMs ?? 0;
    const positionChanged = Math.abs(position - previousPosition.current);
    previousPosition.current = position;
    if (!ready || positionChanged < seekChangeThreshold) return;
    playerRef.current?.seekTo(Math.max(0, position) / 1000, true);
  }, [playback?.positionMs, ready, sourceId]);

  const handleReady = useCallback(() => {
    setReady(true);
    const position = Math.max(0, playback?.positionMs ?? 0);
    if (position > 0) {
      playerRef.current?.seekTo(position / 1000, true);
    }
  }, [playback?.positionMs]);

  const handleStateChange = useCallback((state: PLAYER_STATES) => {
    if (state === PLAYER_STATES.PLAYING) {
      setPlaying(true);
      return;
    }
    if (state === PLAYER_STATES.PAUSED || state === PLAYER_STATES.ENDED) {
      setPlaying(false);
    }
  }, []);

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
      play={playing}
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
