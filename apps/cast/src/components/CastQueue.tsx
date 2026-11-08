import { type PlaylistItem, resolvePlaylistItemThumbnail } from '@vibes/shared';
import {
  formatPlaybackSeconds,
  getQueueRemainderLabel,
} from '@vibes/ui/shared';
import { ProviderIcon, VoteIcon } from '@vibes/ui/web';
import { useEffect, useRef, useState } from 'preact/compat';

interface Props {
  playlistItems: PlaylistItem[];
}

export function CastQueue({ playlistItems }: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) return;

    const updateVisibleCount = () => {
      const height = viewport.getBoundingClientRect().height;
      const styles = window.getComputedStyle(viewport);
      const trackHeight =
        Number.parseFloat(
          styles.getPropertyValue('--cast-queue-track-height'),
        ) || TRACK_HEIGHT;
      const trackGap =
        Number.parseFloat(styles.getPropertyValue('--cast-queue-track-gap')) ||
        TRACK_GAP;
      setVisibleCount(
        Math.max(0, Math.floor((height + trackGap) / (trackHeight + trackGap))),
      );
    };

    updateVisibleCount();
    const resizeObserver = new ResizeObserver(updateVisibleCount);
    resizeObserver.observe(viewport);

    return () => resizeObserver.disconnect();
  }, []);

  const visiblePlaylistItems = playlistItems.slice(0, visibleCount);
  const queueRemainderLabel = getQueueRemainderLabel(
    playlistItems.length,
    visiblePlaylistItems.length,
  );

  return (
    <div
      ref={viewportRef}
      className="cast-compact:[--cast-queue-track-gap:8px] cast-compact:[--cast-queue-track-height:72px] flex min-h-0 flex-1 flex-col overflow-hidden [--cast-queue-track-gap:12px] [--cast-queue-track-height:96px] max-sm:[--cast-queue-track-gap:6px] max-sm:[--cast-queue-track-height:64px]"
    >
      {playlistItems.length === 0 && (
        <div className="border-cast-border bg-surface/88 text-text-muted dark:border-cast-border-dark dark:bg-cast-surface-dark/88 dark:text-dark-text-muted flex h-full items-center justify-center rounded-2xl border text-center">
          The queue is empty
        </div>
      )}
      {visiblePlaylistItems.length > 0 && (
        <>
          <div className="flex shrink-0 flex-col gap-(--cast-queue-track-gap)">
            {visiblePlaylistItems.map((playlistItem, index) => (
              <div
                key={playlistItem.id}
                className="cast-compact:gap-3 border-cast-border bg-surface cast-compact:px-3 dark:border-cast-border-dark dark:bg-cast-surface-dark flex h-(--cast-queue-track-height) items-center gap-4 rounded-2xl border px-4 max-sm:gap-2 max-sm:px-2"
              >
                <span className="text-text-subtle dark:text-dark-text-subtle w-7 shrink-0 text-center text-xs">
                  {index + 1}
                </span>
                <img
                  src={resolvePlaylistItemThumbnail(playlistItem.thumbnailUrl)}
                  alt=""
                  decoding="async"
                  loading="lazy"
                  className="cast-compact:h-12 cast-compact:w-12 border-cast-border bg-surface dark:border-cast-border-dark dark:bg-cast-surface-dark h-16 w-16 shrink-0 rounded-xl border object-cover max-sm:h-10 max-sm:w-10"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-text dark:text-dark-text truncate text-xs">
                    {playlistItem.title}
                  </p>
                  <p className="text-text-muted dark:text-dark-text-muted mt-1 truncate text-xs">
                    {playlistItem.publisher || 'Unknown Artist'} ·{' '}
                    {formatPlaybackSeconds(playlistItem.duration)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <div className="text-secondary flex items-center gap-1">
                    <VoteIcon className="h-4 w-4" />
                    <span className="min-w-4 text-center text-xs tabular-nums">
                      {playlistItem.voteCount ?? 0}
                    </span>
                  </div>
                  <ProviderIcon
                    className="text-text-muted dark:text-dark-text-muted h-5 w-5"
                    provider={playlistItem.sourceType}
                  />
                </div>
              </div>
            ))}
          </div>
          {queueRemainderLabel && (
            <div className="text-text-muted dark:text-dark-text-muted flex min-h-7 flex-1 items-center justify-center text-xs">
              {queueRemainderLabel}
            </div>
          )}
        </>
      )}
    </div>
  );
}

const TRACK_GAP = 12;

const TRACK_HEIGHT = 96;
