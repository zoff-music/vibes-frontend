import { Button, CloseIcon } from '@vibes/ui/web';

interface ReturnToRoomCardProps {
  room: {
    id: string;
    name: string;
    listenerCount: number;
    song: { title: string; artist?: string } | null;
    isPlaying: boolean;
  };
  onJoinRoom: (roomId: string) => void;
  onDismiss: () => void;
}

export function ReturnToRoomCard({
  room,
  onJoinRoom,
  onDismiss,
}: ReturnToRoomCardProps) {
  return (
    <aside
      aria-label="Return to your room"
      className="fixed inset-x-4 bottom-4 z-40 rounded-2xl border border-theme bg-theme shadow-lg sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-72"
    >
      <button
        type="button"
        onClick={() => onJoinRoom(room.id)}
        aria-label={`Rejoin ${room.name}`}
        className="block w-full cursor-pointer rounded-2xl py-3 pr-12 pl-4 text-left transition-colors hover:bg-theme-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
      >
        <span className="block truncate font-pixel text-sm text-theme">
          Back to <span className="text-primary">{room.name}</span>
        </span>
        {room.song && (
          <span
            className="mt-1 block truncate text-theme-muted text-xs"
            title={[room.song.title, room.song.artist]
              .filter(Boolean)
              .join(' · ')}
          >
            {room.isPlaying ? 'Playing' : 'Paused'}:{' '}
            {[room.song.title, room.song.artist].filter(Boolean).join(' · ')}
          </span>
        )}
        {!room.song && (
          <span className="mt-1 block text-theme-muted text-xs">
            Nothing playing right now
          </span>
        )}
        {room.listenerCount > 0 && (
          <span className="mt-1 block text-theme-muted text-xs">
            {room.listenerCount} listening
          </span>
        )}
      </button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-0 right-0"
        aria-label="Dismiss room reminder"
        onClick={onDismiss}
      >
        <CloseIcon className="size-4" />
      </Button>
    </aside>
  );
}
