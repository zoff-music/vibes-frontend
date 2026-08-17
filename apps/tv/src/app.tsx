import { Route } from '@vibes/native-router';
import { TvErrorBoundary } from '@/components/tv-error-boundary';
import { AppRouterProvider } from '@/data-router/provider';

export function App() {
  return (
    <TvErrorBoundary>
      <AppRouterProvider>
        <Route routeId="_index" />
      </AppRouterProvider>
    </TvErrorBoundary>
  );
}
