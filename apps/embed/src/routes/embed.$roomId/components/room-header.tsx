import type { Room } from '@vibes/models';

interface EmbedRoomHeaderProps {
  room: Room;
  roomId: string;
  isPlaying: boolean;
}

export function EmbedRoomHeader({
  room,
  roomId,
  isPlaying,
}: EmbedRoomHeaderProps) {
  return (
    <header className="flex items-center justify-between border-theme border-b px-4 py-3">
      <div className="min-w-0">
        <a
          href={`https://zoff.me/rooms/${encodeURIComponent(roomId)}`}
          target="_blank"
          rel="noreferrer"
          className="block cursor-pointer truncate font-pixel text-sm text-theme hover:text-primary"
        >
          {room.name}
        </a>
        <p className="mt-0.5 text-[10px] text-theme-muted">
          {isPlaying ? 'Now playing' : 'Paused'} on Zoff
        </p>
      </div>
      <span className="font-pixel text-[10px] text-primary tracking-[0.2em]">
        ZOFF
      </span>
    </header>
  );
}
