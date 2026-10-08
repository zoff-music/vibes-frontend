import { classNames, usePageVisibility } from '@vibes/shared';
import { useInView } from 'framer-motion';
import { type ReactNode, type RefObject, useRef } from 'react';
import { useLocation } from 'react-router';
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
  const location = useLocation();
  const navigationState: unknown = location.state;
  const animateExperience =
    typeof navigationState === 'object' &&
    navigationState !== null &&
    'experienceTransition' in navigationState &&
    navigationState.experienceTransition === true;

  return (
    <SitePage>
      <div
        ref={heroRef}
        data-experience={watch ? 'watch' : 'music'}
        className={classNames(
          'flex flex-col gap-8 pt-24 pb-8 sm:gap-10 sm:pt-32 sm:pb-10 [&_.site-hero]:relative [&_h1]:text-4xl sm:[&_h1]:text-6xl lg:[&_h1]:text-7xl',
          watch && 'min-h-[calc(100svh-8rem)]',
        )}
      >
        <div className="relative">
          <div
            ref={sunRef}
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/2 w-screen -translate-x-1/2 overflow-x-clip sm:-top-32"
          >
            <div className="experience-orbit isolate mx-auto w-72 max-w-full sm:w-96">
              <RetroSun
                key={watch ? 'watch' : 'music'}
                watch={watch}
                animate={animateExperience}
                paused={!pageVisible || !sunVisible}
              />
            </div>
          </div>
          <div className="experience-hero relative z-10 [&_.site-hero>div]:transform-gpu [&_.site-hero]:bg-theme [&_.site-hero]:backdrop-filter-none">
            <SiteHero
              id="home-heading"
              layout="centered"
              title={
                <>
                  {watch ? 'Watch' : 'Listen to music'}{' '}
                  <span
                    className={classNames(
                      'block',
                      watch
                        ? 'text-primary'
                        : 'text-pink-800 dark:text-primary',
                    )}
                  >
                    together.
                  </span>
                </>
              }
              description={
                watch
                  ? 'A new kind of watch party. Bring your favourite videos and your favourite people.'
                  : 'A free shared music queue. Bring your friends, add your favourites, and find something new together.'
              }
              eyebrow={
                watch
                  ? 'GOOD VIDEOS. BETTER COMPANY.'
                  : 'GOOD MUSIC. BETTER COMPANY.'
              }
              aside={
                <div
                  className={classNames(
                    watch ? 'min-h-60 md:min-h-48' : 'min-h-36 md:min-h-28',
                  )}
                >
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
          </div>
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
