import {
  ArrowRightIcon,
  Button,
  DeferredContent,
  SparklesIcon,
} from '@vibes/ui/web';
import { lazy } from 'react';

const LazyGeneratedPlaylistDemo = lazy(() =>
  import('../../../components/seo/GeneratedPlaylistDemo').then((module) => ({
    default: module.GeneratedPlaylistDemo,
  })),
);

interface GeneratedPlaylistSectionProps {
  onGenerate: () => void;
}

export function GeneratedPlaylistSection({
  onGenerate,
}: GeneratedPlaylistSectionProps) {
  return (
    <section
      id="ai-playlists"
      aria-labelledby="generated-playlist-heading"
      className="grid scroll-mt-8 items-center gap-12 py-20 sm:py-28 lg:grid-cols-5 lg:gap-16"
    >
      <div className="min-w-0 lg:col-span-2">
        <p className="flex items-center gap-3 font-pixel text-primary text-xs tracking-label">
          <SparklesIcon aria-hidden="true" className="h-6 w-6 shrink-0" />
          AI PLAYLISTS
        </p>
        <h2
          id="generated-playlist-heading"
          className="mt-4 font-pixel text-4xl normal-case leading-tight tracking-tight sm:text-5xl"
        >
          Describe it.
          <br />
          Get a playlist.
        </h2>
        <p className="mt-5 max-w-xl text-theme-muted leading-relaxed sm:text-lg">
          Give Zoff a mood, genre or idea. AI finds the songs and fills your
          room. Keep your favourites, remove a track, or add your own.
        </p>
        <Button
          onClick={onGenerate}
          variant="primary"
          className="mt-6 min-h-12 gap-3 text-sm"
        >
          Generate a playlist
          <ArrowRightIcon aria-hidden="true" className="h-4 w-4 shrink-0" />
        </Button>
      </div>
      <div className="min-w-0 lg:col-span-3 lg:py-6">
        <DeferredContent
          fallback={<div aria-hidden="true" className="h-144" />}
        >
          <LazyGeneratedPlaylistDemo />
        </DeferredContent>
      </div>
    </section>
  );
}
