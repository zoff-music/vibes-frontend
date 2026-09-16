import { ArrowRightIcon } from '@vibes/ui/web';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { SiteHeader } from '../../../components/seo/SiteHeader';
import type { HomeLoaderData } from '../loader';
import { CommunityStats } from './CommunityStats';
import { ProductIntroduction } from './ProductIntroduction';

interface HomeLandingProps
  extends Pick<
    HomeLoaderData,
    'totalRooms' | 'totalSongs' | 'totalListeners' | 'statsAvailable'
  > {
  children: ReactNode;
  settingsControl: ReactNode;
}

export function HomeLanding({
  children,
  settingsControl,
  totalRooms,
  totalSongs,
  totalListeners,
  statsAvailable,
}: HomeLandingProps) {
  return (
    <>
      <SiteHeader action={settingsControl} />
      <main className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-4 sm:px-6">
        <section className="crt-frame overflow-hidden rounded-frame">
          <div className="grid gap-8 p-6 sm:p-9 lg:grid-cols-12 lg:gap-12 lg:p-12">
            <div className="flex min-w-0 flex-col justify-center lg:col-span-7">
              <p className="font-pixel text-2xs text-primary tracking-label">
                YOUR PEOPLE. YOUR SOUNDTRACK.
              </p>
              <h1 className="mt-5 font-pixel text-4xl text-theme normal-case leading-none tracking-tight sm:text-5xl lg:text-6xl">
                Good music.
                <br />
                <span className="text-theme-muted">Better together.</span>
              </h1>
              <p className="mt-5 max-w-md text-lg text-theme-muted leading-relaxed">
                A shared music room for every kind of together. Add your songs,
                vote for the next track, and stay in sync.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-theme-muted">
                <span className="inline-flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full bg-secondary"
                  />
                  Free. No account required.
                </span>
                <span lang="ja" className="jp-art text-theme-subtle">
                  音楽は共有するもの
                </span>
              </div>
              {statsAvailable && (
                <CommunityStats
                  totalRooms={totalRooms}
                  totalSongs={totalSongs}
                  totalListeners={totalListeners}
                />
              )}
              <Link
                to="/discover/listen-together"
                className="mt-4 flex min-h-11 w-fit cursor-pointer items-center gap-4 rounded-lg pr-3 text-sm text-theme-muted transition-colors hover:text-theme focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
              >
                Meet your next listening room{' '}
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
            <div className="panel-surface min-w-0 rounded-3xl p-5 sm:p-6 lg:col-span-5">
              <div className="mb-5 flex items-center justify-between gap-4 border-theme border-b pb-4">
                <h2 className="font-pixel text-theme text-xl normal-case tracking-tight">
                  Find your signal.
                </h2>
                <span
                  aria-hidden="true"
                  className="font-pixel text-2xs text-secondary tracking-label"
                >
                  PLAY / 01
                </span>
              </div>
              {children}
            </div>
          </div>
        </section>
        <ProductIntroduction />
      </main>
    </>
  );
}
