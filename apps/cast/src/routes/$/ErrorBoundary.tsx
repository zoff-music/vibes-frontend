import { useRouteError } from '@kasperrt/smolter/preact';
import { CastRecoveryView } from '../../components/CastErrorBoundary';

export function ErrorBoundary() {
  useRouteError();

  return <CastRecoveryView />;
}
