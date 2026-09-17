import { classNames } from '@vibes/shared';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

interface SiteHeaderProps {
  action?: ReactNode;
  brand?: 'logo' | 'wordmark';
}

export function SiteHeader({ action, brand = 'logo' }: SiteHeaderProps) {
  return (
    <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-5 sm:px-6 sm:py-7">
      <Link
        to="/"
        aria-label="Zoff home"
        className="group flex shrink-0 cursor-pointer items-center gap-3 rounded-xl transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
      >
        {brand === 'wordmark' && (
          <span
            aria-hidden="true"
            className="glow-text font-wide text-4xl leading-none"
          >
            ゾフ
          </span>
        )}
        {brand === 'logo' && (
          <>
            <img
              src="/logo.png"
              alt=""
              width={1024}
              height={1024}
              className="h-12 w-12 rounded-full transition-transform duration-500 motion-safe:group-hover:rotate-12 sm:h-16 sm:w-16"
            />
            <span className="hidden sm:block">
              <span className="block font-pixel text-2xl text-theme leading-none">
                Zoff
              </span>
              <span className="mt-1.5 block text-theme-muted text-xs">
                Shared music rooms
              </span>
            </span>
          </>
        )}
        {brand === 'wordmark' && (
          <span className="hidden border-theme border-l pl-3 font-pixel text-2xs text-theme-muted tracking-label sm:block">
            SHARED
            <br />
            MUSIC ROOMS
          </span>
        )}
      </Link>
      <nav
        aria-label="Product navigation"
        className="flex items-center gap-1 sm:gap-2"
      >
        <Link
          to="/#explore-zoff"
          className={classNames(
            'min-h-11 cursor-pointer items-center rounded-xl px-3 text-sm text-theme-muted transition-colors hover:bg-theme-surface hover:text-theme focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary sm:px-4',
            brand === 'wordmark' ? 'hidden sm:inline-flex' : 'inline-flex',
          )}
        >
          Explore Zoff
        </Link>
        <Link
          to="/discover/apps"
          className="inline-flex min-h-11 cursor-pointer items-center rounded-xl px-3 text-sm text-theme-muted transition-colors hover:bg-theme-surface hover:text-theme focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary sm:px-4"
        >
          Get the apps
        </Link>
        {action}
      </nav>
    </header>
  );
}
