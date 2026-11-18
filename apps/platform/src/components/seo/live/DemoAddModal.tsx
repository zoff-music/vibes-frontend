import type { PlaylistItem } from '@vibes/models';
import {
  Button,
  CheckIcon,
  CloseIcon,
  IconButton,
  PlaylistItemSearchResult,
  ProviderIcon,
  SearchIcon,
  SoundCloudIcon,
  YouTubeIcon,
} from '@vibes/ui/web';
import { AnimatePresence, m as motion } from 'framer-motion';
import { useEffect, useState } from 'preact/compat';
import type { DemoModal } from '../hooks/useLiveRoomDemo';

interface DemoAddModalProps {
  modal: DemoModal;
  query: string;
  result: PlaylistItem;
  alternatives: PlaylistItem[];
  watch: boolean;
  typing: boolean;
}

const noop = () => {};

// The room's Add song dialog, drawn from the same pieces as AddToQueueModal.
export function DemoAddModal({
  modal,
  query,
  result,
  alternatives,
  watch,
  typing,
}: DemoAddModalProps) {
  const typed = useTypedQuery(query, typing);
  const label = watch ? 'video' : 'song';
  const text = modal === 'empty' ? '' : typed;

  return (
    <AnimatePresence>
      {modal !== 'closed' && (
        <motion.div
          key="modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="absolute inset-0 z-20 flex items-start justify-center bg-black/70 px-3 pt-3 backdrop-blur-md sm:px-6 sm:pt-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{
              type: 'spring',
              stiffness: 420,
              damping: 32,
              mass: 0.8,
            }}
            className="panel-strong shadow-primary-panel relative w-full max-w-2xl rounded-4xl p-5 sm:p-7"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-theme text-base">
                  {watch ? 'Add video' : 'Add song'}
                </p>
                <p className="text-theme-muted mt-1 text-xs">
                  Search by title, or paste a {label} or playlist link
                </p>
              </div>
              <IconButton variant="ghost" aria-label="Close" tabIndex={-1}>
                <CloseIcon className="h-5 w-5" />
              </IconButton>
            </div>
            <div className="mb-4 flex gap-2">
              <Button
                variant="tertiary"
                aria-pressed
                className="shrink-0 gap-2"
                tabIndex={-1}
              >
                <YouTubeIcon className="h-5 w-5" />
                Youtube
              </Button>
              {!watch && (
                <Button
                  variant="ghost"
                  className="shrink-0 gap-2"
                  tabIndex={-1}
                >
                  <SoundCloudIcon className="h-5 w-5" />
                  Soundcloud
                </Button>
              )}
            </div>

            {modal !== 'added' && (
              <div className="flex gap-2">
                <div
                  data-demo-target="search"
                  className="border-secondary/60 bg-theme-surface ring-secondary/30 flex h-14 min-w-0 flex-1 items-center rounded-full border ring-2"
                >
                  <span className="text-theme-muted shrink-0 pl-6 text-sm">
                    <SearchIcon className="size-5" />
                  </span>
                  <span className="text-theme min-w-0 truncate px-1 font-mono text-base">
                    {text}
                  </span>
                  {!text && (
                    <span className="text-theme-subtle truncate px-1 font-mono text-base">
                      Search youtube...
                    </span>
                  )}
                  {text && (
                    <IconButton
                      variant="ghost"
                      aria-label="Clear search"
                      className="mr-1 ml-auto"
                      tabIndex={-1}
                    >
                      <CloseIcon className="h-5 w-5" strokeWidth={2} />
                    </IconButton>
                  )}
                </div>
                <Button
                  data-demo-target="submit"
                  variant="primary"
                  className="h-14 w-14 shrink-0 gap-2 px-0! sm:w-40 sm:px-5!"
                  tabIndex={-1}
                >
                  <SearchIcon className="h-5 w-5" />
                  <span className="sr-only whitespace-nowrap sm:not-sr-only">
                    Search
                  </span>
                </Button>
              </div>
            )}

            {modal === 'results' && (
              <div className="animate-scale-in border-theme bg-theme-surface shadow-primary-popover mt-2 overflow-hidden rounded-2xl border">
                {[result, ...alternatives].map((item, index) => (
                  <div
                    key={item.id}
                    {...(index === 0 && { 'data-demo-target': 'result' })}
                  >
                    <PlaylistItemSearchResult
                      title={item.title}
                      publisher={item.publisher ?? 'Zoff preview'}
                      thumbnailUrl={item.thumbnailUrl}
                      durationSeconds={item.duration}
                      onSelect={noop}
                      attribution={
                        <span className="text-theme-muted flex min-w-10 shrink-0 items-center justify-center self-stretch px-2 sm:min-w-14 sm:px-4">
                          <ProviderIcon
                            provider={item.sourceType}
                            className="size-4"
                          />
                        </span>
                      }
                    />
                  </div>
                ))}
              </div>
            )}

            {modal === 'added' && (
              <div className="animate-scale-in border-secondary/40 bg-secondary/10 rounded-2xl border p-6 text-center sm:p-8">
                <div className="border-secondary/40 bg-secondary/20 mb-3 inline-flex size-16 items-center justify-center rounded-2xl border">
                  <CheckIcon className="text-secondary size-8" />
                </div>
                <p className="text-theme mb-2 text-base">Added to Queue!</p>
                <p className="text-theme-muted mb-1 text-sm">
                  Everyone will {watch ? 'see' : 'hear'} it soon
                </p>
                <p className="jp-art text-theme-subtle text-xs">
                  追加されました
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function useTypedQuery(query: string, typing: boolean) {
  const [length, setLength] = useState(query.length);

  useEffect(() => {
    if (!typing) {
      setLength(query.length);

      return;
    }

    setLength(0);

    const interval = window.setInterval(() => {
      setLength((value) => {
        if (value < query.length) return value + 1;

        window.clearInterval(interval);

        return value;
      });
    }, 70);

    return () => window.clearInterval(interval);
  }, [query, typing]);

  return query.slice(0, length);
}
