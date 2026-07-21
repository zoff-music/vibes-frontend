import { useLoaderData } from 'react-router';
import { EmbedRoomErrorBoundary } from './components/error-boundary';
import { EmbedRoomHydrateFallback } from './components/hydrate-fallback';
import { EmbedRoomView } from './components/room-view';
import { embedRoomLoader } from './loader';

export const ErrorBoundary = EmbedRoomErrorBoundary;
export const HydrateFallback = EmbedRoomHydrateFallback;
export const loader = embedRoomLoader;

export default function EmbedRoomRoute() {
  const loaderData = useLoaderData<typeof loader>();
  return <EmbedRoomView loaderData={loaderData} />;
}
