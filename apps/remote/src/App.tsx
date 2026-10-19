import { Outlet } from '@kasperrt/smolter/preact';
import {
  Button,
  SettingsIcon,
  SiteBackground,
  SiteBrand,
  SiteFooter,
  SiteHeader,
  SiteLayout,
  siteBrandLinkClassName,
  siteNavigationClassName,
  ToastViewport,
  Tooltip,
} from '@vibes/ui/web';
import { lazy, Suspense, useState } from 'preact/compat';
import { useThemeSync } from './hooks/useThemeSync';

const LazyDeviceSettings = lazy(async () => {
  const module = await import('./components/DeviceSettings');

  return { default: module.DeviceSettings };
});

export function App() {
  useThemeSync();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="relative min-h-screen overflow-x-clip bg-theme text-theme">
      <SiteBackground variant="landing" showGrid />
      <ToastViewport />
      <SiteLayout
        header={
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
            navigation={
              <>
                <a href="/rooms/explore" className={siteNavigationClassName}>
                  Rooms
                </a>
                <a
                  href="/features/music#explore-zoff"
                  className={siteNavigationClassName}
                >
                  Explore
                </a>
                <a href="/discovery/apps" className={siteNavigationClassName}>
                  Apps
                </a>
                <a
                  href="/remotes/join"
                  aria-current="page"
                  className={siteNavigationClassName}
                >
                  Remote
                </a>
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
        }
        footer={<SiteFooter />}
      >
        <Outlet />
      </SiteLayout>
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
    </div>
  );
}
