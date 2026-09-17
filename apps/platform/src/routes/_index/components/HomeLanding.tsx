import type { ReactNode } from 'react';
import { SiteHeader } from '../../../components/seo/SiteHeader';
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
  isAIMode: boolean;
  settingsControl: ReactNode;
  onJoinRoom: (roomId: string) => void;
}

export function HomeLanding({
  children,
  isAIMode,
  settingsControl,
  totalRooms,
  totalSongs,
  totalListeners,
  statsAvailable,
  providers,
  publicRooms,
  onJoinRoom,
}: HomeLandingProps) {
  return (
    <>
      <SiteHeader action={settingsControl} brand="wordmark" />
      <main className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-4 sm:px-6">
        <section
          aria-labelledby="home-heading"
          className="crt-frame overflow-hidden rounded-frame"
        >
          <div className="grid items-center gap-7 p-6 sm:gap-8 sm:p-8 md:grid-cols-2 lg:gap-12 lg:p-10">
            <div className="min-w-0">
              <h1
                id="home-heading"
                className="font-pixel text-4xl text-theme normal-case leading-none tracking-tight sm:text-5xl lg:text-6xl"
              >
                Good music.
                <br />
                <span className="text-theme-muted">Better together.</span>
              </h1>
              <p className="mt-4 max-w-sm text-base text-theme-muted leading-relaxed sm:text-lg">
                Listen together in a shared music room.
              </p>
            </div>
            <div className="min-w-0 border-theme border-t pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-8 lg:pl-12">
              {children}
              <p
                className="mt-3 min-h-8 text-theme-subtle text-xs"
                aria-live="polite"
              >
                {isAIMode
                  ? 'Describe a mood. AI builds the playlist.'
                  : 'Free. No account required.'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-theme border-t px-6 py-3 sm:px-8 lg:px-10">
            <ProviderAttribution providers={providers} />
            <LegalAcknowledgement />
          </div>
        </section>
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
      </main>
    </>
  );
}
