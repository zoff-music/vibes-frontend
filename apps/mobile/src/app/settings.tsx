import { Route } from '@vibes/native-router';
import SettingsScreen from '@/routes/settings/component';

export { ErrorBoundary } from '@/routes/_index/components';

export default function SettingsRoute() {
  return (
    <Route routeId="settings">
      <SettingsScreen />
    </Route>
  );
}
