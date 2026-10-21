import { type PlaylistItem } from '@vibes/shared';
import { AnimatePresence, m as motion } from 'framer-motion';
import React, { useLayoutEffect, useRef } from 'preact/compat';
import { QueueItem } from './QueueItem';

interface QueueBlockProps {
  items: PlaylistItem[];
  index: number;
  start: number;
  total: number;
  visible: boolean;
  instant: boolean;
  initialItemIds: ReadonlySet<string>;
  currentItemIds: ReadonlySet<string>;
  onRemove?: (id: string) => void;
  onVote?: (id: string) => void;
  isAdmin?: boolean;
  votingPlaylistItemId?: string | null;
}

export const QueueBlock = React.memo(function QueueBlock({
  items,
  index,
  start,
  total,
  visible,
  instant,
  initialItemIds,
  currentItemIds,
  onRemove,
  onVote,
  isAdmin,
  votingPlaylistItemId,
}: QueueBlockProps) {
  const ref = useRef<HTMLLIElement>(null);
  const firstItemId = items[0]?.id;

  useLayoutEffect(() => {
    const block = ref.current;
    const row = [
      ...(block?.querySelectorAll<HTMLElement>('[data-queue-row]') ?? []),
    ].find((item) => item.dataset.queueRow === firstItemId);
    const list = block?.parentElement;
    if (!visible || !row || !list) return;

    // Rows have one-line titles and reserved artwork. Measure the real pitch
    // (including its Tailwind padding) to support font sizing and breakpoints.
    const measure = () => {
      if (row.offsetHeight > 0) {
        list.style.setProperty('--queue-row-size', `${row.offsetHeight}px`);
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(row);
    return () => observer.disconnect();
  }, [visible, firstItemId]);

  return (
    <li
      ref={ref}
      data-queue-block={index}
      role="presentation"
      className="h-[calc(var(--queue-row-size)*var(--queue-block-count))]"
      style={{ '--queue-block-count': items.length }}
    >
      {visible && (
        <ol role="presentation">
          <AnimatePresence initial={false} custom={currentItemIds}>
            {items.map((playlistItem, offset) => (
              <motion.li
                key={playlistItem.id}
                role="listitem"
                data-queue-row={playlistItem.id}
                aria-posinset={start + offset + 1}
                aria-setsize={total}
                className="pb-2"
                layout={instant ? false : 'position'}
                initial={
                  instant || initialItemIds.has(playlistItem.id)
                    ? false
                    : { opacity: 0, scale: 0.96, y: 14 }
                }
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit="exit"
                variants={{
                  exit: (itemIds: ReadonlySet<string>) => {
                    // Moving into a neighboring block is not a removed song.
                    // Only actual queue removals retain their fading exit row.
                    const skipExit = instant || itemIds.has(playlistItem.id);
                    return {
                      opacity: 0,
                      scale: skipExit ? 1 : 0.96,
                      y: skipExit ? 0 : -14,
                      transition: { duration: skipExit ? 0 : 0.16 },
                    };
                  },
                }}
                transition={{
                  type: 'spring',
                  stiffness: 420,
                  damping: 34,
                  opacity: { duration: instant ? 0 : 0.16 },
                  layout: { duration: instant ? 0 : 0.3, ease: 'easeOut' },
                }}
              >
                <QueueItem
                  playlistItem={playlistItem}
                  position={start + offset + 1}
                  isVoting={votingPlaylistItemId === playlistItem.id}
                  {...(onRemove && { onRemove })}
                  {...(onVote && { onVote })}
                  {...(isAdmin !== undefined && { isAdmin })}
                />
              </motion.li>
            ))}
          </AnimatePresence>
        </ol>
      )}
    </li>
  );
});
