import { page } from '../../seo/pages/cinema';
import { ChatPreview } from '../discovery.$topic/components/ChatPreview';
import { WatchPage } from '../discovery.$topic/components/WatchPage';
export const id = 'routes/discovery.cinema/route';

export { meta } from './meta';

export default function Guide() {
  return <WatchPage page={page} preview={<ChatPreview watch />}></WatchPage>;
}
