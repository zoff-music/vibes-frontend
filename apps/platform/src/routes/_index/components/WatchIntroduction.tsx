import { RoomDemoSection } from '../../../components/discovery/RoomDemoSection';
import { HomeFeatures } from '../../../components/home/HomeFeatures';
import { watchFeatures } from '../../../seo/pages/home';
import { CommunityStats } from './CommunityStats';
import { HowItWorks } from './HowItWorks';

export function WatchIntroduction() {
  return (
    <div className="mx-auto max-w-6xl">
      <CommunityStats />
      <HowItWorks watch />
      {/* Below the fold everywhere; first paint does not need its styles. */}
      <div data-critical="defer">
        <RoomDemoSection watch />
        <HomeFeatures watch features={watchFeatures} />
      </div>
    </div>
  );
}
