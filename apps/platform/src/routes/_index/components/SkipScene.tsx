import type { PlaylistItem } from '@vibes/shared';
import {
  ContentTransition,
  NowPlayingPlaylistItem,
  PlaybackProgress,
  SkipButton,
} from '@vibes/ui/web';

interface SkipPlaylistItemSetupSceneProps {
  playlistItem: PlaylistItem;
  positionMs: number;
  canSkip: boolean;
  changedPlaylistItem: boolean;
  isSkipping: boolean;
  onSkip: () => void;
}

export function SkipPlaylistItemSetupScene({
  playlistItem,
  positionMs,
  canSkip,
  changedPlaylistItem,
  isSkipping,
  onSkip,
}: SkipPlaylistItemSetupSceneProps) {
  return (
    <div>
      <p className="mb-3 text-theme-muted text-xs">
        {changedPlaylistItem ? 'Next song playing' : 'Now playing'}
      </p>
      <ContentTransition transitionKey={playlistItem.id}>
        <NowPlayingPlaylistItem
          playlistItem={playlistItem}
          isPlaying
          providerLink={false}
          animate={false}
          density="compact"
          showStatus={false}
        />
        <div className="mt-2">
          <PlaybackProgress
            durationMs={playlistItem.duration * 1000}
            positionMs={positionMs}
          />
        </div>
      </ContentTransition>
      <div className="mt-4">
        <SkipButton
          canSkip={canSkip}
          isSkipping={isSkipping}
          onSkip={onSkip}
          showLabel
        />
      </div>
    </div>
  );
}
