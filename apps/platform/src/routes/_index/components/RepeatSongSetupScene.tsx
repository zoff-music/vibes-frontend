import { classNames, type Song } from '@vibes/shared';
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
    <div className="grid min-w-0 gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-6">
      <div>
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
        <Button
          variant="tertiary"
          size="small"
          className="mt-3 min-h-12 w-full text-sm sm:w-auto sm:px-5"
          onClick={onFinish}
          aria-disabled={advanced}
        >
          {advanced ? 'Song finished' : 'Finish the song'}
        </Button>
      </div>
      <motion.span
        aria-hidden="true"
        animate={{
          rotate: advanced && !removePlayed && !reducedMotion ? 360 : 0,
        }}
        transition={{ duration: 0.6 }}
        className={classNames(
          'hidden justify-self-center sm:block',
          !removePlayed ? 'text-secondary' : 'text-theme-subtle',
        )}
      >
        <ResetIcon className="h-5 w-5" />
      </motion.span>
      <div className="min-w-0">
        <h3 className="mb-3 font-pixel text-theme-muted text-xs">
          {advanced && !removePlayed ? 'BACK IN THE QUEUE' : 'UP NEXT'}
        </h3>
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
              No songs left in the queue.
            </p>
          )}
        </ContentTransition>
      </div>
    </div>
  );
}
