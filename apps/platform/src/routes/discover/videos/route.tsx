import type { MetaFunction } from 'react-router';
import { GeneratedPlaylistDemo } from '../../../components/seo/GeneratedPlaylistDemo';
import { pageMetadata } from '../../../seo/metadata';
import { page } from '../../../seo/pages/videos';
import { WatchPage } from '../components/WatchPage';

export const meta: MetaFunction = () =>
  pageMetadata('/discovery/videos', page.title, page.description);

export default function Guide() {
  return (
    <WatchPage
      page={page}
      preview={<GeneratedPlaylistDemo watch />}
    ></WatchPage>
  );
}
