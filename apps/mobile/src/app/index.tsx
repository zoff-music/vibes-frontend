import { Route } from '@vibes/native-router';
import { PersistentRoomPlayer } from '@/components/persistent-room-player';
import { usePlaybackSession, useRoomSession } from '@/providers/app-provider';
import RoomsRoute from '@/routes/_index/component';

export { ErrorBoundary, HydrateFallback } from '@/routes/_index/components';
export { loader } from '@/routes/_index/loader';

export default function IndexRoute() {
  const { playerEnabled, playerPreferenceLoaded } = usePlaybackSession();
  const { roomId } = useRoomSession();
  let content = <RoomsRoute />;
  if (roomId) {
    content = (
      <Route persistent params={{ id: roomId }} routeId="rooms.$id">
        <RoomsRoute />
        {playerPreferenceLoaded && playerEnabled && <PersistentRoomPlayer />}
      </Route>
    );
  }
  return <Route routeId="_index">{content}</Route>;
}
