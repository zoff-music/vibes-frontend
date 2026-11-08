import { Button, CloseIcon } from '@vibes/ui/web';

interface ReturnToRoomCardProps {
  room: {
    id: string;
    name: string;
    listenerCount: number;
    playlistItem: { title: string; publisher?: string } | null;
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
      className="border-theme bg-theme fixed inset-x-4 bottom-4 z-40 rounded-2xl border shadow-lg sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-72"
    >
      <button
        type="button"
        onClick={() => onJoinRoom(room.id)}
        aria-label={`Rejoin ${room.name}`}
        className="hover:bg-theme-surface focus-visible:ring-secondary block w-full cursor-pointer rounded-2xl py-3 pr-12 pl-4 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none"
      >
        <span className="font-pixel text-theme block truncate text-sm">
          Back to <span className="text-primary">{room.name}</span>
        </span>
        {room.playlistItem && (
          <span
            className="text-theme-muted mt-1 block truncate text-xs"
            title={[room.playlistItem.title, room.playlistItem.publisher]
              .filter(Boolean)
              .join(' · ')}
          >
            {room.isPlaying ? 'Playing' : 'Paused'}:{' '}
            {[room.playlistItem.title, room.playlistItem.publisher]
              .filter(Boolean)
              .join(' · ')}
          </span>
        )}
        {!room.playlistItem && (
          <span className="text-theme-muted mt-1 block text-xs">
            Nothing playing right now
          </span>
        )}
        {room.listenerCount > 0 && (
          <span className="text-theme-muted mt-1 block text-xs">
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
