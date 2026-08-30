import { getRoomAnalyticsPath, plausibleClient } from '@vibes/api';
import { useEffect } from 'react';
import { useLoaderData } from 'react-router';
import { clientAction } from './action';
import { embedRoomClientLoader } from './clientLoader';
import { EmbedRoomErrorBoundary } from './components/error-boundary';
import { EmbedRoomHydrateFallback } from './components/hydrate-fallback';
import { EmbedRoomView } from './components/room-view';
import { embedRoomLoader } from './loader';
import { embedRoomMeta } from './meta';
import { shouldRevalidate } from './shouldRevalidate';

export const ErrorBoundary = EmbedRoomErrorBoundary;
export const HydrateFallback = EmbedRoomHydrateFallback;
export { clientAction };
export const clientLoader = embedRoomClientLoader;
export const loader = embedRoomLoader;
export const meta = embedRoomMeta;
export { shouldRevalidate };

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
