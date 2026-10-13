import type { MetaFunction } from 'react-router';
import { pageMetadata } from '../../../seo/metadata';
import { page } from '../../../seo/pages/listening';
import { ChatGuide } from '../components/ChatGuide';
import { ListeningPreview } from '../components/ListeningPreview';
import { ProductPageContent } from '../components/ProductPageContent';

export const meta: MetaFunction = () =>
  pageMetadata('/discovery/listening', page.title, page.description);

export default function Guide() {
  return (
    <ProductPageContent page={page} preview={<ListeningPreview />}>
      <ChatGuide />
    </ProductPageContent>
  );
}
