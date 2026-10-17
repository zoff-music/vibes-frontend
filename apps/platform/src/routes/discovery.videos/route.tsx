import { GeneratedPlaylistDemo } from '../../components/seo/GeneratedPlaylistDemo';
import { page } from '../../seo/pages/videos';
import { WatchPage } from '../discovery.$topic/components/WatchPage';
export const id = 'routes/discovery.videos/route';

export { meta } from './meta';

export default function Guide() {
  return (
    <WatchPage
      page={page}
      preview={<GeneratedPlaylistDemo watch />}
    ></WatchPage>
  );
}
