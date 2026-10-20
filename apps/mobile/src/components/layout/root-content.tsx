import { NativePressFeedbackContext } from '@vibes/ui/native';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ToastProvider } from '@/components/toast';
import { palette } from '@/constants/theme';
import { triggerSelectionFeedback } from '@/lib/interaction-feedback';
import { AppProvider } from '@/providers/app-provider';
import { RoomPlayerLayoutProvider } from '@/providers/room-player-layout-provider';
import { useThemePreference } from '@/providers/theme-provider';
import { RoomRuntime } from './room-runtime';

export function RootContent() {
  const [{ resolvedScheme }] = useThemePreference();

  useEffect(() => {
    const background = palette[resolvedScheme].background;
    void SystemUI.setBackgroundColorAsync(background);
  }, [resolvedScheme]);

  return (
    <GestureHandlerRootView className="flex-1 bg-mobile-background dark:bg-mobile-dark-background">
      <ThemeProvider
        value={resolvedScheme === 'light' ? DefaultTheme : DarkTheme}
      >
        <NativePressFeedbackContext value={triggerSelectionFeedback}>
          <ToastProvider>
            <AppProvider>
              <StatusBar style={resolvedScheme === 'dark' ? 'light' : 'dark'} />
              <RoomPlayerLayoutProvider>
                <RoomRuntime />
              </RoomPlayerLayoutProvider>
            </AppProvider>
          </ToastProvider>
        </NativePressFeedbackContext>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
