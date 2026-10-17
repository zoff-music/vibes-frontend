import { TvErrorBoundary } from '@/components/tv-error-boundary';
import { TvHome } from '@/screens/tv-home';

export function App() {
  return (
    <TvErrorBoundary>
      <TvHome />
    </TvErrorBoundary>
  );
}
