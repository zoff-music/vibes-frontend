import { classNames } from '@vibes/shared';
import {
  ArrowRightIcon,
  ProviderIcon,
  QueueItem,
  SongSearchResult,
} from '@vibes/ui/web';
import { AnimatePresence, motion } from 'framer-motion';
import { queueDemoSongs } from '../../../components/seo/previewSongs';

interface AddSongSetupSceneProps {
  complete: boolean;
  blocked: boolean;
  reducedMotion: boolean;
  onAdd: () => void;
}

export function AddSongSetupScene({
  complete,
  blocked,
  reducedMotion,
  onAdd,
}: AddSongSetupSceneProps) {
  const song = queueDemoSongs[1];
  const added = complete && !blocked;

  return (
    <div className="grid min-w-0 items-center gap-3 sm:grid-cols-[1fr_auto_1fr] sm:gap-6">
      <div className="min-w-0">
        <h3 className="mb-3 font-pixel text-theme-muted text-xs">
          A LISTENER'S PICK
        </h3>
        <motion.div
          animate={{
            x: complete && blocked && !reducedMotion ? [0, -4, 4, 0] : 0,
          }}
          className={classNames(
            'overflow-hidden rounded-2xl border bg-theme-surface transition-colors',
            !complete && 'border-theme',
            complete && (blocked ? 'border-primary/60' : 'border-secondary/60'),
          )}
        >
          <SongSearchResult
            title={song.title}
            artist={song.artist ?? 'Artist name'}
            thumbnailUrl={song.thumbnailUrl}
            durationSeconds={song.duration}
            onSelect={onAdd}
            attribution={
              <span className="flex shrink-0 items-center px-3 text-theme-muted">
                <ProviderIcon provider={song.sourceType} className="h-4 w-4" />
              </span>
            }
          />
        </motion.div>
      </div>
      <ArrowRightIcon
        aria-hidden="true"
        className={classNames(
          'h-5 w-5 rotate-90 justify-self-center transition-colors sm:rotate-0',
          added ? 'text-secondary' : 'text-theme-subtle',
        )}
      />
      <div className="min-w-0">
        <h3 className="mb-3 font-pixel text-theme-muted text-xs">THE QUEUE</h3>
        <ol
          aria-label="Songs in the example queue"
          className="min-h-36 space-y-2"
        >
          <li>
            <QueueItem
              song={queueDemoSongs[0]}
              position={1}
              providerLink={false}
              density="compact"
            />
          </li>
          <AnimatePresence>
            {added && (
              <motion.li
                initial={{ opacity: 0, y: reducedMotion ? 0 : -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.4 }}
              >
                <QueueItem
                  song={song}
                  position={2}
                  providerLink={false}
                  density="compact"
                />
              </motion.li>
            )}
          </AnimatePresence>
        </ol>
      </div>
    </div>
  );
}
