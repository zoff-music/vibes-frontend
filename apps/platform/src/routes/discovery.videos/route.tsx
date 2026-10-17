import { WatchPage } from '../../components/discovery/WatchPage';
import { GeneratedPlaylistDemo } from '../../components/seo/GeneratedPlaylistDemo';
import { page } from '../../seo/pages/videos';

export { meta } from './meta';

export default function Guide() {
  return (
    <WatchPage
      page={page}
      preview={<GeneratedPlaylistDemo watch />}
    ></WatchPage>
  );
}
