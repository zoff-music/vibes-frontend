import { usePageVisibility } from '@vibes/shared';
import { useInView } from 'framer-motion';
import { type ReactNode, type RefObject, useRef } from 'react';
import { RetroSun } from '../../../components/layout/RetroSun';
import { SiteHero } from '../../../components/layout/SiteHero';
import { SitePage } from '../../../components/layout/SitePage';
import type { HomeLoaderData } from '../loader';
import { LegalAcknowledgement } from './LegalAcknowledgement';
import { ProductIntroduction } from './ProductIntroduction';
import { ProviderAttribution } from './ProviderAttribution';
import { PublicRoomDiscovery } from './PublicRoomDiscovery';

interface HomeLandingProps extends HomeLoaderData {
  children: ReactNode;
  heroRef: RefObject<HTMLDivElement | null>;
  onJoinRoom: (roomId: string) => void;
  onGeneratePlaylist: () => void;
}

export function HomeLanding({
  children,
  heroRef,
  data,
  onJoinRoom,
  onGeneratePlaylist,
}: HomeLandingProps) {
  const sunRef = useRef<HTMLDivElement>(null);
  const sunVisible = useInView(sunRef);
  const pageVisible = usePageVisibility();

  return (
    <SitePage>
      <div
        ref={heroRef}
        className="flex min-h-[calc(100svh-8rem)] flex-col justify-center gap-8 pt-28 pb-8 sm:gap-10 sm:pt-32 sm:pb-10 [&_.site-hero]:relative [&_h1]:text-5xl sm:[&_h1]:text-6xl lg:[&_h1]:text-7xl"
      >
        <div className="relative">
          <div
            ref={sunRef}
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/2 w-screen -translate-x-1/2 overflow-x-clip sm:-top-32"
          >
            <div className="mx-auto w-72 max-w-full sm:w-96">
              <RetroSun paused={!pageVisible || !sunVisible} />
            </div>
          </div>
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
                <ProviderAttribution providers={data.providers ?? []} />
                <LegalAcknowledgement />
              </>
            }
          />
        </div>
      </div>
      <PublicRoomDiscovery
        onJoinRoom={onJoinRoom}
        rooms={data.publicRooms ?? []}
      />
      <ProductIntroduction onGeneratePlaylist={onGeneratePlaylist} />
      <p
        lang="ja"
        className="jp-art mt-6 text-center text-theme-subtle text-xs"
      >
        音楽は共有するもの
      </p>
    </SitePage>
  );
}
