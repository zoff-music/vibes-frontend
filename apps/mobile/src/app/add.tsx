import { Route } from '@vibes/native-router';
import AddSongScreen from '@/routes/add/component';

export { ErrorBoundary } from '@/routes/_index/components';

export default function AddRoute() {
  return (
    <Route routeId="add">
      <AddSongScreen />
    </Route>
  );
}
