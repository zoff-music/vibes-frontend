import { Route } from '@vibes/native-router';
import { RemoteScreen } from './components/remote-screen';

export { ErrorBoundary } from '@/routes/_index/components/route-boundaries';

export default function RemoteRoute() {
  return (
    <Route routeId="remote">
      <RemoteScreen />
    </Route>
  );
}
