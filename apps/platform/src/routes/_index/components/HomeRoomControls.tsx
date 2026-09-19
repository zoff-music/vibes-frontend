import type { RefObject } from 'react';
import { RoomJoinControls } from './RoomJoinControls';

interface HomeRoomControlsProps {
  onJoinRoom: (roomId?: string) => void;
  onRoomCodeChange: (value: string) => void;
  onStartSession: () => void;
  onToggleAIMode: () => void;
  placeholder: string;
  roomCode: string;
  inputRef: RefObject<HTMLInputElement | null>;
}

export function HomeRoomControls({
  onJoinRoom,
  onRoomCodeChange,
  onStartSession,
  onToggleAIMode,
  placeholder,
  roomCode,
  inputRef,
}: HomeRoomControlsProps) {
  const handleJoinRoom = () => {
    onJoinRoom();
  };

  return (
    <section aria-label="Join a room" className="min-w-0">
      <RoomJoinControls
        inputRef={inputRef}
        onJoinRoom={handleJoinRoom}
        onRoomCodeChange={onRoomCodeChange}
        onStartSession={onStartSession}
        onToggleAIMode={onToggleAIMode}
        placeholder={placeholder}
        roomCode={roomCode}
      />
    </section>
  );
}
