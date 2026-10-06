import { ArrowRightIcon, DeferredContent } from '@vibes/ui/web';
import { lazy } from 'react';
import { Link } from 'react-router';
import { ProductLinks } from '../../../components/seo/ProductLinks';
import { CommunityStats } from './CommunityStats';

const LazyWatchScene = lazy(() =>
  import('../../../components/seo/WatchScene').then((module) => ({
    default: module.WatchScene,
  })),
);
const LazyChatPreview = lazy(() =>
  import('../../discover/components/ChatPreview').then((module) => ({
    default: module.ChatPreview,
  })),
);

const LazyGeneratedPlaylistDemo = lazy(() =>
  import('../../../components/seo/GeneratedPlaylistDemo').then((module) => ({
    default: module.GeneratedPlaylistDemo,
  })),
);

export function WatchIntroduction() {
  return (
    <div className="mx-auto max-w-6xl">
      <CommunityStats />

      <section
        className="grid items-center gap-10 py-20 sm:py-28 lg:grid-cols-5 lg:gap-16"
        aria-labelledby="watch-moment-heading"
      >
        <div className="lg:col-span-2">
          <p className="font-pixel text-cyan-800 text-xs tracking-label dark:text-secondary">
            NOT JUST A LINK IN THE GROUP CHAT
          </p>
          <h2
            id="watch-moment-heading"
            className="mt-4 font-pixel text-4xl normal-case leading-tight tracking-tight sm:text-5xl"
          >
            You had to
            <br />
            be there.
            <br />
            <span className="text-primary">Now you can.</span>
          </h2>
          <p className="mt-5 max-w-xl text-lg text-theme-muted leading-relaxed">
            The same video. The same moment. A room for the people you wish were
            on the sofa beside you.
          </p>
          <Link
            prefetch="intent"
            className={guideClass}
            to="/discovery/watch-together"
          >
            Explore watching together
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
        <div className="min-w-0 lg:col-span-3">
          <DeferredContent
            fallback={<div className="h-132 rounded-3xl bg-theme-surface" />}
          >
            <LazyWatchScene />
          </DeferredContent>
        </div>
      </section>
      <section
        className="grid items-center gap-10 border-theme border-y py-20 sm:py-28 lg:grid-cols-2 lg:gap-16"
        aria-labelledby="watch-chat-heading"
      >
        <div className="lg:order-2">
          <p className="font-pixel text-cyan-800 text-xs tracking-label dark:text-secondary">
            KEEP THE COMMENTARY
          </p>
          <h2
            id="watch-chat-heading"
            className="mt-4 font-pixel text-4xl normal-case leading-tight tracking-tight sm:text-5xl"
          >
            For the “wait,
            <br />
            watch this” people.
          </h2>
          <p className="mt-5 text-lg text-theme-muted leading-relaxed">
            A shared queue for your finds. Chat for everything in between. And
            an off switch when the film deserves your full attention.
          </p>
          <Link
            prefetch="intent"
            className={guideClass}
            to="/discovery/watch-party"
          >
            Plan a watch party
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
        <div className="min-w-0 lg:order-1">
          <DeferredContent
            fallback={<div className="h-140 rounded-3xl bg-theme-surface" />}
          >
            <LazyChatPreview watch />
          </DeferredContent>
        </div>
      </section>
      <section
        className="grid items-center gap-10 py-20 sm:py-28 lg:grid-cols-5 lg:gap-16"
        aria-labelledby="watch-generation-heading"
      >
        <div className="lg:col-span-2">
          <p className="font-pixel text-cyan-800 text-xs tracking-label dark:text-secondary">
            FOLLOW YOUR CURIOSITY
          </p>
          <h2
            id="watch-generation-heading"
            className="mt-4 font-pixel text-4xl normal-case leading-tight tracking-tight sm:text-5xl"
          >
            One small idea.
            <br />
            <span className="text-primary">A whole evening.</span>
          </h2>
          <p className="mt-5 text-lg text-theme-muted leading-relaxed">
            Night walks through distant cities. A detour into space. Short films
            that stay with you. Imagine where your next queue could take you.
          </p>
          <Link
            prefetch="intent"
            className={guideClass}
            to="/features/watch?mode=ai"
          >
            Try a Watch idea
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
          <p className="mt-3 text-theme-muted text-xs">
            Illustrative demo. Start your own queue with an idea.
          </p>
        </div>
        <div className="min-w-0 lg:col-span-3">
          <DeferredContent fallback={<div className="h-144" />}>
            <LazyGeneratedPlaylistDemo watch />
          </DeferredContent>
        </div>
      </section>
      <section
        id="explore-zoff"
        className="scroll-mt-8 py-20 sm:py-28"
        aria-labelledby="watch-explore-heading"
      >
        <p className="font-pixel text-cyan-800 text-xs tracking-label dark:text-secondary">
          A DIFFERENT KIND OF TOGETHER
        </p>
        <h2
          id="watch-explore-heading"
          className="mt-3 mb-8 font-pixel text-4xl normal-case tracking-tight"
        >
          Explore Watch
        </h2>
        <ProductLinks watch />
      </section>
    </div>
  );
}

const guideClass =
  'mt-6 inline-flex min-h-12 items-center gap-3 rounded-xl border border-theme bg-theme-surface px-4 text-sm text-theme transition-colors hover:border-secondary focus-visible:ring-2 focus-visible:ring-secondary';
