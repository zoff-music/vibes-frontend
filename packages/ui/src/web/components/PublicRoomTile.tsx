import { Link } from '@kasperrt/smolter/preact';
import type { PublicRoomV3 } from '@vibes/models';
import type { MouseEvent } from 'preact/compat';
import { getRoomLabels } from '../../shared/room';

interface PublicRoomTileProps {
  room: PublicRoomV3;
  onJoin?: (roomId: string) => void;
}

export function PublicRoomTile({ room, onJoin }: PublicRoomTileProps) {
  const labels = getRoomLabels(room.roomType);
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      !onJoin ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    onJoin(room.id);
  };

  return (
    <Link
      to={`/${encodeURIComponent(room.id)}`}
      prefetch="intent"
      onClick={handleClick}
      className="border-theme bg-theme-surface hover:border-theme-strong hover:bg-theme-hover focus-visible:ring-secondary focus-visible:ring-offset-theme flex h-full min-h-20 w-full items-center gap-3 rounded-3xl border px-5 py-4 text-left shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <span className="min-w-0 flex-1">
        <span className="font-pixel text-theme block truncate text-sm">
          {room.name}
        </span>
        <span className="text-theme-muted mt-1 block text-xs">
          {room.listenerCount} {labels.activity} · {room.playlistItemCount}{' '}
          {room.playlistItemCount === 1 ? labels.item : labels.items}
        </span>
      </span>
      <span className="font-pixel dark:text-secondary shrink-0 text-xs text-cyan-800">
        Join <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}
