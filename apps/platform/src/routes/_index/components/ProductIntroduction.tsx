import { DeferredContent } from '@vibes/ui/web';
import { lazy } from 'react';
import { ProductLinks } from '../../../components/seo/ProductLinks';
import { CommunityStats } from './CommunityStats';
import { GeneratedPlaylistSection } from './GeneratedPlaylistSection';
import { RemotePreview } from './RemotePreview';
import { RoomControlsPreview } from './RoomControlsPreview';

const LazyVotingPreview = lazy(() =>
  import('./VotingPreview').then((module) => ({
    default: module.VotingPreview,
  })),
);

interface ProductIntroductionProps {
  onGeneratePlaylist: () => void;
}

export function ProductIntroduction({
  onGeneratePlaylist,
}: ProductIntroductionProps) {
  return (
    <div className="product-content mx-auto w-full max-w-6xl text-theme">
      <CommunityStats />

      <section
        id="how-it-works"
        aria-labelledby="voting-heading"
        className="grid scroll-mt-8 items-center gap-12 py-20 sm:py-32 lg:grid-cols-5 lg:gap-16"
      >
        <div id="voting" className="min-w-0 scroll-mt-12 lg:col-span-2">
          <p className="font-pixel text-primary text-xs tracking-label">
            THE SHARED QUEUE
          </p>
          <h2
            id="voting-heading"
            className="mt-4 font-pixel text-4xl normal-case leading-tight tracking-tight sm:text-5xl"
          >
            Pick what plays next.
          </h2>
          <p className="mt-5 max-w-xl text-theme-muted leading-relaxed sm:text-lg">
            Add songs from YouTube and SoundCloud. Share the room with your
            friends. Vote your favourites up the queue.
          </p>
        </div>
        <div className="min-w-0 lg:col-span-3">
          <DeferredContent
            fallback={
              <div
                aria-hidden="true"
                className="h-140 rounded-3xl border border-theme bg-theme-surface sm:h-148"
              />
            }
          >
            <LazyVotingPreview />
          </DeferredContent>
        </div>
      </section>

      <RoomControlsPreview />

      <GeneratedPlaylistSection onGenerate={onGeneratePlaylist} />

      <RemotePreview />

      <section
        id="explore-zoff"
        aria-labelledby="find-your-moment-heading"
        className="flex min-h-[65svh] scroll-mt-8 flex-col justify-center py-20 sm:py-32"
      >
        <p className="font-pixel text-2xs text-primary tracking-label">
          MORE ABOUT ZOFF
        </p>
        <div className="mt-3 mb-6 flex flex-wrap items-end justify-between gap-3">
          <h2
            id="find-your-moment-heading"
            className="font-pixel text-2xl normal-case tracking-tight sm:text-3xl"
          >
            Explore Zoff
          </h2>
        </div>
        <ProductLinks />
      </section>
    </div>
  );
}
