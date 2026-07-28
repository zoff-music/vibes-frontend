import type {
  ClientLoaderFunctionArgs,
  LoaderFunctionArgs,
} from 'react-router';
import { redirect } from 'react-router';
import { clientAction } from '../rooms.$id/action';

export { clientAction };

export function loader({ params, request }: LoaderFunctionArgs) {
  return redirectToCanonicalRoom(params.id, request.url);
}

export function clientLoader({ params, request }: ClientLoaderFunctionArgs) {
  return redirectToCanonicalRoom(params.id, request.url);
}

export default function RoomAlias() {
  return null;
}

function redirectToCanonicalRoom(
  roomId: string | undefined,
  requestUrl: string,
) {
  if (!roomId) {
    return redirect('/');
  }

  const url = new URL(requestUrl);
  return redirect(`/${encodeURIComponent(roomId)}${url.search}`);
}
