import { ChatPreview } from '../../components/discovery/ChatPreview';
import { WatchPage } from '../../components/discovery/WatchPage';
import { WatchScene } from '../../components/seo/WatchScene';
import { page } from '../../seo/pages/watching';

export { meta } from './meta';

export default function Guide() {
  return (
    <WatchPage page={page} preview={<WatchScene compact />}>
      <div className="mx-auto max-w-xl py-8">
        <ChatPreview watch />
      </div>
    </WatchPage>
  );
}
