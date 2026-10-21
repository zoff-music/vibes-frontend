import { Link, NavLink } from '@kasperrt/smolter/preact';
import {
  IconButton,
  IconLinkButton,
  SettingsIcon,
  SiteHeader as SharedSiteHeader,
  SiteBrand,
  siteBrandLinkClassName,
  siteNavigationClassName,
  Tooltip,
} from '@vibes/ui/web';
import { lazy, Suspense, useRef } from 'preact/compat';
import { useDeviceSettings } from '../../hooks/useDeviceSettings';
import { useExperience } from '../../hooks/useExperience';
import { loadDeviceSettings } from '../../utils/homePanel';
import { ExperienceSwitch } from '../layout/ExperienceSwitch';

const LazyProfileSettingsModal = lazy(async () => {
  const module = await loadDeviceSettings();

  return { default: module.ProfileSettingsModal };
});

interface SiteHeaderProps {
  showExperienceSwitch: boolean;
}

export function SiteHeader({ showExperienceSwitch }: SiteHeaderProps) {
  const {
    isOpen: showSettings,
    setOpen: setShowSettings,
    settingsHref,
  } = useDeviceSettings();
  const settingsLoaded = useRef(showSettings);
  if (showSettings) settingsLoaded.current = true;
  const watch = useExperience() === 'WATCH';

  return (
    <>
      <SharedSiteHeader
        brand={
          <Link
            to={watch ? '/features/watch' : '/'}
            aria-label="Zoff home — ゾフ Shared rooms"
            prefetch="intent"
            className={siteBrandLinkClassName}
          >
            <SiteBrand />
          </Link>
        }
        {...(showExperienceSwitch && { center: <ExperienceSwitch /> })}
        navigation={
          <>
            <NavLink
              prefetch="intent"
              to={watch ? '/rooms/explore?type=watch' : '/rooms/explore'}
              className={siteNavigationClassName}
            >
              Rooms
            </NavLink>
            <Link
              to={
                watch
                  ? '/features/watch#explore-zoff'
                  : '/features/music#explore-zoff'
              }
              prefetch="intent"
              className={siteNavigationClassName}
            >
              Explore
            </Link>
            <NavLink
              prefetch="intent"
              to="/discovery/apps"
              className={siteNavigationClassName}
            >
              Apps
            </NavLink>
            <a href="/remotes/join" className={siteNavigationClassName}>
              Remote
            </a>
            <Tooltip
              align="end"
              className="inline-flex"
              content="Settings"
              side="bottom"
            >
              {settingsHref && (
                <IconLinkButton
                  aria-label="Open settings"
                  to={settingsHref}
                  replace
                  preventScrollReset
                  viewTransition={false}
                  prefetch="intent"
                  prefetchData
                  className="border-transparent!"
                  variant="ghost"
                >
                  <SettingsIcon className="h-5 w-5" />
                </IconLinkButton>
              )}
              {!settingsHref && (
                <IconButton
                  aria-label="Open settings"
                  onClick={() => setShowSettings(true)}
                  className="border-transparent!"
                  variant="ghost"
                >
                  <SettingsIcon className="h-5 w-5" />
                </IconButton>
              )}
            </Tooltip>
          </>
        }
      />
      {settingsLoaded.current && (
        <Suspense
          fallback={
            <p role="status" className="sr-only">
              Loading settings...
            </p>
          }
        >
          <LazyProfileSettingsModal
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
          />
        </Suspense>
      )}
    </>
  );
}
