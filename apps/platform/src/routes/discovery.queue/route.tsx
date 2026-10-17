import { ProductPageContent } from '../../components/discovery/ProductPageContent';
import { page } from '../../seo/pages/queue';
import { GeneratedPlaylistSection } from '../_index/components/GeneratedPlaylistSection';
import { VotingPreview } from '../_index/components/VotingPreview';
export const id = 'routes/discovery.queue/route';

export { meta } from './meta';

export default function Guide() {
  return (
    <ProductPageContent page={page} preview={<VotingPreview />}>
      <GeneratedPlaylistSection />
    </ProductPageContent>
  );
}
