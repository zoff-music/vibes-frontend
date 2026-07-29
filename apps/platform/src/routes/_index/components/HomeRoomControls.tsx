import type { PublicRoom } from '@vibes/models';
import { classNames } from '@vibes/shared';
import { Button, Tooltip } from '@vibes/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { PublicRoomDiscovery } from './PublicRoomDiscovery';
import { RoomJoinControls } from './RoomJoinControls';

interface HomeRoomControlsProps {
  onJoinRoom: (roomId?: string) => void;
  onRoomCodeChange: (value: string) => void;
  onToggleAIMode: () => void;
  placeholder: string;
  roomCode: string;
  rooms: PublicRoom[];
}

type HomeRoomMode = 'browse' | 'join';

export function HomeRoomControls({
  onJoinRoom,
  onRoomCodeChange,
  onToggleAIMode,
  placeholder,
  roomCode,
  rooms,
}: HomeRoomControlsProps) {
  const [mode, setMode] = useState<HomeRoomMode>('join');

  const handleJoinMode = () => {
    setMode('join');
  };

  const handleBrowseMode = () => {
    setMode('browse');
  };

  const handleJoinRoom = () => {
    onJoinRoom();
  };

  return (
    <section
      aria-label="Join a room"
      className="panel-surface mt-8 rounded-3xl p-4 sm:p-6"
    >
      <div className="grid grid-cols-2 gap-1 rounded-2xl border border-theme bg-theme-surface/80 p-1">
        <ModeButton
          active={mode === 'join'}
          label="Join by name"
          onClick={handleJoinMode}
        />
        <ModeButton
          active={mode === 'browse'}
          disabled={rooms.length === 0}
          label="Browse live"
          onClick={handleBrowseMode}
        />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={mode}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: mode === 'browse' ? 8 : -8 }}
          initial={{ opacity: 0, x: mode === 'browse' ? -8 : 8 }}
          transition={{ duration: 0.16 }}
        >
          {mode === 'join' && (
            <RoomJoinControls
              contained={false}
              onJoinRoom={handleJoinRoom}
              onRoomCodeChange={onRoomCodeChange}
              onToggleAIMode={onToggleAIMode}
              placeholder={placeholder}
              roomCode={roomCode}
            />
          )}
          {mode === 'browse' && (
            <PublicRoomDiscovery onJoinRoom={onJoinRoom} rooms={rooms} />
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

interface ModeButtonProps {
  active: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}

function ModeButton({
  active,
  disabled = false,
  label,
  onClick,
}: ModeButtonProps) {
  const button = (
    <Button
      aria-pressed={active}
      className={classNames(
        'relative w-full rounded-xl px-3 py-2 font-pixel text-3xs',
        active && 'text-theme',
        !active && 'text-theme-subtle hover:bg-primary/10 hover:text-theme',
        disabled && 'pointer-events-none',
      )}
      disabled={disabled}
      onClick={onClick}
      size="none"
      title={
        disabled ? 'No public rooms have active listeners right now' : label
      }
      variant="ghost"
    >
      {active && (
        <motion.span
          className="absolute inset-0 rounded-xl border border-primary/50 bg-linear-to-r from-primary/25 to-secondary/20 shadow-primary-soft"
          layoutId="home-room-mode"
          transition={{ type: 'spring', stiffness: 450, damping: 36 }}
        />
      )}
      <span className="relative z-10">{label}</span>
    </Button>
  );

  if (!disabled) {
    return button;
  }

  return (
    <Tooltip
      align="end"
      className="block"
      content="No public rooms have active listeners right now"
      side="bottom"
    >
      {button}
    </Tooltip>
  );
}
