import { classNames } from '@vibes/shared';
import {
  Button,
  CheckIcon,
  CloseIcon,
  PlusIcon,
  QueueItem,
  SearchIcon,
  YouTubeIcon,
} from '@vibes/ui/web';
import { AnimatePresence, MotionConfig, m as motion } from 'framer-motion';
import { useEffect, useState } from 'preact/compat';
import { MusicDemo } from './MusicDemo';
import { queueDemoOpeningArtwork, queueDemoPlaylistItems } from './preview';
import { useShowcaseMotion } from './useShowcaseMotion';

type Step = 'empty' | 'pasted' | 'preview' | 'adding' | 'queued' | 'filling';

const steps: { step: Step; duration: number; caption: string }[] = [
  { step: 'empty', duration: 1400, caption: 'Have a playlist already?' },
  { step: 'pasted', duration: 1500, caption: 'Paste its link into search.' },
  {
    step: 'preview',
    duration: 2600,
    caption: 'Check what’s in it before adding.',
  },
  { step: 'adding', duration: 800, caption: 'Add the whole thing at once.' },
  {
    step: 'queued',
    duration: 2000,
    caption: 'Add the whole thing at once.',
  },
  {
    step: 'filling',
    duration: 3600,
    caption: 'Then the room votes on what plays first.',
  },
];

const playlistLink = 'youtube.com/playlist?list=PL7late-night';
const artwork = [
  ...queueDemoPlaylistItems.map((item) => item.thumbnailUrl),
  queueDemoOpeningArtwork,
];
const tracks = [
  'Neon after rain',
  'Last bus home',
  'Slow city lights',
  'Midnight radio',
  'Taillights',
  'Somewhere warm',
];
const imported = tracks.map((title, index) => ({
  ...queueDemoPlaylistItems[0],
  id: `import-${index}`,
  title,
  publisher: 'Late night drive',
  thumbnailUrl: artwork[index % artwork.length],
  voteCount: 0,
}));
const total = 24;

