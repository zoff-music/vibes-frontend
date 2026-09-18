import { QueueItem, SparklesIcon } from '@vibes/ui/web';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { queueDemoSongs } from '../../../../components/seo/previewSongs';
import { usePlaylistIdeaPreview } from '../../hooks/usePlaylistIdeaPreview';

interface PlaylistIdeaSceneProps {
  prompt: string;
  playing: boolean;
}

export function PlaylistIdeaScene({ prompt, playing }: PlaylistIdeaSceneProps) {
  const { count, generating } = usePlaylistIdeaPreview(playing);

  return (
    <MotionConfig reducedMotion="user">
      <div className="mt-5">
        <div className="rounded-2xl border border-theme bg-theme-surface p-4">
          <p className="mb-3 font-pixel text-theme-muted text-xs">
            Playlist idea
          </p>
          <div className="flex min-w-0 items-center gap-3">
            <SparklesIcon className="h-5 w-5 shrink-0 text-primary" />
            <p className="min-w-0 text-sm text-theme">{prompt}</p>
          </div>
        </div>
        <div className="my-5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-pixel text-theme-muted">electro</span>
          <span className="text-theme-muted">
            {generating ? 'Finding songs…' : 'Ready to play'}
          </span>
        </div>
        <ol
          aria-label="Generated playlist preview"
          className="min-h-68 space-y-2"
        >
          <AnimatePresence initial={false} mode="popLayout">
            {queueDemoSongs.slice(0, count).map((song, index) => (
              <motion.li
                key={song.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <QueueItem
                  song={song}
                  position={index + 1}
                  providerLink={false}
                />
              </motion.li>
            ))}
          </AnimatePresence>
        </ol>
      </div>
    </MotionConfig>
  );
}
