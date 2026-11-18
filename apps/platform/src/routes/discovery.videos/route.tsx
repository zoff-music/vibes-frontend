import { GenerationGuide } from '../../components/discovery/GenerationGuide';
import { ProductPageContent } from '../../components/discovery/ProductPageContent';
import { LiveRoomDemo } from '../../components/seo/LiveRoomDemo';
import { page } from '../../seo/pages/videos';

export { meta } from './meta';

export default function Guide() {
  return (
    <ProductPageContent
      watch
      page={page}
      preview={<LiveRoomDemo watch variant="queue" />}
    >
      <GenerationGuide watch />
    </ProductPageContent>
  );
}

export { viewTransition } from '../../utils/viewTransition';
