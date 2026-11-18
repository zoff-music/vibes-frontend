import { DeferredContent } from '@vibes/ui/web';
import { lazy } from 'preact/compat';
import { FeatureSection } from './FeatureSection';

const LazyGeneratedPlaylistDemo = lazy(() =>
  import('../seo/GeneratedPlaylistDemo').then((module) => ({
    default: module.GeneratedPlaylistDemo,
  })),
);

interface GenerationGuideProps {
  watch?: boolean;
  reverse?: boolean;
}

export function GenerationGuide({
  watch = false,
  reverse = false,
}: GenerationGuideProps) {
  return (
    <FeatureSection
      id="ai-playlists"
      title={
        watch ? 'One small idea. A whole evening.' : 'A mood is a good start.'
      }
      description={
        watch
          ? 'Describe what you feel like watching. AI suggests a first lineup of YouTube videos, then everyone adds, votes and changes it.'
          : 'Not sure what goes first? Describe a mood or a genre. AI finds a starting queue, then you and your friends take it from there.'
      }
      link={{
        to: watch ? '/features/watch?mode=ai' : '/?mode=ai',
        label: watch ? 'Try a Watch idea' : 'Generate a playlist',
      }}
      reverse={reverse}
    >
      <DeferredContent
        fallback={<div aria-hidden="true" className="h-125 sm:h-116" />}
      >
        <LazyGeneratedPlaylistDemo watch={watch} />
      </DeferredContent>
    </FeatureSection>
  );
}
