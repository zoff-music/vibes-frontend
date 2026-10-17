import { msw98uiBoldFontFamily, msw98uiFontFamily } from '@vibes/ui/shared';
import { useFonts } from 'expo-font';
import '@/global.css';
import { LoadingScreen } from '@/components/loading-screen';
import { ChatPreferenceProvider } from '@/providers/chat-preference-provider';
import { InitialDataProvider } from '@/providers/initial-data-provider';
import { AppThemeProvider } from '@/providers/theme-provider';
import { RootContent } from '../components/layout/root-content';
import { useAudioMode } from '../hooks/use-audio-mode';

export { ErrorBoundary } from '../components/layout/root-error-boundary';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    [msw98uiFontFamily]: require('@vibes/ui/shared/fonts/MSW98UI-Regular.ttf'),
    [msw98uiBoldFontFamily]: require('@vibes/ui/shared/fonts/MSW98UI-Bold.ttf'),
  });

  useAudioMode();

  if (!fontsLoaded) return <LoadingScreen />;

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
