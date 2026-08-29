import { classNames } from '@vibes/shared';
import { Button, SparklesIcon, Tooltip } from '@vibes/ui/web';
import type { ChangeEvent, KeyboardEvent } from 'react';

interface RoomJoinControlsProps {
  contained?: boolean;
  onJoinRoom: () => void;
  onRoomCodeChange: (value: string) => void;
  onStartSession: () => void;
  onToggleAIMode: () => void;
  placeholder: string;
  roomCode: string;
}

export function RoomJoinControls({
  contained = true,
  onJoinRoom,
  onRoomCodeChange,
  onStartSession,
  onToggleAIMode,
  placeholder,
  roomCode,
}: RoomJoinControlsProps) {
  const hasRoomCode = Boolean(roomCode.trim());
  const actionLabel = hasRoomCode ? 'Join Room' : 'Start a Session';

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
    <div className={classNames('space-y-5', contained ? 'mt-8' : 'mt-4')}>
      <div
        className={classNames(
          contained && 'panel-surface rounded-3xl p-4 sm:p-6',
        )}
      >
        <label
          htmlFor="room-name"
          className="mb-3 block font-pixel text-2xs text-theme-muted tracking-label"
        >
          ROOM NAME
        </label>
        <div className="relative">
          <input
            autoFocus
            id="room-name"
            type="text"
            placeholder={placeholder}
            value={roomCode}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="w-full rounded-2xl border border-theme bg-theme-surface py-4 pr-14 pl-4 font-mono text-base text-theme tracking-widest placeholder:text-theme-subtle focus:border-secondary focus:outline-hidden focus:ring-2 focus:ring-secondary/30"
            maxLength={20}
          />
          <span className="absolute top-1/2 right-2 -translate-y-1/2">
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
        className="h-16 w-full gap-4 font-pixel"
        contentAlignment={hasRoomCode ? 'center' : 'between'}
        onClick={handleSubmit}
        size="large"
        variant={hasRoomCode ? 'secondary' : 'primary'}
      >
        <span className={classNames(!hasRoomCode && 'text-left')}>
          {actionLabel}
        </span>
        {!hasRoomCode && (
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/25 text-white">
            +
          </span>
        )}
      </Button>
    </div>
  );
}
