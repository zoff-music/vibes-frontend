import { EmbedGuide } from '../../components/discovery/EmbedGuide';
import { ProductPageContent } from '../../components/discovery/ProductPageContent';
import { RoomModeGuide } from '../../components/discovery/RoomModeGuide';
import { page } from '../../seo/pages/rooms';
import { RoomControlPanel } from '../_index/components/RoomControlPanel';

export { meta } from './meta';

export default function Guide() {
  return (
    <ProductPageContent page={page} preview={<RoomControlPanel />}>
      <RoomModeGuide />
      <EmbedGuide />
    </ProductPageContent>
  );
}

export { viewTransition } from '../../utils/viewTransition';
