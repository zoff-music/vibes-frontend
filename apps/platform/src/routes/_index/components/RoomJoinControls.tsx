import { ArrowRightIcon, Button, SparklesIcon, Tooltip } from '@vibes/ui/web';
import type { ChangeEvent, KeyboardEvent } from 'react';

interface RoomJoinControlsProps {
  onJoinRoom: () => void;
  onRoomCodeChange: (value: string) => void;
  onStartSession: () => void;
  onToggleAIMode: () => void;
  placeholder: string;
  roomCode: string;
}

export function RoomJoinControls({
  onJoinRoom,
  onRoomCodeChange,
  onStartSession,
  onToggleAIMode,
  placeholder,
  roomCode,
}: RoomJoinControlsProps) {
  const hasRoomCode = Boolean(roomCode.trim());
  const actionLabel = hasRoomCode ? 'Join room' : 'Start a room';

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onRoomCodeChange(event.target.value.toLowerCase());
  };

  const handleSubmit = () => {
    if (hasRoomCode) {
      onJoinRoom();
      return;
    }

    onStartSession();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_13rem] md:items-end">
      <div className="min-w-0">
        <label
          htmlFor="room-name"
          className="mb-2 flex h-5 items-center font-pixel text-sm text-theme-muted"
        >
          Room name
        </label>
        <div className="flex h-14 min-w-0 items-center rounded-2xl border border-theme bg-theme-surface transition-colors focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/30">
          <span
            aria-hidden="true"
            className="shrink-0 pl-4 text-sm text-theme-subtle"
          >
            zoff.me/
          </span>
          <input
            id="room-name"
            type="text"
            placeholder={placeholder}
            value={roomCode}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="h-full min-w-0 flex-1 bg-transparent px-1 font-mono text-base text-theme placeholder:text-theme-subtle focus:outline-none"
            maxLength={20}
            autoCapitalize="none"
            autoComplete="off"
            spellCheck={false}
          />
          <span className="shrink-0 border-theme border-l px-1">
            <Tooltip
              align="end"
              className="inline-flex"
              content="Generate a music room with AI"
            >
              <Button
                aria-label="Toggle AI playlist generation"
                aria-pressed={false}
                onClick={onToggleAIMode}
                size="icon"
                variant="ghost"
              >
                <SparklesIcon className="h-5 w-5" />
              </Button>
            </Tooltip>
          </span>
        </div>
      </div>

      <Button
        className="h-14 w-full gap-4 font-pixel"
        contentAlignment="between"
        onClick={handleSubmit}
        size="large"
        variant="primary"
      >
        <span>{actionLabel}</span>
        <ArrowRightIcon aria-hidden="true" className="h-5 w-5 shrink-0" />
      </Button>
    </div>
  );
}
