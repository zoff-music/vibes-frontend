import { type LoaderFunctionArgs, redirect } from 'react-router';

const destinations: Record<string, string> = {
  'listen-together': 'listening',
  'shared-music-queue': 'queue',
  'music-room': 'rooms',
  tv: 'apps',
  apps: 'apps',
};

export function loader({ params, request }: LoaderFunctionArgs) {
  const topic = params.topic;
  const { search } = new URL(request.url);
  if (topic === 'party-music') {
    return redirect(`/${search}#voting`, 301);
  }
  const destination =
    topic && Object.hasOwn(destinations, topic) ? destinations[topic] : null;
  if (!destination) {
    throw new Response('Page not found', { status: 404 });
  }
  return redirect(`/discovery/${destination}${search}`, 301);
}

export default function LegacyDiscoveryRedirect() {
  return null;
}
