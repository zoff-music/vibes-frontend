import type { PlaylistItem } from '@vibes/models';
import { EmbedQueuePlaylistItem, useProgressiveList } from '@vibes/ui/web';
import { AnimatePresence, motion } from 'framer-motion';

interface Props {
  playlistItems: PlaylistItem[];
  votingEnabled: boolean;
  onVote: (playlistItemId: string) => void;
}

export function EmbedPlaylist({ playlistItems, votingEnabled, onVote }: Props) {
  const [visibleCount, sentinelRef] = useProgressiveList(playlistItems.length);
  const visiblePlaylistItems = playlistItems.slice(0, visibleCount);
  return (
    <div
      className="relative h-full min-h-0 min-w-0 overflow-y-auto overflow-x-hidden overscroll-none pr-1"
      data-embed-scroll
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-pixel text-theme-muted text-xs tracking-widest">
          Up next
        </h2>
        {votingEnabled && (
          <span className="text-theme-subtle text-xs">Tap a track to vote</span>
        )}
      </div>
      <div className="space-y-2">
        <AnimatePresence initial={false} mode="popLayout">
          {visiblePlaylistItems.map((playlistItem) => (
            <motion.div
              key={playlistItem.id}
              layout="position"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: -20,
                transition: { duration: 0.15 },
              }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 30,
                opacity: { duration: 0.1 },
              }}
            >
              <EmbedQueuePlaylistItem
                playlistItem={playlistItem}
                votingEnabled={votingEnabled}
                onVote={onVote}
              />
            </motion.div>
          ))}
        </AnimatePresence>
        {visibleCount < playlistItems.length && (
          <div aria-hidden="true" className="h-10" ref={sentinelRef} />
        )}
        {playlistItems.length === 0 && (
          <div className="rounded-xl border border-theme bg-theme-surface p-6 text-center text-theme-muted text-xs">
            The queue is empty
          </div>
        )}
      </div>
    </div>
  );
}
