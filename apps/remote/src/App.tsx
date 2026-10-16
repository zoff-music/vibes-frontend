import { useThemeStore } from '@vibes/shared/themeStore';
import {
  Button,
  SiteBackground,
  SiteBrand,
  SiteFooter,
  SiteHeader,
  SiteLayout,
  siteBrandLinkClassName,
  siteNavigationClassName,
  ToastViewport,
} from '@vibes/ui/web';
import { Outlet } from 'react-router';
import { useThemeSync } from './theme';

export function App() {
  useThemeSync();
  const toggleDarkMode = useThemeStore((state) => state.toggleDarkMode);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-theme text-theme">
      <SiteBackground variant="landing" showGrid />
      <ToastViewport />
      <SiteLayout
        header={
          <SiteHeader
            brand={
              <a
                href="/"
                aria-label="Zoff home"
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
                <Button
                  variant="tertiary"
                  onClick={toggleDarkMode}
                  aria-label="Switch light or dark theme"
                >
                  Theme
                </Button>
              </>
            }
          />
        }
        footer={<SiteFooter />}
      >
        <Outlet />
      </SiteLayout>
    </div>
  );
}
