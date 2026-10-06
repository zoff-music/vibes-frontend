import type { PublicRoomV3 } from '@vibes/models';
import type { MouseEvent } from 'react';
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
    <a
      href={`/${encodeURIComponent(room.id)}`}
      onClick={handleClick}
      aria-label={`Join ${room.name}, ${room.listenerCount} ${room.listenerCount === 1 ? labels.participant : labels.participants}, ${room.playlistItemCount} ${room.playlistItemCount === 1 ? labels.item : labels.items}`}
      className="flex min-h-16 w-full items-center gap-3 rounded-2xl border border-theme bg-theme-surface px-4 py-3 text-left shadow-sm transition-colors hover:border-theme-strong hover:bg-theme-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-theme"
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate font-pixel text-sm text-theme">
          {room.name}
        </span>
        <span className="mt-1 block text-theme-muted text-xs">
          {room.listenerCount} {labels.activity} · {room.playlistItemCount}{' '}
          {room.playlistItemCount === 1 ? labels.item : labels.items}
        </span>
      </span>
      <span
        aria-hidden="true"
        className="shrink-0 font-pixel text-cyan-800 text-xs dark:text-secondary"
      >
        Join →
      </span>
    </a>
  );
}
