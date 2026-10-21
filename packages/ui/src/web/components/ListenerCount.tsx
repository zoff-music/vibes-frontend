import type { RoomType } from '@vibes/models';
import { classNames } from '@vibes/shared';
import { getRoomLabels } from '../../shared/room';

interface Props {
  count: number;
  variant?: 'pill' | 'inline';
  className?: string;
  roomType?: RoomType;
}

export function ListenerCount({
  count,
  roomType = 'MUSIC',
  className,
  variant = 'pill',
}: Props) {
  const labels = getRoomLabels(roomType);

  return (
    <div
      className={classNames(
        'flex items-center gap-1.5',
        variant === 'pill'
          ? 'h-11 rounded-xl border border-theme bg-theme-surface px-3 text-theme'
          : 'text-theme-muted',
        className,
      )}
    >
      {variant === 'pill' && (
        <div className="h-2 w-2 animate-pulse rounded-full bg-secondary" />
      )}
      <span className="text-2xs tracking-display">
        <span className={variant === 'inline' ? 'hidden' : 'sm:hidden'}>
          {count}
        </span>
        <span className={variant === 'inline' ? 'inline' : 'hidden sm:inline'}>
          {count} {count === 1 ? labels.participant : labels.participants}
        </span>
      </span>
    </div>
  );
}
