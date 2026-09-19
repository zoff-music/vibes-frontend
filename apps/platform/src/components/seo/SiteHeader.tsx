import { Button, SettingsIcon, Tooltip } from '@vibes/ui/web';
import { useState } from 'react';
import { Link, NavLink } from 'react-router';
import { ProfileSettingsModal } from '../profile/ProfileSettingsModal';

export function SiteHeader() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <header className="site-header product-content relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-5 py-5 sm:gap-4 sm:px-6 sm:py-7">
        <Link
          to="/"
          aria-label="Zoff home"
          className="group flex shrink-0 cursor-pointer items-center gap-3 rounded-xl transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
        >
          <img
            src="/logo.png"
            alt=""
            width={1024}
            height={1024}
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
        <nav
          aria-label="Product navigation"
          className="flex items-center gap-1 sm:gap-2"
        >
          <NavLink to="/explore/rooms" className={navigationClassName}>
            Rooms
          </NavLink>
          <Link to="/#explore-zoff" className={navigationClassName}>
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
      <ProfileSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  );
}

const navigationClassName =
  'inline-flex min-h-11 cursor-pointer items-center rounded-xl px-2 text-sm text-theme-muted transition-colors hover:bg-theme-surface hover:text-theme focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary aria-[current=page]:text-cyan-800 dark:aria-[current=page]:text-secondary sm:px-4';
