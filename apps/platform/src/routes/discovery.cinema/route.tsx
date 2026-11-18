import { ChatPreview } from '../../components/discovery/ChatPreview';
import { PartyScreenGuide } from '../../components/discovery/PartyScreenGuide';
import { ProductPageContent } from '../../components/discovery/ProductPageContent';
import { page } from '../../seo/pages/cinema';

export { meta } from './meta';

export default function Guide() {
  return (
    <ProductPageContent watch page={page} preview={<ChatPreview watch />}>
      <PartyScreenGuide />
    </ProductPageContent>
  );
}

export { viewTransition } from '../../utils/viewTransition';
