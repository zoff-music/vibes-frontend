import { useState } from 'react';
import { ReturnToRoomCard } from './ReturnToRoomCard';

interface ReturnToRoomPreviewProps {
  onJoinRoom: (roomId: string) => void;
  listenerCount: number;
}

// Local fixture reuses the real card and never requests a room.
export function ReturnToRoomPreview({
  onJoinRoom,
  listenerCount,
}: ReturnToRoomPreviewProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <ReturnToRoomCard
      room={{
        id: 'electro',
        name: 'electro',
        listenerCount,
        song: { title: 'Midnight City', artist: 'M83' },
        isPlaying: true,
      }}
      onJoinRoom={onJoinRoom}
      onDismiss={() => setDismissed(true)}
    />
  );
}
