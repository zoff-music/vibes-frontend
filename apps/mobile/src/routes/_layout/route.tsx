import { Route } from '@vibes/native-router';
import { safeWrapAsync } from '@vibes/shared';
import { msw98uiBoldFontFamily, msw98uiFontFamily } from '@vibes/ui/shared';
import { setAudioModeAsync } from 'expo-audio';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import '@/global.css';
import { AppRouterProvider } from '@/data-router/provider';
import { KonamiModeProvider } from '@/providers/konami-mode-provider';
import { AppThemeProvider } from '@/providers/theme-provider';
import { HydrateFallback as AppHydrateFallback } from '@/routes/_index/components/route-boundaries';
import { RootContent } from './components/root-content';

export { ErrorBoundary } from './components/root-error-boundary';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    [msw98uiFontFamily]: require('../../../../../packages/ui/src/shared/assets/fonts/MSW98UI-Regular.ttf'),
    [msw98uiBoldFontFamily]: require('../../../../../packages/ui/src/shared/assets/fonts/MSW98UI-Bold.ttf'),
  });

  useEffect(() => {
    const configureAudio = async () => {
      const [error] = await safeWrapAsync(
        setAudioModeAsync({
          interruptionMode: 'doNotMix',
          playsInSilentMode: true,
        }),
      );
      if (error) return;
    };
    void configureAudio();
  }, []);

  if (!fontsLoaded) return <AppHydrateFallback />;

  return (
    <AppRouterProvider>
      <Route routeId="preferences.konami">
        <KonamiModeProvider>
          <Route routeId="preferences.theme">
            <AppThemeProvider>
              <RootContent />
            </AppThemeProvider>
          </Route>
        </KonamiModeProvider>
      </Route>
    </AppRouterProvider>
  );
}
