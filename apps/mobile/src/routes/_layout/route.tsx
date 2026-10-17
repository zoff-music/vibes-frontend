import { msw98uiBoldFontFamily, msw98uiFontFamily } from '@vibes/ui/shared';
import { useFonts } from 'expo-font';
import '@/global.css';
import { HydrateFallback as AppHydrateFallback } from '@/components/route-fallback';
import { ChatPreferenceProvider } from '@/providers/chat-preference-provider';
import { InitialDataProvider } from '@/providers/initial-data-provider';
import { AppThemeProvider } from '@/providers/theme-provider';
import { RootContent } from './components/root-content';
import { useAudioMode } from './hooks/use-audio-mode';

export { ErrorBoundary } from './components/root-error-boundary';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    [msw98uiFontFamily]: require('@vibes/ui/shared/fonts/MSW98UI-Regular.ttf'),
    [msw98uiBoldFontFamily]: require('@vibes/ui/shared/fonts/MSW98UI-Bold.ttf'),
  });

  useAudioMode();

  if (!fontsLoaded) return <AppHydrateFallback />;

  return (
    <InitialDataProvider>
      <AppThemeProvider>
        <ChatPreferenceProvider>
          <RootContent />
        </ChatPreferenceProvider>
      </AppThemeProvider>
    </InitialDataProvider>
  );
}
