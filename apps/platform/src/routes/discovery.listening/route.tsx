import { ChatGuide } from '../../components/discovery/ChatGuide';
import { ListeningPreview } from '../../components/discovery/ListeningPreview';
import { ProductPageContent } from '../../components/discovery/ProductPageContent';
import { page } from '../../seo/pages/listening';
export const id = 'routes/discovery.listening/route';

export { meta } from './meta';

export default function Guide() {
  return (
    <ProductPageContent page={page} preview={<ListeningPreview />}>
      <ChatGuide />
    </ProductPageContent>
  );
}
