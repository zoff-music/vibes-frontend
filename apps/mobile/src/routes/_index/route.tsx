import { Route } from '@vibes/native-router';
import { PersistentRoomPlayer } from '@/components/persistent-room-player';
import { usePlaybackSession, useRoomSession } from '@/providers/app-provider';
import { RoomsScreen } from './components/rooms-screen';

export {
  ErrorBoundary,
  HydrateFallback,
} from './components/route-boundaries';
export { loader } from './loader';

export default function IndexRoute() {
  const { playerEnabled, playerPreferenceLoaded } = usePlaybackSession();
  const { roomId } = useRoomSession();
  let content = <RoomsScreen />;
  if (roomId) {
    content = (
      <Route persistent params={{ id: roomId }} routeId="rooms.$id">
        <RoomsScreen />
        {playerPreferenceLoaded && playerEnabled && <PersistentRoomPlayer />}
      </Route>
    );
  }
  return <Route routeId="_index">{content}</Route>;
}
