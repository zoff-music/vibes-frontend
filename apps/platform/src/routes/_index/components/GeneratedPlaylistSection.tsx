import {
  ArrowRightIcon,
  Button,
  DeferredContent,
  SparklesIcon,
} from '@vibes/ui/web';
import { lazy } from 'react';
import { Link } from 'react-router';

const LazyGeneratedPlaylistDemo = lazy(() =>
  import('../../../components/seo/GeneratedPlaylistDemo').then((module) => ({
    default: module.GeneratedPlaylistDemo,
  })),
);

interface GeneratedPlaylistSectionProps {
  onGenerate?: () => void;
}

export function GeneratedPlaylistSection({
  onGenerate,
}: GeneratedPlaylistSectionProps = {}) {
  return (
    <section
      id="ai-playlists"
      aria-labelledby="generated-playlist-heading"
      className="grid scroll-mt-8 items-center gap-10 py-16 sm:py-24 lg:grid-cols-5 lg:gap-14"
    >
      <div className="min-w-0 lg:col-span-2">
        <p className="flex items-center gap-3 font-pixel text-pink-800 text-xs tracking-label dark:text-primary">
          <SparklesIcon aria-hidden="true" className="h-6 w-6 shrink-0" />
          AI PLAYLISTS
        </p>
        <h2
          id="generated-playlist-heading"
          className="mt-4 font-pixel text-4xl normal-case leading-tight tracking-tight sm:text-5xl"
        >
          A mood is
          <br />a good start.
        </h2>
        <p className="mt-5 max-w-xl text-theme-muted leading-relaxed sm:text-lg">
          Not sure what goes first? Describe a mood or a genre. AI finds a
          starting queue. You and your friends take it from there.
        </p>
        {onGenerate && (
          <Button
            onClick={onGenerate}
            variant="primary"
            className="mt-6 min-h-12 gap-3 text-sm"
          >
            Generate a playlist
            <ArrowRightIcon aria-hidden="true" className="h-4 w-4 shrink-0" />
          </Button>
        )}
        {!onGenerate && (
          <Link
            to="/?mode=ai"
            prefetch="intent"
            className="mt-6 inline-flex min-h-12 items-center gap-3 rounded-xl bg-primary px-5 py-3 text-sm text-text-inverse hover:bg-primary-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          >
            Generate a playlist
            <ArrowRightIcon aria-hidden="true" className="size-4" />
          </Link>
        )}
      </div>
      <div className="min-w-0 lg:col-span-3 lg:py-6">
        <DeferredContent
          fallback={
            <div
              aria-hidden="true"
              className="h-166 rounded-3xl border border-theme bg-theme"
            />
          }
        >
          <LazyGeneratedPlaylistDemo />
        </DeferredContent>
      </div>
    </section>
  );
}
