import { useRoomStore } from '@vibes/shared';
import { ListenerCount } from '@vibes/ui/web';
import { useSyncExternalStore } from 'preact/compat';

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
  const usersCount = useSyncExternalStore(useRoomStore.subscribe, () => {
    const state = useRoomStore.getState();

    if (state.room?.id !== roomId) return initialCount || null;

    if (!state.hasLiveUsersCount && state.usersCount === 0) return null;

    return state.usersCount;
  });

  if (usersCount === null) {
    return (
      <span
        className="text-2xs text-theme-muted tracking-display"
        role="status"
      >
        Connecting…
      </span>
    );
  }

  return (
    <ListenerCount count={usersCount} roomType={roomType} variant="inline" />
  );
};

import type { RoomType } from '@vibes/models';
