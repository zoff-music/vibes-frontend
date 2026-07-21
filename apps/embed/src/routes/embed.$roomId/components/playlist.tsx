import type { Song } from '@vibes/models';
import { AnimatePresence, motion } from 'framer-motion';
import { EmbedQueueSong } from './queue-song';

interface Props {
  songs: Song[];
  votingEnabled: boolean;
  onVote: (songId: string) => void;
}

export function EmbedPlaylist({ songs, votingEnabled, onVote }: Props) {
  return (
    <div className="min-h-0 min-w-0 overflow-y-auto pr-1">
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
          {songs.map((song) => (
            <motion.div
              key={song.id}
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
              <EmbedQueueSong
                song={song}
                votingEnabled={votingEnabled}
                onVote={onVote}
              />
            </motion.div>
          ))}
        </AnimatePresence>
        {songs.length === 0 && (
          <div className="rounded-xl border border-theme bg-theme-surface p-6 text-center text-theme-muted text-xs">
            The queue is empty
          </div>
        )}
      </div>
    </div>
  );
}
