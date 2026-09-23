import { isBrowserDebugEnabled, safeWrapAsync } from '@vibes/shared';
import { ToastViewport } from '@vibes/ui/web';
import { MotionConfig } from 'framer-motion';
import {
  type ComponentType,
  memo,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import { Outlet, useLocation, useRouteLoaderData } from 'react-router';
import { KonamiBootLoader } from './components/konami/KonamiBootLoader';
import { KonamiModeProvider } from './components/konami/KonamiModeContext';
import { Background } from './components/layout/Background';
import { SiteLayout } from './components/layout/SiteLayout';
import { RemoteControlProvider } from './components/remote/RemoteControlProvider';
import type { RootLoaderData } from './root/loader';
import { useThemeStore } from './stores/themeStore';
import { updateNavigationHistory } from './utils/navigationHistory';

type DebugConsoleComponent = ComponentType;

function DebugConsoleLoader() {
  const debugEnabled = isBrowserDebugEnabled();
  const [DebugConsole, setDebugConsole] =
    useState<DebugConsoleComponent | null>(null);

  useEffect(() => {
    if (!debugEnabled) return;

    let isMounted = true;

    const loadDebugConsole = async () => {
      const [loadErr, module] = await safeWrapAsync(
        import('@vibes/ui/web/components/DebugConsole'),
      );
      if (!isMounted || loadErr || !module?.DebugConsole) {
        if (loadErr) {
          console.error('[DebugConsole] Failed to load', loadErr);
        }
        return;
      }
      setDebugConsole(() => module.DebugConsole);
    };

    loadDebugConsole();

    return () => {
      isMounted = false;
    };
  }, [debugEnabled]);

  if (!debugEnabled || !DebugConsole) return null;

  return <DebugConsole />;
}

export function App() {
  const rootData = useRouteLoaderData<RootLoaderData>('root') ?? null;
  return <AppContent rootData={rootData} />;
}

interface AppContentProps {
  rootData: RootLoaderData | null;
}

const AppContent = memo(function AppContent({ rootData }: AppContentProps) {
  const location = useLocation();
  const konamiEnabled = rootData?.konamiEnabled ?? false;
  const syncTheme = useThemeStore((state) => state.syncTheme);

  useLayoutEffect(() => {
    syncTheme();
  }, [syncTheme]);

  useEffect(() => {
    updateNavigationHistory(location.pathname);
  }, [location.pathname]);

  return (
    <MotionConfig reducedMotion="user">
      <KonamiModeProvider enabled={konamiEnabled}>
        <DebugConsoleLoader />
        <ToastViewport />
        {!konamiEnabled && <Background />}
        <KonamiBootLoader enabled={konamiEnabled} />
        <RemoteControlProvider initialRemote={rootData?.remoteStatus}>
          <SiteLayout>
            <Outlet />
          </SiteLayout>
        </RemoteControlProvider>
      </KonamiModeProvider>
    </MotionConfig>
  );
});
