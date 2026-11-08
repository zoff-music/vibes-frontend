import { EmbedGuide } from '../../components/discovery/EmbedGuide';
import { ProductPageContent } from '../../components/discovery/ProductPageContent';
import { RoomModePreview } from '../../components/discovery/RoomModePreview';
import { page } from '../../seo/pages/rooms';
import { RoomControlPanel } from '../_index/components/RoomControlPanel';

export { meta } from './meta';

export default function Guide() {
  return (
    <ProductPageContent page={page} preview={<RoomControlPanel />}>
      <section
        aria-labelledby="room-playback-heading"
        className="grid items-center gap-10 py-16 sm:py-24 lg:grid-cols-5 lg:gap-14"
      >
        <div className="lg:col-span-2">
          <p className="font-pixel tracking-label dark:text-secondary text-xs text-cyan-800">
            WHO’S AT THE CONTROLS?
          </p>
          <h2
            id="room-playback-heading"
            className="font-pixel mt-4 text-4xl leading-tight tracking-tight normal-case sm:text-5xl"
          >
            Let it play.
            <br />
            Or take the lead.
          </h2>
          <p className="text-theme-muted mt-5 leading-relaxed">
            Server Mode keeps the queue moving as people come and go. Host Mode
            follows one person’s player.
          </p>
        </div>
        <div className="min-w-0 lg:col-span-3">
          <RoomModePreview />
        </div>
      </section>
      <EmbedGuide />
    </ProductPageContent>
  );
}

export { viewTransition } from '../../utils/viewTransition';
