import { Outlet, useRootData } from '@kasperrt/smolter/preact';
import {
  LinkButton,
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
import { lazy, Suspense, useRef } from 'preact/compat';
import { useDeviceSettings } from './hooks/useDeviceSettings';
import { useThemeSync } from './hooks/useThemeSync';
import type { loader } from './root/loader';

const LazyDeviceSettings = lazy(async () => {
  const module = await import('./components/DeviceSettings');

  return { default: module.DeviceSettings };
});

export function App() {
  useThemeSync();
  const { isOpen, settingsHref, close } = useDeviceSettings();
  const rootData = useRootData<typeof loader>();
  const settingsLoaded = useRef(isOpen);
  if (isOpen) settingsLoaded.current = true;

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
                  <LinkButton
                    aria-label="Open settings"
                    to={settingsHref}
                    replace
                    preventScrollReset
                    viewTransition={false}
                    prefetch="intent"
                    prefetchData
                    size="icon"
                    variant="tertiary"
                  >
                    <SettingsIcon className="h-5 w-5" />
                  </LinkButton>
                </Tooltip>
              </>
            }
          />
        }
        footer={<SiteFooter />}
      >
        <Outlet />
      </SiteLayout>
      {settingsLoaded.current && (
        <Suspense
          fallback={
            <p role="status" className="sr-only">
              Loading settings...
            </p>
          }
        >
          <LazyDeviceSettings
            isOpen={isOpen}
            onClose={close}
            initialProfile={rootData?.profile ?? null}
          />
        </Suspense>
      )}
    </div>
  );
}
