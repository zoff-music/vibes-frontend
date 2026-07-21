import type { Room } from '@vibes/models';
import { Button, ExternalLinkIcon, SkipIcon } from '@vibes/ui';

interface Props {
  canSkip: boolean;
  onSkip: () => void;
  room: Room;
  roomId: string;
  showSkip: boolean;
}

export function EmbedRoomHeader({
  canSkip,
  onSkip,
  room,
  roomId,
  showSkip,
}: Props) {
  const roomUrl = `/rooms/${encodeURIComponent(roomId)}`;

  return (
    <header className="flex items-center justify-between border-theme border-b px-4 py-3">
      <h1 className="min-w-0 truncate font-pixel text-sm text-theme">
        {room.name}
      </h1>
      <div className="ml-3 flex shrink-0 items-center gap-2">
        {showSkip && (
          <Button
            disabled={!canSkip}
            onClick={onSkip}
            title={canSkip ? 'Skip' : 'Skipping is unavailable'}
            aria-label={canSkip ? 'Skip' : 'Skipping is unavailable'}
            variant="tertiary"
            size="icon"
          >
            <SkipIcon className="h-5 w-5" />
          </Button>
        )}
        <a
          href={roomUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-theme bg-theme-surface p-2.5 text-theme transition-colors hover:border-theme-strong"
          title="Open room in a new tab"
          aria-label="Open room in a new tab"
        >
          <ExternalLinkIcon className="h-5 w-5" />
        </a>
      </div>
    </header>
  );
}