// The Add dialog's playlist import: paste, preview, add all, queue fills.
export function PlaylistImportDemo() {
  const { ref, state, actions } = useShowcaseMotion();
  const [index, setIndex] = useState(0);
  const current = state.paused ? steps[2] : steps[index];

  useEffect(() => {
    if (!state.playing) return;

    const timeout = window.setTimeout(
      () => setIndex((value) => (value + 1) % steps.length),
      steps[index].duration,
    );

    return () => window.clearTimeout(timeout);
  }, [state.playing, index]);

  const step = current.step;
  const modalOpen = step !== 'filling';

  return (
    <MotionConfig reducedMotion="user">
      <MusicDemo
        elementRef={ref}
        label="Import a playlist"
        detail="Paste a YouTube or SoundCloud playlist link into search to preview and add it."
        caption={current.caption}
        paused={state.paused}
        onToggle={actions.toggle}
      >
        <div aria-hidden="true" inert className="relative h-124 p-4 sm:p-5">
          <AnimatePresence initial={false} mode="wait">
            {modalOpen && (
              <motion.div
                key="modal"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-theme text-base">Add song</p>
                    <p className="text-theme-muted mt-1 text-xs">
                      Search by title, or paste a song or playlist link
                    </p>
                  </div>
                  <CloseIcon className="text-theme size-5" />
                </div>
                <div className="flex gap-2">
                  <div
                    className={classNames(
                      'flex h-14 min-w-0 flex-1 items-center gap-2 rounded-full border bg-theme-surface pl-5 transition-colors duration-500',
                      step === 'pasted'
                        ? 'border-secondary ring-2 ring-secondary/30'
                        : 'border-theme',
                    )}
                  >
                    <SearchIcon className="text-theme-muted size-5 shrink-0" />
                    {step === 'empty' && (
                      <span className="text-theme-subtle truncate font-mono text-sm">
                        Search youtube...
                      </span>
                    )}
                    {step !== 'empty' && (
                      <motion.span
                        initial={{ backgroundColor: 'rgba(0, 217, 255, 0.35)' }}
                        animate={{ backgroundColor: 'rgba(0, 217, 255, 0)' }}
                        transition={{ duration: 0.8 }}
                        className="text-theme truncate rounded font-mono text-sm"
                      >
                        {playlistLink}
                      </motion.span>
                    )}
                  </div>
                  <span className="bg-primary flex size-14 shrink-0 items-center justify-center rounded-full text-pink-950">
                    <SearchIcon className="size-5" />
                  </span>
                </div>

                <div className="mt-4">
                  {step === 'pasted' && (
                    <div className="animate-scale-in border-theme bg-theme-surface rounded-2xl border p-8 text-center">
                      <div className="border-theme bg-theme mb-3 inline-flex size-14 items-center justify-center rounded-2xl border">
                        <div className="size-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      </div>
                      <p className="text-theme-muted text-sm">
                        Loading preview...
                      </p>
                    </div>
                  )}
                  {(step === 'preview' || step === 'adding') && (
                    <div className="animate-scale-in">
                      <div className="border-theme bg-theme-surface overflow-hidden rounded-2xl border">
                        <div className="border-theme border-b px-4 py-3">
                          <p className="text-theme text-sm">Late night drive</p>
                          <p className="text-theme-muted mt-1 text-xs">
                            {total} songs found
                          </p>
                        </div>
                        <div className="h-48 overflow-hidden [mask-image:linear-gradient(to_bottom,black_75%,transparent)]">
                          {imported.map((item, row) => (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: row * 0.06 }}
                              className="border-theme flex items-center gap-3 border-t px-4 py-2 first:border-t-0"
                            >
                              <span className="text-theme-subtle w-5 shrink-0 text-right text-xs">
                                {row + 1}
                              </span>
                              <img
                                src={item.thumbnailUrl}
                                alt=""
                                width={36}
                                height={36}
                                className="border-theme size-9 shrink-0 rounded-lg border object-cover"
                              />
                              <span className="min-w-0 flex-1">
                                <span className="text-theme block truncate text-xs">
                                  {item.title}
                                </span>
                                <span className="text-theme-muted block truncate text-xs">
                                  {item.publisher}
                                </span>
                              </span>
                              <YouTubeIcon className="text-theme-muted size-4 shrink-0" />
                            </motion.div>
                          ))}
                        </div>
                      </div>
                      <div className="mt-3 flex gap-3">
                        <Button variant="tertiary" className="flex-1">
                          Cancel
                        </Button>
                        <motion.span
                          animate={{ scale: step === 'adding' ? 0.96 : 1 }}
                          className="flex flex-1"
                        >
                          <Button variant="primary" className="flex-1 gap-2">
                            {step === 'adding' && (
                              <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            )}
                            {step !== 'adding' && (
                              <PlusIcon className="size-5" />
                            )}
                            {step === 'adding'
                              ? 'Adding playlist...'
                              : `Add all ${total}`}
                          </Button>
                        </motion.span>
                      </div>
                    </div>
                  )}
                  {step === 'queued' && (
                    <div className="animate-scale-in border-secondary/40 bg-secondary/10 rounded-2xl border p-8 text-center">
                      <div className="border-secondary/40 bg-secondary/20 mb-4 inline-flex size-16 items-center justify-center rounded-2xl border">
                        <CheckIcon className="text-secondary size-8" />
                      </div>
                      <p className="text-theme mb-2 text-base">
                        Queued {total} songs
                      </p>
                      <p className="text-theme-muted mb-1 text-sm">
                        Items will appear as the playlist is imported
                      </p>
                      <p className="jp-art text-theme-muted text-xs">
                        追加されました
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
            {!modalOpen && <QueueFilling key="queue" />}
          </AnimatePresence>
        </div>
      </MusicDemo>
    </MotionConfig>
  );
}

function QueueFilling() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(
      () => setCount((value) => Math.min(value + 1, imported.length)),
      380,
    );

    return () => window.clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="border-theme mb-3 flex items-center justify-between border-b">
        <span className="border-secondary font-display text-2xs text-theme tracking-label inline-flex min-h-12 items-center border-b-2 px-1">
          Up next ({2 + Math.round((count / imported.length) * total)})
        </span>
        <span className="font-display text-2xs text-theme-muted tracking-label px-1">
          Chat
        </span>
      </div>
      <ol className="flex h-96 flex-col gap-2 overflow-hidden [mask-image:linear-gradient(to_bottom,black_80%,transparent)]">
        {queueDemoPlaylistItems.slice(0, 2).map((item, index) => (
          <li key={item.id}>
            <QueueItem
              playlistItem={item}
              position={index + 1}
              providerLink={false}
              density="compact"
            />
          </li>
        ))}
        {imported.slice(0, count).map((item, index) => (
          <motion.li
            key={item.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <QueueItem
              playlistItem={item}
              position={index + 3}
              providerLink={false}
              density="compact"
            />
          </motion.li>
        ))}
      </ol>
    </motion.div>
  );
}
