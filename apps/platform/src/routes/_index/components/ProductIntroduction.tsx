import {
  ArrowRightIcon,
  Button,
  DeferredContent,
  SparklesIcon,
} from '@vibes/ui/web';
import { lazy } from 'react';
import { Link } from 'react-router';
import { ProductLinks } from '../../../components/seo/ProductLinks';
import { CommunityStats } from './CommunityStats';
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
              className="pt-1 font-pixel text-cyan-800 text-xs dark:text-secondary"
            >
              0{index + 1}
            </span>
            <div>
              <h2 className="font-pixel text-xl normal-case">{step.title}</h2>
              <p className="mt-2 text-sm text-theme-muted">{step.body}</p>
            </div>
          </div>
        ))}
      </section>
      <section
        id="voting"
        aria-labelledby="voting-heading"
        className="grid scroll-mt-10 items-center gap-10 py-14 sm:py-20 lg:grid-cols-5 lg:gap-14"
      >
        <div className="min-w-0 lg:col-span-2">
          <p className="font-pixel text-pink-800 text-xs tracking-label dark:text-primary">
            A SHARED MUSIC QUEUE
          </p>
          <h2
            id="voting-heading"
            className="mt-4 font-pixel text-4xl normal-case leading-tight tracking-tight sm:text-5xl"
          >
            Good taste.
            <br />
            <span className="text-pink-800 dark:text-primary">
              Better together.
            </span>
          </h2>
          <p className="mt-5 max-w-xl text-theme-muted leading-relaxed sm:text-lg">
            Your picks. Their discoveries. Add songs from YouTube and
            SoundCloud, then vote for what plays next.
          </p>
          <p className="mt-4 max-w-xl text-theme-muted leading-relaxed">
            One shared queue, playing in sync. Across the sofa or across the
            world.
          </p>
          <Link
            to="/discovery/queue"
            prefetch="intent"
            className="mt-6 inline-flex min-h-11 items-center gap-3 rounded-lg text-cyan-800 text-sm underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary dark:text-secondary"
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
                className="h-170 rounded-3xl border border-theme bg-theme"
              />
            }
          >
            <LazyVotingPreview />
          </DeferredContent>
        </div>
      </section>
      <RoomControlsPreview />
      <RemotePreview />
      <section
        id="ai-playlists"
        aria-labelledby="home-generation-heading"
        className="flex flex-col items-start gap-5 rounded-3xl border border-theme bg-theme-surface p-6 sm:flex-row sm:items-center sm:gap-7 sm:p-8"
      >
        <SparklesIcon
          aria-hidden="true"
          className="size-8 shrink-0 text-pink-800 dark:text-primary"
        />
        <div className="min-w-0 flex-1">
          <h2
            id="home-generation-heading"
            className="font-pixel text-2xl normal-case tracking-tight"
          >
            Have a mood, not a playlist?
          </h2>
          <p className="mt-2 text-theme-muted leading-relaxed">
            Let AI find the first songs. Make the rest yours.
          </p>
        </div>
        <Button
          onClick={onGeneratePlaylist}
          variant="primary"
          className="min-h-12 shrink-0 gap-3 text-sm"
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
        <p className="font-pixel text-pink-800 text-xs tracking-label dark:text-primary">
          FIND YOUR KIND OF TOGETHER
        </p>
        <h2
          id="find-your-moment-heading"
          className="mt-3 mb-7 font-pixel text-3xl normal-case tracking-tight sm:text-4xl"
        >
          There’s room for that.
        </h2>
        <ProductLinks />
      </section>
    </div>
  );
}
