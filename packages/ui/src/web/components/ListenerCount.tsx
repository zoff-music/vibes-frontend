import type { RoomType } from '@vibes/models';
import { getRoomLabels } from '../../shared/room';

interface Props {
  count: number;
  roomType?: RoomType;
}

export function ListenerCount({ count, roomType = 'MUSIC' }: Props) {
  const labels = getRoomLabels(roomType);

  return (
    <div className="flex h-11 items-center gap-1.5 rounded-xl border border-theme bg-theme-surface px-3 text-theme">
      <div className="h-2 w-2 animate-pulse rounded-full bg-secondary" />
      <span className="text-2xs tracking-display">
        <span className="sm:hidden">{count}</span>
        <span className="hidden sm:inline">
          {count} {count === 1 ? labels.participant : labels.participants}
        </span>
      </span>
    </div>
  );
}
