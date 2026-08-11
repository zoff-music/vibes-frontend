import { resolveSongThumbnail, type Song } from '@vibes/shared';
import {
  formatPlaybackSeconds,
  getQueueRemainderLabel,
} from '@vibes/ui/shared';
import { ProviderIcon, VoteIcon } from '@vibes/ui/web';
import { useEffect, useRef, useState } from 'react';

interface Props {
  songs: Song[];
}

export function CastQueue({ songs }: Props) {
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

  const visibleSongs = songs.slice(0, visibleCount);
  const queueRemainderLabel = getQueueRemainderLabel(
    songs.length,
    visibleSongs.length,
  );

  return (
    <div
      ref={viewportRef}
      className="cast-queue-viewport flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      {songs.length === 0 && (
        <div className="cast-queue-empty flex h-full items-center justify-center rounded-2xl border border-theme text-center text-theme-muted">
          The queue is empty
        </div>
      )}
      {visibleSongs.length > 0 && (
        <>
          <div className="cast-queue-list shrink-0">
            {visibleSongs.map((song, index) => (
              <div
                key={song.id}
                className="cast-queue-card flex items-center gap-4 rounded-2xl border px-4"
              >
                <span className="w-7 shrink-0 text-center text-theme-subtle text-xs">
                  {index + 1}
                </span>
                <img
                  src={resolveSongThumbnail(song.thumbnailUrl)}
                  alt=""
                  decoding="async"
                  className="cast-queue-thumbnail h-16 w-16 shrink-0 rounded-xl border object-cover"
                />
                <div className="cast-queue-track-details min-w-0 flex-1">
                  <p className="truncate text-theme text-xs">{song.title}</p>
                  <p className="mt-1 truncate text-theme-muted text-xs">
                    {song.artist || 'Unknown Artist'} ·{' '}
                    {formatPlaybackSeconds(song.duration)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <div className="flex items-center gap-1 text-secondary">
                    <VoteIcon className="h-4 w-4" />
                    <span className="min-w-4 text-center text-xs tabular-nums">
                      {song.voteCount ?? 0}
                    </span>
                  </div>
                  <ProviderIcon
                    className="h-5 w-5 text-theme-muted"
                    provider={song.sourceType}
                  />
                </div>
              </div>
            ))}
          </div>
          {queueRemainderLabel && (
            <div className="flex min-h-7 flex-1 items-center justify-center text-theme-muted text-xs">
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
