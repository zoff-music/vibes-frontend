import { useRouteError } from '@kasperrt/smolter/preact';
import { RemoteErrorView } from '../../components/RemoteErrorView';
import { getPublicRouteErrorMessage } from '../../utils/routeError';

export function ErrorBoundary() {
  const error = useRouteError();

  return (
    <RemoteErrorView
      message={getPublicRouteErrorMessage(error)}
      title="Remote control unavailable"
    />
  );
}
