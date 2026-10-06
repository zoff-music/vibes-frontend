import type { PlaybackStateV2, PlaylistItem, RoomType } from '@vibes/models';
import { classNames } from '@vibes/shared';
import { NativeSoundCloudPlayer, NativeYouTubePlayer } from '@vibes/ui/native';
import { useEffect, useState } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { Copy } from '@/components/native';
import { RoomGenerationProgress } from '@/components/room-generation-progress';
import { Toast } from '@/components/toast';

interface ProviderPlayerProps {
  availableHeight?: number;
  availableWidth?: number;
  horizontalMargin?: number;
  isGenerating: boolean;
  roomType: RoomType;
  onLocalPlayingChange: (isPlaying: boolean) => void;
  onLocalPositionObserved: (positionMs: number) => void;
  onLocalSeek: (positionMs: number) => void;
  playback: PlaybackStateV2 | null;
  positionMs: number;
  resetVersion: number;
  playlistItem: PlaylistItem | null;
  suppressPlayback: boolean;
  synchronizePosition: boolean;
}

export function ProviderPlayer({
  availableHeight,
  availableWidth,
  horizontalMargin = playerHorizontalMargin,
  isGenerating,
  roomType,
  onLocalPlayingChange,
  onLocalPositionObserved,
  onLocalSeek,
  playback,
  positionMs,
  resetVersion,
  playlistItem,
  suppressPlayback,
  synchronizePosition,
}: ProviderPlayerProps) {
  const { width: windowWidth } = useWindowDimensions();
  const isPhoneLayout = windowWidth < 600;
  const [error, setError] = useState('');
  const [retainedYouTubePlaylistItem, setRetainedYouTubePlaylistItem] =
    useState<PlaylistItem | null>(
      playlistItem?.sourceType === 'youtube' ? playlistItem : null,
    );
  const [retainedSoundCloudPlaylistItem, setRetainedSoundCloudPlaylistItem] =
    useState<PlaylistItem | null>(
      playlistItem?.sourceType === 'soundcloud' ? playlistItem : null,
    );
  const playlistItemId = playlistItem?.id;
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
  const localIsPlaying = !suppressPlayback && (playback?.isPlaying ?? false);
  const playerWidth = Math.max(
    0,
    (availableWidth ?? windowWidth) - horizontalMargin * 2,
  );
  const playerHeight = Math.max(
    minimumPlayerHeight,
    availableHeight ?? playerWidth / playerAspectRatio,
  );
  const embeddedPlayerHeight = Math.min(
    playerHeight,
    playerWidth / playerAspectRatio,
  );
  const embeddedPlayerWidth = Math.min(
    playerWidth,
    embeddedPlayerHeight * playerAspectRatio,
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: A song identity change intentionally clears prior provider errors.
  useEffect(() => {
    setError('');
  }, [playlistItemId]);

  useEffect(() => {
    if (playlistItem?.sourceType === 'youtube')
      setRetainedYouTubePlaylistItem(playlistItem);
    if (playlistItem?.sourceType === 'soundcloud')
      setRetainedSoundCloudPlaylistItem(playlistItem);
  }, [playlistItem]);

  return (
    <View className="gap-2">
      <View
        className="items-center justify-center overflow-hidden rounded-2xl border border-mobile-border bg-black dark:border-mobile-dark-border"
        style={{
          height: playerHeight,
          marginHorizontal: horizontalMargin,
        }}
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
              height={embeddedPlayerHeight}
              isPlaying={isYouTubeActive && localIsPlaying}
              onError={setError}
              positionMs={isYouTubeActive ? positionMs : 0}
              resetVersion={resetVersion}
              sourceId={youtubePlaylistItem.sourceId}
              synchronizePosition={
                isYouTubeActive && !suppressPlayback && synchronizePosition
              }
              width={embeddedPlayerWidth}
              {...(isYouTubeActive
                ? {
                    onLocalPositionObserved: (observedPositionMs) => {
                      if (suppressPlayback) return;
                      onLocalPositionObserved(observedPositionMs);
                    },
                    onLocalSeek,
                    onPlayingChange: (isPlaying) => {
                      if (suppressPlayback) return;
                      onLocalPlayingChange(isPlaying);
                    },
                  }
                : {})}
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
            pointerEvents={isSoundCloudActive ? 'auto' : 'none'}
          >
            <NativeSoundCloudPlayer
              artworkUrl={soundCloudPlaylistItem.thumbnailUrl}
              blankArtworkColor={isPhoneLayout ? '#f5f5f5' : '#000000'}
              height={embeddedPlayerHeight}
              interactive={isSoundCloudActive && !suppressPlayback}
              isPlaying={isSoundCloudActive && localIsPlaying}
              onError={setError}
              positionMs={isSoundCloudActive ? positionMs : 0}
              resetVersion={resetVersion}
              sourceId={soundCloudPlaylistItem.sourceId}
              synchronizePosition={
                isSoundCloudActive && !suppressPlayback && synchronizePosition
              }
              width={embeddedPlayerWidth}
              {...(isSoundCloudActive
                ? {
                    onLocalPositionObserved: (observedPositionMs) => {
                      if (suppressPlayback) return;
                      onLocalPositionObserved(observedPositionMs);
                    },
                    onLocalSeek,
                    onPlayingChange: (isPlaying) => {
                      if (suppressPlayback) return;
                      onLocalPlayingChange(isPlaying);
                    },
                  }
                : {})}
              {...(soundCloudPlaylistItem.providerUrl
                ? { providerUrl: soundCloudPlaylistItem.providerUrl }
                : {})}
            />
          </View>
        )}
        {!playlistItem && isGenerating && <RoomGenerationProgress />}
        {!playlistItem && !isGenerating && (
          <Copy muted>
            {roomType === 'WATCH'
              ? 'Add a video to start watching.'
              : 'Add a song to start listening.'}
          </Copy>
        )}
      </View>
      <Toast message={error} />
    </View>
  );
}

const minimumPlayerHeight = 200;

const playerAspectRatio = 16 / 9;

const playerHorizontalMargin = 16;
