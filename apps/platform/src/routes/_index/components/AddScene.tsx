import { classNames } from '@vibes/shared';
import {
  PlaylistItemSearchResult,
  ProviderIcon,
  QueueItem,
} from '@vibes/ui/web';
import { AnimatePresence, motion } from 'framer-motion';
import { queueDemoPlaylistItems } from '../../../components/seo/preview';

interface AddPlaylistItemSetupSceneProps {
  complete: boolean;
  blocked: boolean;
  reducedMotion: boolean;
  onAdd: () => void;
}

export function AddPlaylistItemSetupScene({
  complete,
  blocked,
  reducedMotion,
  onAdd,
}: AddPlaylistItemSetupSceneProps) {
  const playlistItem = queueDemoPlaylistItems[1];
  const added = complete && !blocked;

  return (
    <section aria-label="Songs in the example queue">
      <QueueItem
        playlistItem={queueDemoPlaylistItems[0]}
        position={1}
        providerLink={false}
        density="compact"
      />
      <div className="mt-2 min-h-28">
        <AnimatePresence initial={false} mode="wait">
          {added && (
            <motion.div
              key="queued"
              initial={{ opacity: 0, y: reducedMotion ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.45 }}
            >
              <QueueItem
                playlistItem={playlistItem}
                position={2}
                providerLink={false}
                density="compact"
              />
            </motion.div>
          )}
          {!added && (
            <motion.div
              key="search-result"
              exit={{ opacity: 0, y: reducedMotion ? 0 : -8 }}
              transition={{ duration: reducedMotion ? 0 : 0.2 }}
            >
              <motion.div
                animate={{
                  x: complete && blocked && !reducedMotion ? [0, -4, 4, 0] : 0,
                }}
                className={classNames(
                  'overflow-hidden rounded-2xl border bg-theme-surface transition-colors',
                  complete && blocked ? 'border-primary/60' : 'border-theme',
                )}
              >
                <PlaylistItemSearchResult
                  title={playlistItem.title}
                  publisher={playlistItem.publisher ?? 'Artist name'}
                  thumbnailUrl={playlistItem.thumbnailUrl}
                  durationSeconds={playlistItem.duration}
                  onSelect={onAdd}
                  attribution={
                    <span className="flex shrink-0 items-center px-3 text-theme-muted">
                      <ProviderIcon
                        provider={playlistItem.sourceType}
                        className="h-4 w-4"
                      />
                    </span>
                  }
                >
                  <span className="mt-1 text-primary text-xs">
                    + Add to queue
                  </span>
                </PlaylistItemSearchResult>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
