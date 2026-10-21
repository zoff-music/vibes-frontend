import { Link } from '@kasperrt/smolter/preact';
import { type PlaylistItem, usePageVisibility } from '@vibes/shared';
import {
  AnimatePresence,
  LayoutGroup,
  m as motion,
  useReducedMotion,
} from 'framer-motion';
import React from 'preact/compat';
import { useProgressiveList } from '../../hooks/useProgressiveList';
import { QueueEmptyIcon } from '../../icons';
import { QueueItem } from './QueueItem';

interface Props {
  playlistItems: PlaylistItem[];
  roomId?: string;
  onRemove?: (id: string) => void;
  onVote?: (id: string) => void;
  emptyHref?: string;
  isAdmin?: boolean;
  votingPlaylistItemId?: string | null;
}

const EmptyQueueContent = () => (
  <>
    <div className="mb-5 inline-flex h-20 w-20 items-center justify-center rounded-2xl border border-theme bg-theme-surface">
      <QueueEmptyIcon className="h-10 w-10 text-theme-muted" />
    </div>
    <h3 className="mb-2 font-display text-base text-theme">Queue is Empty</h3>
    <p className="mb-2 text-sm text-theme-muted">
      Add some songs to get the party started
    </p>
    <p className="jp-art text-theme-subtle text-xs">曲を追加</p>
  </>
);

const QueueListComponent: React.FC<Props> = ({
  playlistItems,
  roomId: _roomId,
  onRemove,
  onVote,
  emptyHref,
  isAdmin,
  votingPlaylistItemId,
}) => {
  const [visibleCount, sentinelRef] = useProgressiveList(playlistItems.length);
  const [initialItemIds] = React.useState(
    () => new Set(playlistItems.map((item) => item.id)),
  );
  const reducedMotion = useReducedMotion();
  const pageVisible = usePageVisibility();
  const instant = reducedMotion || !pageVisible;

  if (playlistItems.length === 0) {
    if (emptyHref) {
      return (
        <Link
          aria-label="Add a song"
          className="panel-surface flex min-h-full w-full flex-1 animate-fade-in cursor-pointer flex-col items-center justify-center rounded-3xl px-4 py-20 text-center transition-[border-color,background-color,transform] hover:border-secondary/50 hover:bg-theme-surface focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-secondary/60 active:scale-press sm:px-12"
          to={emptyHref}
          replace
          preventScrollReset
          viewTransition={false}
          prefetch="intent"
          prefetchData
        >
          <EmptyQueueContent />
        </Link>
      );
    }

    return (
      <div className="panel-surface flex min-h-full flex-1 animate-fade-in flex-col items-center justify-center rounded-3xl px-4 py-20 text-center sm:px-12">
        <EmptyQueueContent />
      </div>
    );
  }

  const visiblePlaylistItems = playlistItems.slice(0, visibleCount);

  return (
    <div className="relative space-y-2">
      {/* Drop stale projections and pending exits on either visibility edge.
          Only queue rows remount; the room session and players stay mounted. */}
      <LayoutGroup key={String(pageVisible)}>
        {/* Keep exits in flow until removed, so survivors have one layout change. */}
        <AnimatePresence initial={false}>
          {visiblePlaylistItems.map((playlistItem, index) => (
            <motion.div
              key={playlistItem.id}
              layout={instant ? false : 'position'}
              initial={
                instant || initialItemIds.has(playlistItem.id)
                  ? false
                  : {
                      opacity: 0,
                      scale: 0.96,
                      y: 14,
                    }
              }
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{
                opacity: 0,
                scale: instant ? 1 : 0.96,
                y: instant ? 0 : -14,
                transition: { duration: instant ? 0 : 0.16 },
              }}
              transition={{
                type: 'spring',
                stiffness: 420,
                damping: 34,
                opacity: { duration: instant ? 0 : 0.16 },
                layout: { duration: instant ? 0 : 0.3, ease: 'easeOut' },
              }}
            >
              <QueueItem
                playlistItem={playlistItem}
                position={index + 1}
                isVoting={votingPlaylistItemId === playlistItem.id}
                {...(onRemove && { onRemove })}
                {...(onVote && { onVote })}
                {...(isAdmin !== undefined && { isAdmin })}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </LayoutGroup>
      {visibleCount < playlistItems.length && (
        <div aria-hidden="true" className="h-12" ref={sentinelRef} />
      )}
    </div>
  );
};

export const QueueList = React.memo(QueueListComponent);
