import { useEffect, useState } from 'react';
import { useFetcher } from 'react-router';
import { getPreviousPath } from '../../../utils/navigationHistory';
import {
  clearRoomReminder,
  readRoomReminder,
} from '../../../utils/roomReminder';
import type { clientLoader } from '../../room-reminder/clientLoader';
import { ReturnToRoomCard } from './ReturnToRoomCard';

interface ReturnToRoomProps {
  onJoinRoom: (roomId: string) => void;
}

export function ReturnToRoom({ onJoinRoom }: ReturnToRoomProps) {
  const { data, load } = useFetcher<typeof clientLoader>();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Only a fresh document can offer a return. In-app navigation never does.
    const eligible =
      !dismissed && !getPreviousPath() && Boolean(readRoomReminder());
    const refresh = () => {
      if (
        !eligible ||
        document.visibilityState !== 'visible' ||
        !readRoomReminder()
      )
        return;
      void load('/resources/room-reminder');
    };
    refresh();
    const interval = eligible ? window.setInterval(refresh, 30_000) : null;
    const handlePageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      setDismissed(true);
      const roomId = readRoomReminder();
      if (roomId) clearRoomReminder(roomId);
    };
    window.addEventListener('pageshow', handlePageShow);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      if (interval !== null) window.clearInterval(interval);
      window.removeEventListener('pageshow', handlePageShow);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [dismissed, load]);

  const room = data?.room;
  if (!room || dismissed) return null;

  return (
    <ReturnToRoomCard
      room={room}
      onJoinRoom={onJoinRoom}
      onDismiss={() => {
        clearRoomReminder(room.id);
        setDismissed(true);
      }}
    />
  );
}
