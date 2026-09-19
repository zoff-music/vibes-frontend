import type { Song } from '@vibes/shared';
import {
  ContentTransition,
  NowPlayingSong,
  PlaybackProgress,
  SkipButton,
} from '@vibes/ui/web';

interface SkipSongSetupSceneProps {
  song: Song;
  positionMs: number;
  canSkip: boolean;
  changedSong: boolean;
  isSkipping: boolean;
  onSkip: () => void;
}

export function SkipSongSetupScene({
  song,
  positionMs,
  canSkip,
  changedSong,
  isSkipping,
  onSkip,
}: SkipSongSetupSceneProps) {
  return (
    <div>
      <p className="mb-3 text-theme-muted text-xs">
        {changedSong ? 'Next song playing' : 'Now playing'}
      </p>
      <ContentTransition transitionKey={song.id}>
        <NowPlayingSong
          song={song}
          isPlaying
          providerLink={false}
          animate={false}
          density="compact"
          showStatus={false}
        />
        <div className="mt-2">
          <PlaybackProgress
            durationMs={song.duration * 1000}
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
