import { useLoaderData } from 'react-router';
import { RoomBrowser } from './components/RoomBrowser';
import { loader } from './loader';

export { clientLoader } from './clientLoader';
export { meta } from './meta';
export { loader };

export default function ExploreRooms() {
  const data = useLoaderData<typeof loader>();
  return <RoomBrowser {...data} />;
}
