import { Link } from '@kasperrt/smolter/preact';
import { type PlaylistItem, usePageVisibility } from '@vibes/shared';
import { LayoutGroup, useReducedMotion } from 'framer-motion';
import React from 'preact/compat';
import { useQueueWindow } from '../../hooks/useQueueWindow';
import { QueueEmptyIcon } from '../../icons';
import { QueueBlock } from './QueueBlock';

interface Props {
  playlistItems: PlaylistItem[];
  roomId?: string;
  onRemove?: (id: string) => void;
  onVote?: (id: string) => void;
  emptyHref?: string;
  isAdmin?: boolean;
  votingPlaylistItemId?: string | null;
}

interface WindowBlock {
  start: number;
  items: PlaylistItem[];
}

const EmptyQueueContent = () => (
  <>
    <div className="mb-5 inline-flex h-20 w-20 items-center justify-center rounded-2xl border border-theme bg-theme-surface">
      <QueueEmptyIcon className="h-10 w-10 text-theme-muted" />
    </div>
    <h3 className="mb-2 font-display text-base text-theme">Queue is Empty</h3>
    <p className="mb-2 text-sm text-theme-muted">
      Add some songs to get the party started
    </p>
    <p className="jp-art text-theme-subtle text-xs">曲を追加</p>
  </>
);

const QueueListComponent: React.FC<Props> = ({
  playlistItems,
  roomId: _roomId,
  onRemove,
  onVote,
  emptyHref,
  isAdmin,
  votingPlaylistItemId,
}) => {
  const blocks = React.useMemo(() => {
    const result: WindowBlock[] = [];
    for (let start = 0; start < playlistItems.length; start += blockSize) {
      result.push({
        start,
        items: playlistItems.slice(start, start + blockSize),
      });
    }
    return result;
  }, [playlistItems]);
  const [focusedItemId, setFocusedItemId] = React.useState<string | null>(null);
  const focusedControl = React.useRef(0);
  const focusedIndex = playlistItems.findIndex(
    (item) => item.id === focusedItemId,
  );
  const focusedBlock =
    focusedIndex >= 0 ? Math.floor(focusedIndex / blockSize) : null;
  const [initialItemIds] = React.useState(
    () => new Set(playlistItems.map((item) => item.id)),
  );
  const currentItemIds = React.useMemo(
    () => new Set(playlistItems.map((item) => item.id)),
    [playlistItems],
  );
  const reducedMotion = useReducedMotion();
  const pageVisible = usePageVisibility();
  const { ref, visibleBlocks } = useQueueWindow(blocks.length, pageVisible);
  const instant = reducedMotion || !pageVisible;

  React.useLayoutEffect(() => {
    const list = ref.current;
    if (
      !list ||
      !pageVisible ||
      focusedItemId === null ||
      focusedBlock === null
    )
      return;

    const active = document.activeElement;
    const activeRow = active?.closest<HTMLElement>('[data-queue-row]');
    if (
      active !== document.body &&
      activeRow?.dataset.queueRow !== focusedItemId
    )
      return;

    // Reordering across a window boundary remounts that row. Restore the same
    // control without scrolling or stealing focus from somewhere else.
    const block = list.querySelector(`[data-queue-block="${focusedBlock}"]`);
    const row = [
      ...(block?.querySelectorAll<HTMLElement>('[data-queue-row]') ?? []),
    ].find((item) => item.dataset.queueRow === focusedItemId);
    const control =
      row?.querySelectorAll<HTMLElement>('a,button')[focusedControl.current];
    if (control && control !== active) control.focus({ preventScroll: true });
  }, [focusedBlock, focusedItemId, pageVisible, ref]);

  if (playlistItems.length === 0) {
    if (emptyHref) {
      return (
        <Link
          aria-label="Add a song"
          className="panel-surface flex min-h-full w-full flex-1 animate-fade-in cursor-pointer flex-col items-center justify-center rounded-3xl px-4 py-20 text-center transition-[border-color,background-color,transform] hover:border-secondary/50 hover:bg-theme-surface focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-secondary/60 active:scale-press sm:px-12"
          to={emptyHref}
          replace
          preventScrollReset
          viewTransition={false}
          prefetch="intent"
          prefetchData
        >
          <EmptyQueueContent />
        </Link>
      );
    }

    return (
      <div className="panel-surface flex min-h-full flex-1 animate-fade-in flex-col items-center justify-center rounded-3xl px-4 py-20 text-center sm:px-12">
        <EmptyQueueContent />
      </div>
    );
  }

  return (
    <ol
      ref={ref}
      aria-label="Upcoming songs"
      className="relative [--queue-row-size:5.125rem] sm:[--queue-row-size:5.625rem]"
      onFocusCapture={(event) => {
        const target = event.target as HTMLElement;
        const row = target.closest<HTMLElement>('[data-queue-row]');
        focusedControl.current = row
          ? [...row.querySelectorAll('a,button')].indexOf(target)
          : 0;
        setFocusedItemId(row?.dataset.queueRow ?? null);
      }}
      onBlurCapture={(event) => {
        const target = event.relatedTarget;
        const row =
          target instanceof HTMLElement && ref.current?.contains(target)
            ? target.closest<HTMLElement>('[data-queue-row]')
            : null;
        setFocusedItemId(row?.dataset.queueRow ?? null);
      }}
    >
      {/* Drop stale projections and pending exits on either visibility edge.
          Only queue rows remount; the room session and players stay mounted. */}
      <LayoutGroup key={String(pageVisible)}>
        {blocks.map(({ items, start }, index) => (
          <QueueBlock
            key={start}
            index={index}
            start={start}
            total={playlistItems.length}
            items={items}
            visible={
              visibleBlocks.has(index) ||
              (focusedBlock !== null && Math.abs(index - focusedBlock) <= 1)
            }
            instant={instant}
            initialItemIds={initialItemIds}
            currentItemIds={currentItemIds}
            {...(onRemove && { onRemove })}
            {...(onVote && { onVote })}
            {...(isAdmin !== undefined && { isAdmin })}
            {...(votingPlaylistItemId !== undefined && {
              votingPlaylistItemId,
            })}
          />
        ))}
      </LayoutGroup>
    </ol>
  );
};

export const QueueList = React.memo(QueueListComponent);

const blockSize = 12;
