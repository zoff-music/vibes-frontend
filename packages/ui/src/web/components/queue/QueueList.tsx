import { type PlaylistItem } from '@vibes/shared';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import { useProgressiveList } from '../../hooks/useProgressiveList';
import { QueueEmptyIcon } from '../../icons';
import { QueueItem } from './QueueItem';

interface Props {
  playlistItems: PlaylistItem[];
  roomId?: string;
  onRemove?: (id: string) => void;
  onVote?: (id: string) => void;
  onEmptyClick?: () => void;
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
  onEmptyClick,
  isAdmin,
  votingPlaylistItemId,
}) => {
  const [visibleCount, sentinelRef] = useProgressiveList(playlistItems.length);
  if (playlistItems.length === 0) {
    if (onEmptyClick) {
      return (
        <button
          aria-label="Add a song"
          className="panel-surface w-full animate-fade-in cursor-pointer rounded-3xl px-4 py-20 text-center transition-[border-color,background-color,transform] hover:border-secondary/50 hover:bg-theme-surface focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-secondary/60 active:scale-press sm:px-12"
          onClick={onEmptyClick}
          type="button"
        >
          <EmptyQueueContent />
        </button>
      );
    }

    return (
      <div className="panel-surface animate-fade-in rounded-3xl px-4 py-20 text-center sm:px-12">
        <EmptyQueueContent />
      </div>
    );
  }

  const visiblePlaylistItems = playlistItems.slice(0, visibleCount);

  return (
    <div className="space-y-2">
      <AnimatePresence initial={false} mode="popLayout">
        {visiblePlaylistItems.map((playlistItem, index) => (
          <motion.div
            key={playlistItem.id}
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, x: 24 }}
            transition={{
              type: 'spring',
              stiffness: 420,
              damping: 34,
              opacity: { duration: 0.16 },
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
      {visibleCount < playlistItems.length && (
        <div aria-hidden="true" className="h-12" ref={sentinelRef} />
      )}
    </div>
  );
};

export const QueueList = React.memo(QueueListComponent);
