import { ArrowRightIcon, Button } from '@vibes/ui/web';
import { RoomDemoSection } from '../../../components/discovery/RoomDemoSection';
import { HomeFeatures } from '../../../components/home/HomeFeatures';
import { musicFeatures } from '../../../seo/pages/home';
import { CommunityStats } from './CommunityStats';
import { HowItWorks } from './HowItWorks';

interface ProductIntroductionProps {
  onGeneratePlaylist: () => void;
}

export function ProductIntroduction({
  onGeneratePlaylist,
}: ProductIntroductionProps) {
  return (
    <div className="product-content text-theme mx-auto w-full max-w-6xl">
      <CommunityStats />
      <HowItWorks />
      {/* Below the fold everywhere; first paint does not need its styles. */}
      <div data-critical="defer">
        <RoomDemoSection />
        <HomeFeatures features={musicFeatures} />
        <section
          id="ai-playlists"
          aria-labelledby="home-generation-heading"
          className="border-theme flex flex-col items-start gap-5 border-t py-16 sm:flex-row sm:items-center sm:justify-between sm:py-20"
        >
          <div className="min-w-0">
            <h2
              id="home-generation-heading"
              className="font-pixel text-3xl tracking-tight normal-case sm:text-4xl"
            >
              Have a mood, not a playlist?
            </h2>
            <p className="text-theme-muted mt-3 max-w-xl leading-relaxed sm:text-lg">
              Describe it, and AI finds the first songs. Everyone takes it from
              there.
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
      </div>
    </div>
  );
}
