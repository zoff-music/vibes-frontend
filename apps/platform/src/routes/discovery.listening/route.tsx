import { page } from '../../seo/pages/listening';
import { ChatGuide } from '../discovery.$topic/components/ChatGuide';
import { ListeningPreview } from '../discovery.$topic/components/ListeningPreview';
import { ProductPageContent } from '../discovery.$topic/components/ProductPageContent';
export const id = 'routes/discovery.listening/route';

export { meta } from './meta';

export default function Guide() {
  return (
    <ProductPageContent page={page} preview={<ListeningPreview />}>
      <ChatGuide />
    </ProductPageContent>
  );
}
