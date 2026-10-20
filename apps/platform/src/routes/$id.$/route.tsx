export { clientAction } from './clientAction';
export { clientLoader } from './clientLoader';
// The application-level session owns the room view so providers and SSE
// survive same-document navigation when persistent playback is enabled.
export default function RoomRoute() {
  return null;
}
export { ErrorBoundary } from './ErrorBoundary';
export { loader } from './loader';
export { roomMeta as meta } from './meta';
export { shouldRevalidate } from './shouldRevalidate';
