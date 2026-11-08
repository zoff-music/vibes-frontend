import { Link } from '@kasperrt/smolter/preact';
import {
  ArrowRightIcon,
  Button,
  DeferredContent,
  SparklesIcon,
} from '@vibes/ui/web';
import { lazy } from 'preact/compat';
import { ProductLinks } from '../../../components/seo/ProductLinks';
import { CommunityStats } from './CommunityStats';
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
    <div className="product-content text-theme mx-auto w-full max-w-6xl">
      <CommunityStats />
      <section
        id="how-it-works"
        aria-label="Start listening together"
        className="grid gap-5 py-8 sm:grid-cols-3 sm:gap-8 sm:py-10"
      >
        {[
          { title: 'Make a room.', body: 'A name. A link. You’re in.' },
          {
            title: 'Bring your people.',
            body: 'Share the link, not your headphones.',
          },
          {
            title: 'Find your next favourite.',
            body: 'Everyone adds. Everyone listens.',
          },
        ].map((step, index) => (
          <div key={step.title} className="flex gap-3">
            <span
              aria-hidden="true"
              className="font-pixel dark:text-secondary pt-1 text-xs text-cyan-800"
            >
              0{index + 1}
            </span>
            <div>
              <h2 className="font-pixel text-xl normal-case">{step.title}</h2>
              <p className="text-theme-muted mt-2 text-sm">{step.body}</p>
            </div>
          </div>
        ))}
      </section>
      {/* Below the fold everywhere; first paint does not need its styles. */}
      <div data-critical="defer">
        <section
          id="voting"
          aria-labelledby="voting-heading"
          className="grid scroll-mt-10 items-center gap-10 py-14 sm:py-20 lg:grid-cols-5 lg:gap-14"
        >
          <div className="min-w-0 lg:col-span-2">
            <p className="font-pixel tracking-label dark:text-primary text-xs text-pink-800">
              A SHARED MUSIC QUEUE
            </p>
            <h2
              id="voting-heading"
              className="font-pixel mt-4 text-4xl leading-tight tracking-tight normal-case sm:text-5xl"
            >
              Good taste.
              <br />
              <span className="dark:text-primary text-pink-800">
                Better together.
              </span>
            </h2>
            <p className="text-theme-muted mt-5 max-w-xl leading-relaxed sm:text-lg">
              Your picks. Their discoveries. Add songs from YouTube and
              SoundCloud, then vote for what plays next.
            </p>
            <p className="text-theme-muted mt-4 max-w-xl leading-relaxed">
              One shared queue, playing in sync. Across the sofa or across the
              world.
            </p>
            <Link
              to="/discovery/queue"
              prefetch="intent"
              className="focus-visible:ring-secondary dark:text-secondary mt-6 inline-flex min-h-11 items-center gap-3 rounded-lg text-sm text-cyan-800 underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:outline-none"
            >
              See how the queue works
              <ArrowRightIcon aria-hidden="true" className="size-4" />
            </Link>
          </div>
          <div className="min-w-0 lg:col-span-3">
            <DeferredContent
              fallback={
                <div
                  aria-hidden="true"
                  className="border-theme bg-theme h-170 rounded-3xl border"
                />
              }
            >
              <LazyVotingPreview />
            </DeferredContent>
          </div>
        </section>
        <RoomControlsPreview />
        <section
          id="ai-playlists"
          aria-labelledby="home-generation-heading"
          className="border-theme bg-theme-surface flex flex-col items-start gap-5 rounded-3xl border p-6 sm:flex-row sm:items-center sm:gap-7 sm:p-8"
        >
          <SparklesIcon
            aria-hidden="true"
            className="dark:text-primary size-8 shrink-0 text-pink-800"
          />
          <div className="min-w-0 flex-1">
            <h2
              id="home-generation-heading"
              className="font-pixel text-2xl tracking-tight normal-case"
            >
              Have a mood, not a playlist?
            </h2>
            <p className="text-theme-muted mt-2 leading-relaxed">
              Let AI find the first songs. Make the rest yours.
            </p>
          </div>
          <Button
            onClick={onGeneratePlaylist}
            variant="primary"
            className="min-h-12 shrink-0 gap-3"
          >
            Start with an idea
            <ArrowRightIcon aria-hidden="true" className="size-4" />
          </Button>
        </section>
        <section
          id="explore-zoff"
          aria-labelledby="find-your-moment-heading"
          className="scroll-mt-8 py-16 sm:py-24"
        >
          <p className="font-pixel tracking-label dark:text-primary text-xs text-pink-800">
            FIND YOUR KIND OF TOGETHER
          </p>
          <h2
            id="find-your-moment-heading"
            className="font-pixel mt-3 mb-7 text-3xl tracking-tight normal-case sm:text-4xl"
          >
            There’s room for that.
          </h2>
          <ProductLinks />
        </section>
      </div>
    </div>
  );
}
