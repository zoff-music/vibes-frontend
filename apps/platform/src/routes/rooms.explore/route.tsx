import { useLoaderData } from '@kasperrt/smolter/preact';
import { RoomBrowser } from './components/RoomBrowser';
import { loader } from './loader';
export const id = 'routes/rooms.explore/route';

export { clientLoader } from './clientLoader';
export { meta } from './meta';
export { shouldRevalidate } from './shouldRevalidate';

export default function ExploreRooms() {
  const data = useLoaderData<typeof loader>();

  return <RoomBrowser {...data} />;
}

export { loader } from './loader';
