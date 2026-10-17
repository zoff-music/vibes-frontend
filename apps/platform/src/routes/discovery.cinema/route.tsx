import { ChatPreview } from '../../components/discovery/ChatPreview';
import { WatchPage } from '../../components/discovery/WatchPage';
import { page } from '../../seo/pages/cinema';
export const id = 'routes/discovery.cinema/route';

export { meta } from './meta';

export default function Guide() {
  return <WatchPage page={page} preview={<ChatPreview watch />}></WatchPage>;
}
