import { type Song } from '@vibes/shared';
import {
  Button,
  ContentTransition,
  NowPlayingSong,
  PlaybackProgress,
  QueueItem,
  ResetIcon,
} from '@vibes/ui/web';
import { motion } from 'framer-motion';
import { queueDemoSongs } from '../../../components/seo/previewSongs';

interface RepeatSongSetupSceneProps {
  song: Song;
  positionMs: number;
  advanced: boolean;
  removePlayed: boolean;
  reducedMotion: boolean;
  onFinish: () => void;
}

export function RepeatSongSetupScene({
  song,
  positionMs,
  advanced,
  removePlayed,
  reducedMotion,
  onFinish,
}: RepeatSongSetupSceneProps) {
  return (
    <div>
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
      <div className="flex min-h-11 items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-theme-muted text-xs">
          {advanced && !removePlayed && (
            <motion.span
              aria-hidden="true"
              initial={{ rotate: 0 }}
              animate={{ rotate: reducedMotion ? 0 : 360 }}
              transition={{ duration: 0.6 }}
              className="text-secondary"
            >
              <ResetIcon className="h-3.5 w-3.5" />
            </motion.span>
          )}
          Up next
        </p>
        <Button
          variant="ghost"
          size="none"
          className="min-h-11 rounded-lg px-2 text-xs hover:bg-theme-surface"
          onClick={onFinish}
          disabled={advanced}
        >
          {advanced ? 'Song finished' : 'Finish song'}
        </Button>
      </div>
      <ContentTransition transitionKey={advanced ? 'finished' : 'playing'}>
        {!advanced && (
          <QueueItem
            song={queueDemoSongs[1]}
            position={1}
            providerLink={false}
            density="compact"
          />
        )}
        {advanced && !removePlayed && (
          <QueueItem
            song={queueDemoSongs[0]}
            position={1}
            providerLink={false}
            density="compact"
          />
        )}
        {advanced && removePlayed && (
          <p className="flex min-h-17 items-center border-theme border-y text-sm text-theme-muted">
            Queue cleared. Nothing repeats.
          </p>
        )}
      </ContentTransition>
    </div>
  );
}
