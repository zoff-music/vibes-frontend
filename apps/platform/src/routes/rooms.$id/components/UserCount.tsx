import { useRoomStore } from '@vibes/shared';
import { ListenerCount } from '@vibes/ui/web';
import { useSyncExternalStore } from 'react';

interface UserCountProps {
  initialCount: number;
  roomId: string;
}

export const UserCount = ({ initialCount, roomId }: UserCountProps) => {
  const usersCount = useSyncExternalStore(
    useRoomStore.subscribe,
    () => {
      const state = useRoomStore.getState();
      if (state.room?.id !== roomId) return initialCount;
      return state.usersCount;
    },
    () => initialCount,
  );

  return <ListenerCount count={usersCount} />;
};
