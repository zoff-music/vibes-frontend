import { RoomJoinControls } from './RoomJoinControls';

interface HomeRoomControlsProps {
  onJoinRoom: (roomId?: string) => void;
  onRoomCodeChange: (value: string) => void;
  onStartSession: () => void;
  onToggleAIMode: () => void;
  placeholder: string;
  roomCode: string;
}

export function HomeRoomControls({
  onJoinRoom,
  onRoomCodeChange,
  onStartSession,
  onToggleAIMode,
  placeholder,
  roomCode,
}: HomeRoomControlsProps) {
  const handleJoinRoom = () => {
    onJoinRoom();
  };

  return (
    <section aria-label="Join a room" className="min-w-0">
      <RoomJoinControls
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
