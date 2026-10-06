import { useRoomStore } from '@vibes/shared';
import { ListenerCount } from '@vibes/ui/web';
import { useSyncExternalStore } from 'react';

interface UserCountProps {
  initialCount: number;
  roomId: string;
  roomType: RoomType;
}

export const UserCount = ({
  initialCount,
  roomId,
  roomType,
}: UserCountProps) => {
  const usersCount = useSyncExternalStore(
    useRoomStore.subscribe,
    () => {
      const state = useRoomStore.getState();
      if (state.room?.id !== roomId) return initialCount;
      return state.usersCount;
    },
    () => initialCount,
  );

  return <ListenerCount count={usersCount} roomType={roomType} />;
};

import type { RoomType } from '@vibes/models';
