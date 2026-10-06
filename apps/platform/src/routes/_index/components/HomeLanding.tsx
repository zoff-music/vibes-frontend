import { usePageVisibility } from '@vibes/shared';
import { ContentTransition } from '@vibes/ui/web';
import { useInView } from 'framer-motion';
import { type ReactNode, type RefObject, useRef } from 'react';
import { RetroSun } from '../../../components/layout/RetroSun';
import { SiteHero } from '../../../components/layout/SiteHero';
import { SitePage } from '../../../components/layout/SitePage';
import { useExperience } from '../../../hooks/useExperience';
import type { HomeLoaderData } from '../loader';
import { LegalAcknowledgement } from './LegalAcknowledgement';
import { ProductIntroduction } from './ProductIntroduction';
import { ProviderAttribution } from './ProviderAttribution';
import { PublicRoomDiscovery } from './PublicRoomDiscovery';
import { WatchIntroduction } from './WatchIntroduction';

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
  const watch = useExperience() === 'WATCH';

  return (
    <SitePage>
      <div
        ref={heroRef}
        className="flex min-h-[calc(100svh-8rem)] flex-col justify-center gap-8 pt-24 pb-8 sm:gap-10 sm:pt-32 sm:pb-10 [&_.site-hero]:relative [&_h1]:text-4xl sm:[&_h1]:text-6xl lg:[&_h1]:text-7xl"
      >
        <div className="relative">
          <div
            ref={sunRef}
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/2 w-screen -translate-x-1/2 overflow-x-clip sm:-top-32"
          >
            <div className="mx-auto w-72 max-w-full sm:w-96">
              <RetroSun watch={watch} paused={!pageVisible || !sunVisible} />
            </div>
          </div>
          <ContentTransition transitionKey={watch ? 'watch' : 'music'}>
            <SiteHero
              id="home-heading"
              layout="centered"
              title={
                <>
                  {watch ? 'Watch' : 'Listen to music'}{' '}
                  <span className="block text-primary">together.</span>
                </>
              }
              description={
                watch
                  ? 'A new kind of watch party. Bring your favourite videos and your favourite people.'
                  : 'A free shared music queue for YouTube and SoundCloud. Add songs, vote and listen together.'
              }
              eyebrow={
                watch
                  ? 'GOOD VIDEOS. BETTER COMPANY.'
                  : 'GOOD MUSIC. BETTER COMPANY.'
              }
              aside={
                <div className="min-h-60 md:min-h-48">
                  {children}
                  <p className="mt-3 text-theme-muted text-xs md:text-center">
                    Always free. No account needed.
                  </p>
                </div>
              }
              footer={
                <>
                  <ProviderAttribution
                    providers={watch ? ['youtube'] : (data.providers ?? [])}
                  />
                  <LegalAcknowledgement />
                </>
              }
            />
          </ContentTransition>
        </div>
      </div>
      <PublicRoomDiscovery
        onJoinRoom={onJoinRoom}
        rooms={data.publicRooms ?? []}
      />
      {!watch && (
        <ProductIntroduction onGeneratePlaylist={onGeneratePlaylist} />
      )}
      {watch && <WatchIntroduction />}
      <p lang="ja" className="jp-art mt-6 text-center text-theme-muted text-xs">
        {watch ? '同じ瞬間を、一緒に。' : '音楽は共有するもの'}
      </p>
    </SitePage>
  );
}
