import { useRoomStore } from '@vibes/shared';
import { ListenerCount } from '@vibes/ui/web';

export const UserCount = () => {
  const usersCount = useRoomStore((state) => state.usersCount);

  return <ListenerCount count={usersCount} />;
};
