import type { MetaFunction } from 'react-router';
import { pageMetadata } from '../../../seo/metadata';
import { page } from '../../../seo/pages/queue';
import { GeneratedPlaylistSection } from '../../_index/components/GeneratedPlaylistSection';
import { VotingPreview } from '../../_index/components/VotingPreview';
import { ProductPageContent } from '../components/ProductPageContent';

export const meta: MetaFunction = () =>
  pageMetadata('/discovery/queue', page.title, page.description);

export default function Guide() {
  return (
    <ProductPageContent page={page} preview={<VotingPreview />}>
      <GeneratedPlaylistSection />
    </ProductPageContent>
  );
}
