import type { ReactNode } from 'react';
import { SiteHero } from '../../../components/layout/SiteHero';
import { SitePage } from '../../../components/layout/SitePage';
import type { HomeLoaderData } from '../loader';
import { LegalAcknowledgement } from './LegalAcknowledgement';
import { ProductIntroduction } from './ProductIntroduction';
import { ProviderAttribution } from './ProviderAttribution';
import { PublicRoomDiscovery } from './PublicRoomDiscovery';

interface HomeLandingProps
  extends Pick<HomeLoaderData, 'providers' | 'publicRooms'> {
  children: ReactNode;
  onJoinRoom: (roomId: string) => void;
}

export function HomeLanding({
  children,
  providers,
  publicRooms,
  onJoinRoom,
}: HomeLandingProps) {
  return (
    <SitePage>
      <div className="flex min-h-[calc(100svh-8rem)] flex-col justify-end gap-8 pt-28 pb-8 sm:gap-10 sm:pt-40 sm:pb-10 [&_.site-hero]:relative [&_h1]:text-5xl sm:[&_h1]:text-6xl lg:[&_h1]:text-7xl">
        <SiteHero
          id="home-heading"
          layout="centered"
          title={
            <>
              Listen to music{' '}
              <span className="block text-primary">together.</span>
            </>
          }
          description="A free room powered by YouTube and SoundCloud. No registration, for you or your friends."
          aside={
            <>
              {children}
              <p className="mt-3 text-theme-muted text-xs md:text-center">
                Always free. No account needed.
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
      </div>
      <PublicRoomDiscovery onJoinRoom={onJoinRoom} rooms={publicRooms} />
      <ProductIntroduction />
      <p
        lang="ja"
        className="jp-art mt-6 text-center text-theme-subtle text-xs"
      >
        音楽は共有するもの
      </p>
    </SitePage>
  );
}
