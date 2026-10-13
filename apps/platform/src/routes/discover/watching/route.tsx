import type { MetaFunction } from 'react-router';
import { WatchScene } from '../../../components/seo/WatchScene';
import { pageMetadata } from '../../../seo/metadata';
import { page } from '../../../seo/pages/watching';
import { ChatPreview } from '../components/ChatPreview';
import { WatchPage } from '../components/WatchPage';

export const meta: MetaFunction = () =>
  pageMetadata('/discovery/watching', page.title, page.description);

export default function Guide() {
  return (
    <WatchPage page={page} preview={<WatchScene compact />}>
      <div className="mx-auto max-w-xl py-8">
        <ChatPreview watch />
      </div>
    </WatchPage>
  );
}
