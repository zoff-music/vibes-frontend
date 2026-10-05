import { Button, SettingsIcon, Tooltip } from '@vibes/ui/web';
import { lazy, Suspense, useState } from 'react';
import { Link, NavLink } from 'react-router';
import headerLogo from '../../assets/logo-header.webp';
import headerLogo48 from '../../assets/logo-header-48.webp?no-inline';
import headerLogo96 from '../../assets/logo-header-96.webp?no-inline';
import headerLogo128 from '../../assets/logo-header-128.webp?no-inline';
import { useExperience } from '../../hooks/useExperience';
import { ExperienceSwitch } from '../layout/ExperienceSwitch';

const LazyProfileSettingsModal = lazy(async () => {
  const module = await import('../profile/ProfileSettingsModal');
  return { default: module.ProfileSettingsModal };
});

export function SiteHeader() {
  const [showSettings, setShowSettings] = useState(false);
  const watch = useExperience() === 'WATCH';

  return (
    <>
      <header className="site-header product-content relative z-10 mx-auto grid w-full max-w-6xl grid-cols-[1fr_auto] items-center gap-4 px-5 py-5 sm:px-6 sm:py-7 lg:grid-cols-[1fr_auto_1fr]">
        <Link
          to={watch ? '/?type=watch' : '/'}
          aria-label="Zoff home"
          className="group flex shrink-0 cursor-pointer items-center gap-3 rounded-xl transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
        >
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
        </Link>
        <div className="col-span-2 row-start-2 justify-self-center lg:col-span-1 lg:col-start-2 lg:row-start-1">
          <ExperienceSwitch />
        </div>
        <nav
          aria-label="Product navigation"
          className="col-start-2 row-start-1 flex items-center gap-1 justify-self-end sm:gap-2 lg:col-start-3"
        >
          <NavLink to="/rooms/explore" className={navigationClassName}>
            Rooms
          </NavLink>
          <Link
            to={watch ? '/?type=watch#explore-zoff' : '/#explore-zoff'}
            className={navigationClassName}
          >
            Explore
          </Link>
          <NavLink to="/discovery/apps" className={navigationClassName}>
            Apps
          </NavLink>
          <Tooltip
            align="end"
            className="inline-flex"
            content="Settings"
            side="bottom"
          >
            <Button
              aria-label="Open settings"
              onClick={() => setShowSettings(true)}
              size="icon"
              variant="tertiary"
            >
              <SettingsIcon className="h-5 w-5" />
            </Button>
          </Tooltip>
        </nav>
      </header>
      {showSettings && (
        <Suspense
          fallback={
            <p role="status" className="sr-only">
              Loading settings...
            </p>
          }
        >
          <LazyProfileSettingsModal
            isOpen
            onClose={() => setShowSettings(false)}
          />
        </Suspense>
      )}
    </>
  );
}

const navigationClassName =
  'inline-flex min-h-11 cursor-pointer items-center rounded-xl px-2 text-sm text-theme-muted transition-colors hover:bg-theme-surface hover:text-theme focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary aria-[current=page]:text-cyan-800 dark:aria-[current=page]:text-secondary sm:px-4';
