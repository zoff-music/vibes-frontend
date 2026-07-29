import { motion } from 'framer-motion';

interface JoiningRoomStateProps {
  roomId: string;
}

export function JoiningRoomState({ roomId }: JoiningRoomStateProps) {
  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-theme/85 p-6 backdrop-blur-md"
      initial={{ opacity: 0 }}
      role="status"
    >
      <motion.div
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="panel-strong w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl"
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center">
          {[0, 1, 2].map((index) => (
            <motion.span
              key={index}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [0.75, 1.15, 0.75],
                y: [2, -4, 2],
              }}
              className="mx-1 h-2.5 w-2.5 rounded-full bg-secondary shadow-secondary-soft"
              transition={{
                delay: index * 0.16,
                duration: 0.9,
                repeat: Number.POSITIVE_INFINITY,
              }}
            />
          ))}
        </div>
        <p className="mt-3 font-pixel text-sm text-theme">
          Tuning into {roomId}
        </p>
        <p className="mt-2 text-theme-muted text-xs">
          Loading the room and syncing playback…
        </p>
      </motion.div>
    </motion.div>
  );
}
