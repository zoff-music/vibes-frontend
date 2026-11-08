import { useFetcher } from '@kasperrt/smolter/preact';
import type { RoomV2 } from '@vibes/models';
import type { TizenSkipData } from './routes/rooms.$id.skip/clientAction';

interface TizenRoomControlsProps {
  room: RoomV2;
  roomId: string;
  hasCurrentItem: boolean;
  onLeave: () => void;
}

export function TizenRoomControls({
  room,
  roomId,
  hasCurrentItem,
  onLeave,
}: TizenRoomControlsProps) {
  const fetcher = useFetcher<TizenSkipData>();
  const pending = fetcher.state !== 'idle';
  const isAdmin = Boolean(room.isAdmin);
  const isHost = Boolean(room.userId && room.hostId === room.userId);
  const allowed =
    (room.mode !== 'host' || isAdmin || isHost) &&
    (isAdmin || room.settings.skipAllowed);
  const result = fetcher.data?.result;
  const voted = Boolean(result?.voted || result?.alreadyVoted);
  let message = '';

  if (!allowed) message = 'Skipping is not allowed for this TV in this room.';

  if (result?.skipped) message = 'Skipped.';

  if (voted && !result?.skipped) {
    message = `Skip vote recorded (${result?.currentVotes}/${result?.requiredVotes}).`;
  }

  if (fetcher.data?.error) message = fetcher.data.error;

  return (
    <div className="shrink-0">
      <div className="tv-space-x-3 flex items-center">
        <fetcher.Form
          action={`/rooms/${encodeURIComponent(roomId)}/skip`}
          method="post"
        >
          <button
            className="border-tv-border bg-tv-surface rounded-xl border-2 px-4 py-2 text-sm disabled:opacity-40"
            disabled={!hasCurrentItem || !allowed || pending || voted}
            type="submit"
          >
            {pending ? 'Skipping…' : 'Skip'}
          </button>
        </fetcher.Form>
        <button
          className="border-tv-border bg-tv-surface rounded-xl border-2 px-4 py-2 text-sm"
          onClick={onLeave}
          type="button"
        >
          Leave
        </button>
      </div>
      <p
        aria-live="polite"
        className="text-tv-muted max-w-48 text-sm"
        role="status"
      >
        {message}
      </p>
    </div>
  );
}
