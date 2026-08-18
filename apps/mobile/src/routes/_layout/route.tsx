import {
  PixelifySans_700Bold,
  useFonts,
} from '@expo-google-fonts/pixelify-sans';
import { Route } from '@vibes/native-router';
import { safeWrapAsync } from '@vibes/shared';
import { setAudioModeAsync } from 'expo-audio';
import { useEffect } from 'react';
import '@/global.css';
import { AppRouterProvider } from '@/data-router/provider';
import { AppThemeProvider } from '@/providers/theme-provider';
import { HydrateFallback as AppHydrateFallback } from '@/routes/_index/components/route-boundaries';
import { RootContent } from './components/root-content';

export { ErrorBoundary } from './components/root-error-boundary';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Pixelify Sans Bold': PixelifySans_700Bold,
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
      <Route routeId="preferences.theme">
        <AppThemeProvider>
          <RootContent />
        </AppThemeProvider>
      </Route>
    </AppRouterProvider>
  );
}
