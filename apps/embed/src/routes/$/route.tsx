import { useLoaderData } from '@kasperrt/smolter/preact';
import { getRoomAnalyticsPath, plausibleClient } from '@vibes/api';
import { useEffect } from 'preact/compat';
import { clientAction } from './clientAction';
import { EmbedRoomView } from './components/room-view';
import type { loader } from './loader';
import { shouldRevalidate } from './shouldRevalidate';

export { embedRoomClientLoader as clientLoader } from './clientLoader';
export { EmbedRoomErrorBoundary as ErrorBoundary } from './components/error-boundary';
export { EmbedRoomHydrateFallback as HydrateFallback } from './components/hydrate-fallback';
export { embedRoomMeta as meta } from './meta';
export { clientAction, shouldRevalidate };

export default function EmbedRoomRoute() {
  const loaderData = useLoaderData<typeof loader>();

  useEffect(() => {
    void plausibleClient.trackPageview({
      path: getRoomAnalyticsPath(loaderData.roomId),
      surface: 'embed',
    });
  }, [loaderData.roomId]);

  return <EmbedRoomView loaderData={loaderData} />;
}

export { loader } from './loader';
