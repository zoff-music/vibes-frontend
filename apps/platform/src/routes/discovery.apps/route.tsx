import { ProductPageContent } from '../../components/discovery/ProductPageContent';
import { ProductScreenshots } from '../../components/seo/ProductScreenshots';
import { page } from '../../seo/pages/apps';
import { RemotePreview } from '../_index/components/RemotePreview';
export const id = 'routes/discovery.apps/route';

export { meta } from './meta';

export default function Guide() {
  return (
    <ProductPageContent page={page} preview={<ProductScreenshots />}>
      <RemotePreview showAppsLink={false} />
    </ProductPageContent>
  );
}
