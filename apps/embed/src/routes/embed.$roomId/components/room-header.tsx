import type { Room } from '@vibes/models';

interface Props {
  room: Room;
  roomId: string;
  isPlaying: boolean;
}

export function EmbedRoomHeader({ room, roomId, isPlaying }: Props) {
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
        <p className="mt-0.5 text-theme-muted text-xs">
          {isPlaying ? 'Now playing' : 'Paused'} on Zoff
        </p>
      </div>
      <span className="font-pixel text-primary text-xs tracking-widest">
        ZOFF
      </span>
    </header>
  );
}
