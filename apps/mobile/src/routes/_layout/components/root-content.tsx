import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastProvider } from '@/components/toast';
import { palette } from '@/constants/theme';
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
      <SafeAreaProvider>
        <ThemeProvider
          value={resolvedScheme === 'light' ? DefaultTheme : DarkTheme}
        >
          <ToastProvider>
            <AppProvider>
              <StatusBar style={resolvedScheme === 'dark' ? 'light' : 'dark'} />
              <RoomPlayerLayoutProvider>
                <RoomRuntime />
              </RoomPlayerLayoutProvider>
            </AppProvider>
          </ToastProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
