import { NavLink, useRootData } from '@kasperrt/smolter/preact';
import {
  Button,
  SettingsIcon,
  SiteBrand,
  SiteHeader,
  siteBrandLinkClassName,
  siteNavigationClassName,
  Tooltip,
} from '@vibes/ui/web';
import { lazy, Suspense, useState } from 'preact/compat';
import type { RootLoaderData } from '../root/loader';

const LazyDeviceSettings = lazy(async () => {
  const module = await import('./DeviceSettings');

  return { default: module.DeviceSettings };
});

export function AdminHeader() {
  const { admin: data } = useRootData<RootLoaderData>();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <SiteHeader
        brand={
          <a
            href="/"
            aria-label="Zoff home — ゾフ Shared rooms"
            className={siteBrandLinkClassName}
          >
            <SiteBrand />
          </a>
        }
        navigationLabel="Admin navigation"
        navigation={
          <>
            {data?.session.authorized && (
              <>
                <NavLink
                  to="/admin"
                  end
                  prefetch="intent"
                  className={siteNavigationClassName}
                >
                  Overview
                </NavLink>
                <NavLink
                  to="/admin/rooms"
                  prefetch="intent"
                  className={siteNavigationClassName}
                >
                  Rooms
                </NavLink>
                <NavLink
                  to="/admin/users"
                  prefetch="intent"
                  className={siteNavigationClassName}
                >
                  Users
                </NavLink>
              </>
            )}
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
          <LazyDeviceSettings onClose={() => setShowSettings(false)} />
        </Suspense>
      )}
    </>
  );
}
