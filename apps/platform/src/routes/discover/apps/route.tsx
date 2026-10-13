import type { MetaFunction } from 'react-router';
import { ProductScreenshots } from '../../../components/seo/ProductScreenshots';
import { pageMetadata } from '../../../seo/metadata';
import { page } from '../../../seo/pages/apps';
import { RemotePreview } from '../../_index/components/RemotePreview';
import { ProductPageContent } from '../components/ProductPageContent';

export const meta: MetaFunction = () =>
  pageMetadata('/discovery/apps', page.title, page.description);

export default function Guide() {
  return (
    <ProductPageContent page={page} preview={<ProductScreenshots />}>
      <RemotePreview showAppsLink={false} />
    </ProductPageContent>
  );
}
