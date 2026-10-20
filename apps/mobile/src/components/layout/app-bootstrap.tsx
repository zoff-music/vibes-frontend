import { msw98uiBoldFontFamily, msw98uiFontFamily } from '@vibes/ui/shared';
import { useFonts } from 'expo-font';
import { LoadingScreen } from '@/components/loading-screen';
import { useAudioMode } from '@/hooks/use-audio-mode';
import { ChatPreferenceProvider } from '@/providers/chat-preference-provider';
import { InitialDataProvider } from '@/providers/initial-data-provider';
import { AppThemeProvider } from '@/providers/theme-provider';
import { RootContent } from './root-content';

export function AppBootstrap() {
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
