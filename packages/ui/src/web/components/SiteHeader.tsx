import { classNames } from '@vibes/shared';
import type { ReactNode } from 'react';
import headerLogo from '../assets/logo-header.webp';
import headerLogo48 from '../assets/logo-header-48.webp?no-inline';
import headerLogo96 from '../assets/logo-header-96.webp?no-inline';
import headerLogo128 from '../assets/logo-header-128.webp?no-inline';

interface SiteHeaderProps {
  brand: ReactNode;
  navigation: ReactNode;
  center?: ReactNode;
  navigationLabel?: string;
}

export function SiteHeader({
  brand,
  navigation,
  center,
  navigationLabel = 'Product navigation',
}: SiteHeaderProps) {
  return (
    <header
      className={classNames(
        'site-header product-content relative z-10 mx-auto grid w-full max-w-6xl grid-cols-[auto_minmax(0,1fr)] items-center gap-2 px-5 py-5 sm:gap-4 sm:px-6 sm:py-7',
        Boolean(center) && 'lg:grid-cols-[1fr_auto_1fr]',
      )}
    >
      {brand}
      {center && (
        <div className="col-span-2 row-start-2 justify-self-center lg:col-span-1 lg:col-start-2 lg:row-start-1">
          {center}
        </div>
      )}
      <nav
        aria-label={navigationLabel}
        className={classNames(
          'col-start-2 row-start-1 flex min-w-0 flex-wrap items-center justify-end gap-1 justify-self-end sm:gap-2',
          Boolean(center) && 'lg:col-start-3',
        )}
      >
        {navigation}
      </nav>
    </header>
  );
}

export function SiteBrand() {
  return (
    <>
      <img
        src={headerLogo48}
        srcSet={`${headerLogo48} 48w, ${headerLogo96} 96w, ${headerLogo128} 128w, ${headerLogo} 256w`}
        sizes="(min-width: 640px) 64px, 48px"
        alt=""
        width={256}
        height={256}
        className="h-12 w-12 rounded-full transition-transform duration-500 motion-safe:group-hover:rotate-12 sm:h-16 sm:w-16"
      />
      <span className="hidden sm:block">
        <span
          aria-hidden="true"
          className="glow-text block font-wide text-4xl leading-none"
        >
          ゾフ
        </span>
        <span className="mt-2 block text-theme-muted text-xs">
          Shared rooms
        </span>
      </span>
    </>
  );
}

export const siteBrandLinkClassName =
  'group flex shrink-0 cursor-pointer items-center gap-3 rounded-xl transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary';

export const siteNavigationClassName =
  'inline-flex min-h-11 cursor-pointer items-center rounded-xl px-2 text-sm text-theme-muted transition-colors hover:bg-theme-surface hover:text-theme focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary aria-[current=page]:text-cyan-800 dark:aria-[current=page]:text-secondary sm:px-4';
