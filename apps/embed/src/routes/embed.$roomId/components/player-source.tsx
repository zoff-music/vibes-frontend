import type { PlaylistItem } from '@vibes/models';
import { classNames } from '@vibes/shared';
import { lazy, memo, Suspense, useEffect, useState } from 'react';

const LazySoundCloudPlayer = lazy(async () => {
  const module = await import('@vibes/ui/web/player/SoundCloudPlayer');
  return { default: module.SoundCloudPlayer };
});

const LazyVideoPlayer = lazy(async () => {
  const module = await import('@vibes/ui/web/player/VideoPlayer');
  return { default: module.VideoPlayer };
});

interface Props {
  autoplay: boolean;
  currentPlaylistItem: PlaylistItem | null;
  enabledProviders: string[];
  onLocalAlignmentChange: (isAligned: boolean) => void;
  onLocalInteraction: () => void;
  onLocalPlay: () => void;
  onNeedsUserGestureChange: (needsGesture: boolean) => void;
  playlistItems: PlaylistItem[];
}

interface LoadedPlayers {
  soundcloud: boolean;
  youtube: boolean;
}

function PlayerLoading() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-theme border-t-primary" />
    </div>
  );
}

function EmbedPlayerSourceComponent({
  autoplay,
  currentPlaylistItem,
  enabledProviders,
  onLocalAlignmentChange,
  onLocalInteraction,
  onLocalPlay,
  onNeedsUserGestureChange,
  playlistItems,
}: Props) {
  const isSoundCloudActive = currentPlaylistItem?.sourceType === 'soundcloud';
  const isYouTubeActive = currentPlaylistItem?.sourceType === 'youtube';
  const isSoundCloudEnabled = enabledProviders.includes('soundcloud');
  const isYouTubeEnabled = enabledProviders.includes('youtube');
  const [loadedPlayers, setLoadedPlayers] = useState<LoadedPlayers>(() => ({
    soundcloud: isSoundCloudActive,
    youtube: isYouTubeActive,
  }));

  useEffect(() => {
    setLoadedPlayers((current) => ({
      soundcloud:
        current.soundcloud || isSoundCloudActive || isSoundCloudEnabled,
      youtube: current.youtube || isYouTubeActive || isYouTubeEnabled,
    }));
  }, [
    isSoundCloudActive,
    isSoundCloudEnabled,
    isYouTubeActive,
    isYouTubeEnabled,
  ]);

  const shouldMountSoundCloud = loadedPlayers.soundcloud || isSoundCloudActive;
  const shouldMountYouTube = loadedPlayers.youtube || isYouTubeActive;
  const preloadSoundCloudPlaylistItem =
    playlistItems.find(
      (playlistItem) => playlistItem.sourceType === 'soundcloud',
    ) ?? null;
  const preloadYouTubePlaylistItem =
    playlistItems.find(
      (playlistItem) => playlistItem.sourceType === 'youtube',
    ) ?? null;

  return (
    <div className="absolute inset-0">
      {shouldMountYouTube && (
        <div
          className={classNames(
            'absolute inset-0',
            !isYouTubeActive && 'pointer-events-none opacity-0',
          )}
        >
          <Suspense fallback={isYouTubeActive && <PlayerLoading />}>
            <LazyVideoPlayer
              allowUnmutedAutoplay={autoplay}
              isVisible={isYouTubeActive}
              fill
              appContext="platform"
              onLocalAlignmentChange={onLocalAlignmentChange}
              onLocalPause={onLocalInteraction}
              onLocalPlay={onLocalPlay}
              onNeedsUserGestureChange={onNeedsUserGestureChange}
              onLocalSeek={onLocalInteraction}
              onLocalVolumeChange={onLocalInteraction}
              preloadPlaylistItem={preloadYouTubePlaylistItem}
            />
          </Suspense>
        </div>
      )}
      {shouldMountSoundCloud && (
        <div
          className={classNames(
            'absolute inset-0',
            !isSoundCloudActive && 'pointer-events-none opacity-0',
          )}
        >
          <Suspense fallback={isSoundCloudActive && <PlayerLoading />}>
            <LazySoundCloudPlayer
              allowUnmutedAutoplay={autoplay}
              showInitialPlaybackOverlay
              isVisible={isSoundCloudActive}
              fill
              onLocalAlignmentChange={onLocalAlignmentChange}
              onLocalPause={onLocalInteraction}
              onLocalPlay={onLocalPlay}
              onNeedsUserGestureChange={onNeedsUserGestureChange}
              onLocalSeek={onLocalInteraction}
              onLocalVolumeChange={onLocalInteraction}
              preloadPlaylistItem={preloadSoundCloudPlaylistItem}
            />
          </Suspense>
        </div>
      )}
    </div>
  );
}

export const EmbedPlayerSource = memo(EmbedPlayerSourceComponent);
