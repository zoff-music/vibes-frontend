import { type Song } from '@vibes/shared';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import { QueueEmptyIcon } from '../../icons';
import { QueueItem } from './QueueItem';

interface Props {
  songs: Song[];
  roomId?: string;
  onRemove?: (id: string) => void;
  onVote?: (id: string) => void;
  isAdmin?: boolean;
  votingSongId?: string | null;
}

const QueueListComponent: React.FC<Props> = ({
  songs,
  roomId: _roomId,
  onRemove,
  onVote,
  isAdmin,
  votingSongId,
}) => {
  if (songs.length === 0) {
    return (
      <div className="panel-surface animate-fade-in rounded-3xl px-4 py-20 text-center sm:px-12">
        <div className="mb-5 inline-flex h-20 w-20 items-center justify-center rounded-2xl border border-theme bg-theme-surface">
          <QueueEmptyIcon className="h-10 w-10 text-theme-muted" />
        </div>
        <h3 className="mb-2 font-display text-base text-theme">
          Queue is Empty
        </h3>
        <p className="mb-2 text-sm text-theme-muted">
          Add some songs to get the party started
        </p>
        <p className="jp-art text-theme-subtle text-xs">曲を追加</p>
      </div>
    );
  }

  const queueSongs = songs; // All songs are now in the queue (no position-based filtering)

  return (
    <div className="space-y-2">
      <AnimatePresence initial={false} mode="popLayout">
        {queueSongs.map((song, index) => (
          <motion.div
            key={song.id}
            layout="position"
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
              song={song}
              position={index + 1}
              isVoting={votingSongId === song.id}
              {...(onRemove && { onRemove })}
              {...(onVote && { onVote })}
              {...(isAdmin !== undefined && { isAdmin })}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export const QueueList = React.memo(QueueListComponent);
