import type { PublicRoom } from '@vibes/models';
import { PublicRoomDiscovery } from './PublicRoomDiscovery';
import { RoomJoinControls } from './RoomJoinControls';

interface HomeRoomControlsProps {
  onJoinRoom: (roomId?: string) => void;
  onRoomCodeChange: (value: string) => void;
  onStartSession: () => void;
  onToggleAIMode: () => void;
  placeholder: string;
  roomCode: string;
  rooms: PublicRoom[];
}

export function HomeRoomControls({
  onJoinRoom,
  onRoomCodeChange,
  onStartSession,
  onToggleAIMode,
  placeholder,
  roomCode,
  rooms,
}: HomeRoomControlsProps) {
  const handleJoinRoom = () => {
    onJoinRoom();
  };

  return (
    <section
      aria-label="Join a room"
      className="panel-surface mt-8 rounded-3xl p-4 sm:p-6"
    >
      <RoomJoinControls
        contained={false}
        onJoinRoom={handleJoinRoom}
        onRoomCodeChange={onRoomCodeChange}
        onStartSession={onStartSession}
        onToggleAIMode={onToggleAIMode}
        placeholder={placeholder}
        roomCode={roomCode}
      />
      <PublicRoomDiscovery onJoinRoom={onJoinRoom} rooms={rooms} />
    </section>
  );
}
