import type { MetaFunction } from 'react-router';
import { pageMetadata } from '../../../seo/metadata';
import { page } from '../../../seo/pages/cinema';
import { ChatPreview } from '../components/ChatPreview';
import { WatchPage } from '../components/WatchPage';

export const meta: MetaFunction = () =>
  pageMetadata('/discovery/cinema', page.title, page.description);

export default function Guide() {
  return <WatchPage page={page} preview={<ChatPreview watch />}></WatchPage>;
}
