import { ListeningPreview } from '../../components/discovery/ListeningPreview';
import { ProductPageContent } from '../../components/discovery/ProductPageContent';
import { page } from '../../seo/pages/watching';

export { meta } from './meta';

export default function Guide() {
  return (
    <ProductPageContent
      watch
      page={page}
      preview={<ListeningPreview watch />}
    />
  );
}

export { viewTransition } from '../../utils/viewTransition';
