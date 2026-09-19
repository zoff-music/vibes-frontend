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
    <div className="grid min-w-0 gap-6 sm:grid-cols-[3fr_2fr] sm:items-center sm:gap-12">
      <ContentTransition transitionKey={song.id}>
        <NowPlayingSong
          song={song}
          isPlaying
          providerLink={false}
          animate={false}
          density="compact"
        />
        <div className="mt-3">
          <PlaybackProgress
            durationMs={song.duration * 1000}
            positionMs={positionMs}
          />
        </div>
      </ContentTransition>
      <div className="flex items-center gap-4 border-theme border-t pt-5 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-8">
        <SkipButton canSkip={canSkip} isSkipping={isSkipping} onSkip={onSkip} />
        <div>
          <p className="text-theme-muted text-xs">
            Listener · vote-to-skip off
          </p>
          <p className="mt-1 font-pixel text-2xl text-theme">
            {!canSkip && 'Only admins skip.'}
            {canSkip && !changedSong && 'Your turn. Skip it.'}
            {canSkip && changedSong && 'On to the next.'}
          </p>
        </div>
      </div>
    </div>
  );
}
