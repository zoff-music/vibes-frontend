import { GenerationGuide } from '../../components/discovery/GenerationGuide';
import { ProductPageContent } from '../../components/discovery/ProductPageContent';
import { PlaylistImportDemo } from '../../components/seo/PlaylistImportDemo';
import { page } from '../../seo/pages/queue';

export { meta } from './meta';

export default function Guide() {
  return (
    <ProductPageContent page={page} preview={<PlaylistImportDemo />}>
      <GenerationGuide />
    </ProductPageContent>
  );
}

export { viewTransition } from '../../utils/viewTransition';
