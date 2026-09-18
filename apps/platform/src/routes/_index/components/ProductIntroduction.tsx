import { ArrowRightIcon, DeferredContent } from '@vibes/ui/web';
import { lazy } from 'react';
import { Link } from 'react-router';
import { ProductLinks } from '../../../components/seo/ProductLinks';
import { CommunityStats } from './CommunityStats';
import { EmbedPreview } from './EmbedPreview';
import { RemotePreview } from './RemotePreview';
import { RoomControlsPreview } from './RoomControlsPreview';

const LazyVotingPreview = lazy(() =>
  import('./VotingPreview').then((module) => ({
    default: module.VotingPreview,
  })),
);

const LazyProductScreenshots = lazy(() =>
  import('../../../components/seo/ProductScreenshots').then((module) => ({
    default: module.ProductScreenshots,
  })),
);

export function ProductIntroduction() {
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

      <section
        aria-labelledby="devices-heading"
        className="my-16 grid min-h-[85svh] items-center gap-12 py-16 sm:my-24 sm:py-24 lg:grid-cols-2 lg:gap-20"
      >
        <div>
          <p className="font-pixel text-2xs text-secondary tracking-label">
            ON YOUR DEVICES
          </p>
          <h2
            id="devices-heading"
            className="mt-4 font-pixel text-4xl normal-case leading-tight tracking-tight sm:text-5xl"
          >
            Add songs from
            <br />
            your phone.
          </h2>
          <p className="mt-4 text-theme-muted leading-relaxed">
            Use Zoff in your browser or the iOS and Android apps. Play on
            Android TV or send the room to a compatible Chromecast from a
            supported browser or app.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full border border-theme px-3 py-1.5 text-theme-muted text-xs">
              Web
            </span>
            <span className="rounded-full border border-theme px-3 py-1.5 text-theme-muted text-xs">
              iOS
            </span>
            <span className="rounded-full border border-theme px-3 py-1.5 text-theme-muted text-xs">
              Android
            </span>
            <span className="rounded-full border border-theme px-3 py-1.5 text-theme-muted text-xs">
              Android TV
            </span>
          </div>
          <Link className={storyLinkClassName} to="/discovery/apps">
            Get the apps <ArrowRightIcon className="h-4 w-4 shrink-0" />
          </Link>
        </div>
        <div className="min-w-0">
          <DeferredContent
            fallback={
              <div
                aria-hidden="true"
                className="aspect-square rounded-3xl border border-theme bg-theme-surface"
              />
            }
          >
            <LazyProductScreenshots />
          </DeferredContent>
        </div>
      </section>

      <RemotePreview />

      <EmbedPreview />

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

const storyLinkClassName =
  'mt-4 inline-flex min-h-11 items-center gap-3 rounded-xl border border-theme bg-theme-surface px-5 py-3 font-pixel text-sm text-theme transition-colors hover:border-secondary/60 hover:bg-theme focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary';
