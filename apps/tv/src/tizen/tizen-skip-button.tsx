import type { RoomV2 } from '@vibes/models';
import { useFetcher } from 'react-router';
import type { TizenSkipData } from '@/tizen/routes/skip/action';

interface TizenSkipButtonProps {
  room: RoomV2;
  roomId: string;
  hasCurrentItem: boolean;
}

export function TizenSkipButton({
  room,
  roomId,
  hasCurrentItem,
}: TizenSkipButtonProps) {
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
    <div className="tv-space-x-4 mt-4 flex items-center">
      <fetcher.Form
        action={`/rooms/${encodeURIComponent(roomId)}/skip`}
        method="post"
      >
        <button
          className="min-h-14 rounded-xl border-2 border-tv-border bg-tv-surface px-6 py-3 text-xl disabled:opacity-40"
          disabled={!hasCurrentItem || !allowed || pending || voted}
          type="submit"
        >
          {pending ? 'Skipping…' : 'Skip'}
        </button>
      </fetcher.Form>
      <p aria-live="polite" className="text-lg text-tv-muted" role="status">
        {message}
      </p>
    </div>
  );
}
