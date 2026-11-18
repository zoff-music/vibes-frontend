import type { PlaylistItem } from '@vibes/models';
import { AnimatePresence, m as motion } from 'framer-motion';
import { WatchLandscape, watchPalettes } from './WatchLandscape';

interface LiveRoomStageProps {
  playlistItem: PlaylistItem;
  playing: boolean;
  watch: boolean;
}

const watchSlots: Record<string, number> = {
  'demo-1': 0,
  'demo-2': 1,
  'demo-3': 2,
  'demo-4': 3,
};

// Stands in for the provider player: a film for Watch, and for Music the
// artwork-on-blur look of a typical YouTube track.
export function LiveRoomStage({
  playlistItem,
  playing,
  watch,
}: LiveRoomStageProps) {
  return (
    <AnimatePresence initial={false}>
      <motion.div
        key={playlistItem.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        className="absolute inset-0"
        aria-hidden="true"
      >
        {watch && (
          <WatchLandscape
            palette={watchPalettes[watchSlots[playlistItem.id] ?? 3]}
            playing={playing}
          />
        )}
        {!watch && (
          <>
            <img
              src={playlistItem.thumbnailUrl}
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full scale-125 object-cover opacity-60 blur-2xl"
            />
            <div className="absolute inset-0 flex items-center justify-center p-[8%]">
              <motion.div
                animate={{ scale: playing ? [1, 1.02, 1] : 1 }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="h-full"
              >
                <img
                  src={playlistItem.thumbnailUrl}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  width={240}
                  height={240}
                  className="aspect-square h-full w-auto rounded-lg object-cover shadow-2xl"
                />
              </motion.div>
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
