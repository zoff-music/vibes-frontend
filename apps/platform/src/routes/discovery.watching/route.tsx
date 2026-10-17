import { WatchScene } from '../../components/seo/WatchScene';
import { page } from '../../seo/pages/watching';
import { ChatPreview } from '../discovery.$topic/components/ChatPreview';
import { WatchPage } from '../discovery.$topic/components/WatchPage';
export const id = 'routes/discovery.watching/route';

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
