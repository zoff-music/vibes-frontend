import type { ReactNode } from 'react';
import { SiteHero } from '../../../components/layout/SiteHero';
import { SitePage } from '../../../components/layout/SitePage';
import type { HomeLoaderData } from '../loader';
import { CommunityStats } from './CommunityStats';
import { LegalAcknowledgement } from './LegalAcknowledgement';
import { ProductIntroduction } from './ProductIntroduction';
import { ProviderAttribution } from './ProviderAttribution';
import { PublicRoomDiscovery } from './PublicRoomDiscovery';

interface HomeLandingProps
  extends Pick<
    HomeLoaderData,
    | 'totalRooms'
    | 'totalSongs'
    | 'totalListeners'
    | 'statsAvailable'
    | 'providers'
    | 'publicRooms'
  > {
  children: ReactNode;
  onJoinRoom: (roomId: string) => void;
}

export function HomeLanding({
  children,
  totalRooms,
  totalSongs,
  totalListeners,
  statsAvailable,
  providers,
  publicRooms,
  onJoinRoom,
}: HomeLandingProps) {
  return (
    <SitePage>
      <SiteHero
        id="home-heading"
        layout="centered"
        title={
          <>
            Good music.
            <br />
            <span className="text-theme-muted">Better together.</span>
          </>
        }
        description="Listen together in a shared music room."
        aside={
          <>
            {children}
            <p className="mt-3 min-h-8 text-theme-muted text-xs md:text-center">
              Always free. No Zoff account, ever.
            </p>
          </>
        }
        footer={
          <>
            <ProviderAttribution providers={providers} />
            <LegalAcknowledgement />
          </>
        }
      />
      <PublicRoomDiscovery onJoinRoom={onJoinRoom} rooms={publicRooms} />
      <ProductIntroduction />
      {statsAvailable && (
        <CommunityStats
          totalRooms={totalRooms}
          totalSongs={totalSongs}
          totalListeners={totalListeners}
        />
      )}
      <p
        lang="ja"
        className="jp-art mt-6 text-center text-theme-subtle text-xs"
      >
        音楽は共有するもの
      </p>
    </SitePage>
  );
}
