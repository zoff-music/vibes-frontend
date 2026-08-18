import type { Song } from '@vibes/models';
import { classNames } from '@vibes/shared';
import { NativeSoundCloudPlayer, NativeYouTubePlayer } from '@vibes/ui/native';
import { useCallback, useEffect, useState } from 'react';
import { type LayoutChangeEvent, Text, View } from 'react-native';

interface ProviderSurfaceProps {
  isPlaying: boolean;
  playbackKey: string;
  positionMs: number;
  song: Song | null;
}

export function ProviderSurface({
  isPlaying,
  playbackKey,
  positionMs,
  song,
}: ProviderSurfaceProps) {
  const [surfaceSize, setSurfaceSize] = useState(initialSurfaceSize);
  const [retainedYouTubeSong, setRetainedYouTubeSong] = useState<Song | null>(
    song?.sourceType === 'youtube' ? song : null,
  );
  const [retainedSoundCloudSong, setRetainedSoundCloudSong] =
    useState<Song | null>(song?.sourceType === 'soundcloud' ? song : null);
  const handleSurfaceLayout = useCallback((event: LayoutChangeEvent) => {
    const { height, width } = event.nativeEvent.layout;
    setSurfaceSize((currentSize) => {
      if (currentSize.height === height && currentSize.width === width) {
        return currentSize;
      }
      return { height, width };
    });
  }, []);
  const playerWidth = Math.min(
    surfaceSize.width,
    surfaceSize.height * youtubeAspectRatio,
  );
  const playerHeight = playerWidth / youtubeAspectRatio;
  const youtubeSong =
    song?.sourceType === 'youtube' ? song : retainedYouTubeSong;
  const soundCloudSong =
    song?.sourceType === 'soundcloud' ? song : retainedSoundCloudSong;
  const isYouTubeActive = song?.sourceType === 'youtube';
  const isSoundCloudActive = song?.sourceType === 'soundcloud';

  useEffect(() => {
    if (song?.sourceType === 'youtube') setRetainedYouTubeSong(song);
    if (song?.sourceType === 'soundcloud') setRetainedSoundCloudSong(song);
  }, [song]);
  if (!song) {
    return (
      <View className="h-full items-center justify-center rounded-[2rem] bg-black">
        <Text className="font-heading text-4xl text-tv-muted">
          No song is playing
        </Text>
      </View>
    );
  }

  return (
    <View
      className="h-full items-center justify-center overflow-hidden rounded-[2rem] bg-black"
      onLayout={handleSurfaceLayout}
    >
      {youtubeSong && (
        <View
          className={classNames(
            'absolute inset-0 items-center justify-center',
            isYouTubeActive && 'z-10 opacity-100',
            !isYouTubeActive && 'z-0 opacity-0',
          )}
          pointerEvents={isYouTubeActive ? 'auto' : 'none'}
        >
          <NativeYouTubePlayer
            height={playerHeight}
            isPlaying={isYouTubeActive && isPlaying}
            positionMs={isYouTubeActive ? positionMs : 0}
            resetVersion={playbackKey}
            sourceId={youtubeSong.sourceId}
            synchronizePosition={false}
            width={playerWidth}
          />
        </View>
      )}
      {soundCloudSong && (
        <View
          className={classNames(
            'absolute inset-0 items-center justify-center',
            isSoundCloudActive && 'z-10 opacity-100',
            !isSoundCloudActive && 'z-0 opacity-0',
          )}
          pointerEvents="none"
        >
          <NativeSoundCloudPlayer
            artworkUrl={soundCloudSong.thumbnailUrl}
            height={surfaceSize.height}
            interactive={false}
            isPlaying={isSoundCloudActive && isPlaying}
            positionMs={isSoundCloudActive ? positionMs : 0}
            resetVersion={playbackKey}
            sourceId={soundCloudSong.sourceId}
            synchronizePosition={isSoundCloudActive}
            width={surfaceSize.width}
            {...(soundCloudSong.providerUrl
              ? { providerUrl: soundCloudSong.providerUrl }
              : {})}
          />
        </View>
      )}
    </View>
  );
}

const youtubeAspectRatio = 16 / 9;
const initialSurfaceSize = { height: 360, width: 640 };
