import {
  useParams,
  useRevalidator,
  useRouteError,
} from '@kasperrt/smolter/preact';
import { NotFoundPage } from '../../components/not-found/NotFoundPage';
import { RoomErrorView } from './components/RoomErrorView';
import { normalizeRouteError } from './utils/normalizeRouteError';

export function ErrorBoundary() {
  const routeError = useRouteError();
  const { id = '' } = useParams<{
    id: string;
  }>();
  const revalidator = useRevalidator();
  const publicError = normalizeRouteError(routeError);

  if (publicError.isRoomNotFound) {
    return <NotFoundPage />;
  }

  return (
    <div className="relative z-10 flex min-h-screen">
      <RoomErrorView
        isRoomNotFound={publicError.isRoomNotFound}
        message={publicError.message}
        roomId={id}
        onRetry={revalidator}
      />
    </div>
  );
}
