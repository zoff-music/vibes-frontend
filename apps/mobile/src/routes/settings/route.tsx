import { Route } from '@vibes/native-router';
import { SettingsScreen } from './components/settings-screen';

export { ErrorBoundary } from '@/routes/_index/components/route-boundaries';

export default function SettingsRoute() {
  return (
    <Route routeId="settings">
      <SettingsScreen />
    </Route>
  );
}
