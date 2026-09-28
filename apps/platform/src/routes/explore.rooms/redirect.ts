import { type LoaderFunctionArgs, redirect } from 'react-router';

export function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  return redirect(`/rooms/explore${url.search}`, 301);
}

export default function LegacyRoomBrowserRedirect() {
  return null;
}
