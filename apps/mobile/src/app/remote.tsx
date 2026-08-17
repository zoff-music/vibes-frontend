import { Route } from '@vibes/native-router';
import RemoteScreen from '@/routes/remote/component';

export { ErrorBoundary } from '@/routes/_index/components';

export default function RemoteRoute() {
  return (
    <Route routeId="remote">
      <RemoteScreen />
    </Route>
  );
}
