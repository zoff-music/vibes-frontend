import { Button, SparklesIcon } from '@vibes/ui';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { Link } from 'react-router';

interface RoomJoinControlsProps {
  onJoinRoom: () => void;
  onRoomCodeChange: (value: string) => void;
  onToggleAIMode: () => void;
  placeholder: string;
  roomCode: string;
}

export function RoomJoinControls({
  onJoinRoom,
  onRoomCodeChange,
  onToggleAIMode,
  placeholder,
  roomCode,
}: RoomJoinControlsProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onRoomCodeChange(event.target.value.toLowerCase());
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onJoinRoom();
    }
  };

  return (
    <div className="mt-8 space-y-5">
      <div className="panel-surface rounded-3xl p-4 sm:p-6">
        <label
          htmlFor="room-name"
          className="mb-3 block font-pixel text-2xs text-theme-muted tracking-label"
        >
          ROOM NAME
        </label>
        <div className="relative">
          <input
            id="room-name"
            type="text"
            placeholder={placeholder}
            value={roomCode}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="w-full rounded-2xl border border-theme bg-theme-surface py-4 pr-14 pl-4 font-mono text-base text-theme tracking-widest placeholder:text-theme-subtle focus:border-secondary focus:outline-hidden focus:ring-2 focus:ring-secondary/30"
            maxLength={20}
          />
          <Button
            onClick={onToggleAIMode}
            variant="ghost"
            size="icon"
            aria-label="Toggle AI playlist generation"
            aria-pressed={false}
            title="Generate a music room with AI"
            className="absolute top-1/2 right-2 -translate-y-1/2"
          >
            <SparklesIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          viewTransition
          to={
            roomCode.trim()
              ? `/rooms/create?name=${encodeURIComponent(roomCode.trim())}`
              : '/rooms/create'
          }
          className="group flex h-16 w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border border-primary/50 bg-primary/95 px-6 py-4 font-pixel text-sm text-white shadow-primary-cta transition-all hover:-translate-y-0.5 hover:bg-primary"
        >
          Start a Session
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/25 text-white">
            +
          </span>
        </Link>
        <Button
          onClick={onJoinRoom}
          disabled={!roomCode.trim()}
          variant="secondary"
          size="large"
          className="h-16 w-full font-pixel"
        >
          Join Room
        </Button>
      </div>
    </div>
  );
}
