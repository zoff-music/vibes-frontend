import {
  Button,
  SettingsIcon,
  SiteHeader as SharedSiteHeader,
  SiteBrand,
  siteBrandLinkClassName,
  siteNavigationClassName,
  Tooltip,
} from '@vibes/ui/web';
import { lazy, Suspense, useState } from 'react';
import { Link, NavLink } from 'react-router';
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
      <SharedSiteHeader
        brand={
          <Link
            to={watch ? '/features/watch' : '/'}
            aria-label="Zoff home"
            prefetch="intent"
            className={siteBrandLinkClassName}
          >
            <SiteBrand />
          </Link>
        }
        center={<ExperienceSwitch />}
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
          </>
        }
      />
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
