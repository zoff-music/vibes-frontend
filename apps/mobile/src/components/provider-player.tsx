import type { PlaybackState, Song } from '@vibes/models';
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
  onLocalPlayingChange: (isPlaying: boolean) => void;
  onLocalPositionObserved: (positionMs: number) => void;
  onLocalSeek: (positionMs: number) => void;
  playback: PlaybackState | null;
  positionMs: number;
  resetVersion: number;
  song: Song | null;
  suppressPlayback: boolean;
  synchronizePosition: boolean;
}

export function ProviderPlayer({
  availableHeight,
  availableWidth,
  horizontalMargin = playerHorizontalMargin,
  isGenerating,
  onLocalPlayingChange,
  onLocalPositionObserved,
  onLocalSeek,
  playback,
  positionMs,
  resetVersion,
  song,
  suppressPlayback,
  synchronizePosition,
}: ProviderPlayerProps) {
  const { width: windowWidth } = useWindowDimensions();
  const isPhoneLayout = availableWidth === undefined && windowWidth < 600;
  const [error, setError] = useState('');
  const [retainedYouTubeSong, setRetainedYouTubeSong] = useState<Song | null>(
    song?.sourceType === 'youtube' ? song : null,
  );
  const [retainedSoundCloudSong, setRetainedSoundCloudSong] =
    useState<Song | null>(song?.sourceType === 'soundcloud' ? song : null);
  const songId = song?.id;
  const youtubeSong =
    song?.sourceType === 'youtube' ? song : retainedYouTubeSong;
  const soundCloudSong =
    song?.sourceType === 'soundcloud' ? song : retainedSoundCloudSong;
  const isYouTubeActive = song?.sourceType === 'youtube';
  const isSoundCloudActive = song?.sourceType === 'soundcloud';
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
  }, [songId]);

  useEffect(() => {
    if (song?.sourceType === 'youtube') setRetainedYouTubeSong(song);
    if (song?.sourceType === 'soundcloud') setRetainedSoundCloudSong(song);
  }, [song]);

  return (
    <View className="gap-2">
      <View
        className="items-center justify-center overflow-hidden rounded-2xl border border-mobile-border bg-black dark:border-mobile-dark-border"
        style={{
          height: playerHeight,
          marginHorizontal: horizontalMargin,
        }}
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
              height={embeddedPlayerHeight}
              isPlaying={isYouTubeActive && localIsPlaying}
              onError={setError}
              positionMs={isYouTubeActive ? positionMs : 0}
              resetVersion={resetVersion}
              sourceId={youtubeSong.sourceId}
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
        {soundCloudSong && (
          <View
            className={classNames(
              'absolute inset-0 items-center justify-center',
              isSoundCloudActive && 'z-10 opacity-100',
              !isSoundCloudActive && 'z-0 opacity-0',
            )}
            pointerEvents={isSoundCloudActive ? 'auto' : 'none'}
          >
            <NativeSoundCloudPlayer
              artworkUrl={soundCloudSong.thumbnailUrl}
              blankArtworkColor={isPhoneLayout ? '#f5f5f5' : '#000000'}
              height={embeddedPlayerHeight}
              interactive={isSoundCloudActive && !suppressPlayback}
              isPlaying={isSoundCloudActive && localIsPlaying}
              onError={setError}
              positionMs={isSoundCloudActive ? positionMs : 0}
              resetVersion={resetVersion}
              sourceId={soundCloudSong.sourceId}
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
              {...(soundCloudSong.providerUrl
                ? { providerUrl: soundCloudSong.providerUrl }
                : {})}
            />
          </View>
        )}
        {!song && isGenerating && <RoomGenerationProgress />}
        {!song && !isGenerating && (
          <Copy muted>Add a song to start listening.</Copy>
        )}
      </View>
      <Toast message={error} />
    </View>
  );
}

const minimumPlayerHeight = 200;

const playerAspectRatio = 16 / 9;

const playerHorizontalMargin = 16;
