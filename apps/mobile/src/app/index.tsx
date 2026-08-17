import { Route } from '@vibes/native-router';
import RoomsRoute from '@/routes/_index/component';

export { ErrorBoundary, HydrateFallback } from '@/routes/_index/components';
export { loader } from '@/routes/_index/loader';

export default function IndexRoute() {
  return (
    <Route routeId="_index">
      <RoomsRoute />
    </Route>
  );
}
