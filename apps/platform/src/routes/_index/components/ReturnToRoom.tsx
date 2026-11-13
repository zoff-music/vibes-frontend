import { useFetcher, useURLLocation } from '@kasperrt/smolter/preact';
import { useEffect, useRef, useState } from 'preact/compat';
import { useAutoRejoinStore } from '../../../stores/autoRejoinStore';
import { usePersistentPlayerStore } from '../../../stores/persistentPlayerStore';
import { getPreviousPath } from '../../../utils/navigationHistory';
import {
  clearRoomReminder,
  readRoomReminder,
} from '../../../utils/roomReminder';
import type { clientLoader } from '../../resources.recents/clientLoader';
import { ReturnToRoomCard } from './ReturnToRoomCard';

interface ReturnToRoomProps {
  onJoinRoom: (roomId: string) => void;
}

export function ReturnToRoom({ onJoinRoom }: ReturnToRoomProps) {
  const location = useURLLocation();
  const settingsOpen = location.pathname.endsWith('/settings/device');
  const { data, load } = useFetcher<typeof clientLoader>();
  // Apply the preference on arrival, never while editing settings on this visit.
  const [autoRejoin] = useState(() => useAutoRejoinStore.getState().enabled);
  const attempted = useRef(false);
  const [dismissed, setDismissed] = useState(false);
  const activeRoomId = usePersistentPlayerStore((state) => state.activeRoomId);

  useEffect(() => {
    // Only a fresh document can offer a return. In-app navigation never does.
    const eligible =
      !settingsOpen &&
      !activeRoomId &&
      !dismissed &&
      !getPreviousPath() &&
      Boolean(readRoomReminder());
    const refresh = () => {
      if (
        !eligible ||
        document.visibilityState !== 'visible' ||
        !readRoomReminder()
      )
        return;

      void load('/resources/recents');
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
  }, [activeRoomId, dismissed, load, settingsOpen]);

  const room = data?.room;

  useEffect(() => {
    if (
      settingsOpen ||
      !room ||
      !autoRejoin ||
      dismissed ||
      activeRoomId ||
      attempted.current ||
      getPreviousPath() ||
      readRoomReminder() !== room.id
    )
      return;
    attempted.current = true;
    onJoinRoom(room.id);
  }, [room, autoRejoin, dismissed, activeRoomId, onJoinRoom, settingsOpen]);

  if (settingsOpen || !room || dismissed || activeRoomId || autoRejoin)
    return null;

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
