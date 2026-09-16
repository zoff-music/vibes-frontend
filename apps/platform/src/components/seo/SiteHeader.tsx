import type { ReactNode } from 'react';
import { Link } from 'react-router';

interface SiteHeaderProps {
  action?: ReactNode;
}

export function SiteHeader({ action }: SiteHeaderProps) {
  return (
    <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-5 sm:px-6 sm:py-7">
      <Link
        to="/"
        aria-label="Zoff home"
        className="group flex shrink-0 cursor-pointer items-center gap-3 rounded-xl transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
      >
        <span
          aria-hidden="true"
          className="glow-text font-wide text-4xl leading-none"
        >
          ゾフ
        </span>
        <span className="hidden border-theme border-l pl-3 font-pixel text-2xs text-theme-muted tracking-label sm:block">
          SHARED
          <br />
          MUSIC ROOMS
        </span>
      </Link>
      <nav
        aria-label="Product navigation"
        className="flex items-center gap-1 sm:gap-2"
      >
        <Link
          to="/#how-it-works"
          className="hidden min-h-11 cursor-pointer items-center rounded-xl px-4 text-sm text-theme-muted transition-colors hover:bg-theme-surface hover:text-theme focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary sm:inline-flex"
        >
          How it works
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
