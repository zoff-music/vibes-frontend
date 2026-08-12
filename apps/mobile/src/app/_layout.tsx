import {
  PixelifySans_700Bold,
  useFonts,
} from '@expo-google-fonts/pixelify-sans';
import { safeWrapAsync } from '@vibes/shared';
import { setAudioModeAsync } from 'expo-audio';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import '@/global.css';

import { AndroidFloatingNavigation } from '@/components/android-floating-navigation';
import AppTabs from '@/components/app-tabs';
import { DeviceOrientationLock } from '@/components/device-orientation-lock';
import {
  ActiveRoomKeepAwake,
  PersistentRoomPlayer,
} from '@/components/persistent-room-player';
import { TabletAddSongButton } from '@/components/tablet-add-song-button';
import { TabletTopNavigation } from '@/components/tablet-top-navigation';
import { ToastProvider } from '@/components/toast';
import { AppProvider, useApp } from '@/providers/app-provider';
import {
  AppThemeProvider,
  useThemePreference,
} from '@/providers/theme-provider';

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
          shouldPlayInBackground: true,
        }),
      );
      if (error) return;
    };
    void configureAudio();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AppThemeProvider>
      <RootContent />
    </AppThemeProvider>
  );
}

function RootContent() {
  const { resolvedScheme } = useThemePreference();
  return (
    <GestureHandlerRootView className="flex-1 bg-mobile-background dark:bg-mobile-dark-background">
      <SafeAreaProvider>
        <ThemeProvider
          value={resolvedScheme === 'light' ? DefaultTheme : DarkTheme}
        >
          <ToastProvider>
            <AppProvider>
              <StatusBar
                style={resolvedScheme === 'light' ? 'dark' : 'light'}
              />
              <RoomRuntime />
            </AppProvider>
          </ToastProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function RoomRuntime() {
  const { controllerRemote, playerEnabled, playerPreferenceLoaded, room } =
    useApp();
  const hasActiveSession = Boolean(room || controllerRemote?.roomId);
  return (
    <>
      {hasActiveSession && playerPreferenceLoaded && playerEnabled && (
        <ActiveRoomKeepAwake />
      )}
      <DeviceOrientationLock />
      <AppTabs />
      <AndroidFloatingNavigation />
      <TabletTopNavigation />
      {playerPreferenceLoaded && playerEnabled && <PersistentRoomPlayer />}
      <TabletAddSongButton />
    </>
  );
}
