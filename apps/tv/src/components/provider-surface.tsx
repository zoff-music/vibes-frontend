import type { PlaylistItem } from '@vibes/models';
import { classNames } from '@vibes/shared';
import { NativeSoundCloudPlayer, NativeYouTubePlayer } from '@vibes/ui/native';
import { useCallback, useEffect, useState } from 'react';
import { type LayoutChangeEvent, Text, View } from 'react-native';

interface ProviderSurfaceProps {
  isPlaying: boolean;
  playbackKey: string;
  positionMs: number;
  playlistItem: PlaylistItem | null;
}

export function ProviderSurface({
  isPlaying,
  playbackKey,
  positionMs,
  playlistItem,
}: ProviderSurfaceProps) {
  const [surfaceSize, setSurfaceSize] = useState(initialSurfaceSize);
  const [retainedYouTubePlaylistItem, setRetainedYouTubePlaylistItem] =
    useState<PlaylistItem | null>(
      playlistItem?.sourceType === 'youtube' ? playlistItem : null,
    );
  const [retainedSoundCloudPlaylistItem, setRetainedSoundCloudPlaylistItem] =
    useState<PlaylistItem | null>(
      playlistItem?.sourceType === 'soundcloud' ? playlistItem : null,
    );
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
  const youtubePlaylistItem =
    playlistItem?.sourceType === 'youtube'
      ? playlistItem
      : retainedYouTubePlaylistItem;
  const soundCloudPlaylistItem =
    playlistItem?.sourceType === 'soundcloud'
      ? playlistItem
      : retainedSoundCloudPlaylistItem;
  const isYouTubeActive = playlistItem?.sourceType === 'youtube';
  const isSoundCloudActive = playlistItem?.sourceType === 'soundcloud';

  useEffect(() => {
    if (playlistItem?.sourceType === 'youtube')
      setRetainedYouTubePlaylistItem(playlistItem);
    if (playlistItem?.sourceType === 'soundcloud')
      setRetainedSoundCloudPlaylistItem(playlistItem);
  }, [playlistItem]);
  if (!playlistItem) {
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
      {youtubePlaylistItem && (
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
            sourceId={youtubePlaylistItem.sourceId}
            synchronizePosition={false}
            width={playerWidth}
          />
        </View>
      )}
      {soundCloudPlaylistItem && (
        <View
          className={classNames(
            'absolute inset-0 items-center justify-center',
            isSoundCloudActive && 'z-10 opacity-100',
            !isSoundCloudActive && 'z-0 opacity-0',
          )}
          pointerEvents="none"
        >
          <NativeSoundCloudPlayer
            artworkUrl={soundCloudPlaylistItem.thumbnailUrl}
            height={surfaceSize.height}
            interactive={false}
            isPlaying={isSoundCloudActive && isPlaying}
            positionMs={isSoundCloudActive ? positionMs : 0}
            resetVersion={playbackKey}
            sourceId={soundCloudPlaylistItem.sourceId}
            synchronizePosition={isSoundCloudActive}
            width={surfaceSize.width}
            {...(soundCloudPlaylistItem.providerUrl
              ? { providerUrl: soundCloudPlaylistItem.providerUrl }
              : {})}
          />
        </View>
      )}
    </View>
  );
}

const youtubeAspectRatio = 16 / 9;
const initialSurfaceSize = { height: 360, width: 640 };
