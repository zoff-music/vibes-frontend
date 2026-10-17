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
          <p className="font-pixel text-cyan-800 text-xs tracking-label dark:text-secondary">
            WHO’S AT THE CONTROLS?
          </p>
          <h2
            id="room-playback-heading"
            className="mt-4 font-pixel text-4xl normal-case leading-tight tracking-tight sm:text-5xl"
          >
            Let it play.
            <br />
            Or take the lead.
          </h2>
          <p className="mt-5 text-theme-muted leading-relaxed">
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
