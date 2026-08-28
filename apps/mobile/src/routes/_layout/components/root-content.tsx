import { NativePresentationProvider } from '@vibes/ui/native';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NativeKonamiBoot } from '@/components/native-konami-boot';
import {
  ActiveRoomKeepAwake,
  PersistentRoomPlayer,
} from '@/components/persistent-room-player';
import { ToastProvider } from '@/components/toast';
import {
  AppProvider,
  usePlaybackSession,
  useRoomSession,
} from '@/providers/app-provider';
import { useKonamiMode } from '@/providers/konami-mode-provider';
import { useThemePreference } from '@/providers/theme-provider';
import { AndroidFloatingNavigation } from './android-floating-navigation';
import AppTabs from './app-tabs';
import { DeviceOrientationLock } from './device-orientation-lock';
import { TabletAddSongButton } from './tablet-add-song-button';
import { TabletTopNavigation } from './tablet-top-navigation';
import { TerminalNavigation } from './terminal-navigation';

export function RootContent() {
  const [{ resolvedScheme }] = useThemePreference();
  const { booting, completeBoot, enabled } = useKonamiMode();
  return (
    <NativePresentationProvider mode={enabled ? 'terminal' : 'default'}>
      <GestureHandlerRootView className="flex-1 bg-mobile-background dark:bg-mobile-dark-background">
        <SafeAreaProvider>
          <ThemeProvider
            value={resolvedScheme === 'light' ? DefaultTheme : DarkTheme}
          >
            <ToastProvider>
              <AppProvider>
                <StatusBar
                  style={
                    enabled || resolvedScheme === 'dark' ? 'light' : 'dark'
                  }
                />
                <RoomRuntime />
                {booting && <NativeKonamiBoot onComplete={completeBoot} />}
              </AppProvider>
            </ToastProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </NativePresentationProvider>
  );
}

function RoomRuntime() {
  const { controllerRemote, room } = useRoomSession();
  const { playerEnabled, playerPreferenceLoaded } = usePlaybackSession();
  const hasActiveSession = Boolean(room || controllerRemote?.roomId);
  return (
    <>
      {hasActiveSession && playerPreferenceLoaded && playerEnabled && (
        <ActiveRoomKeepAwake />
      )}
      {room && playerPreferenceLoaded && playerEnabled && (
        <PersistentRoomPlayer />
      )}
      <DeviceOrientationLock />
      <AppTabs />
      <AndroidFloatingNavigation />
      <TabletTopNavigation />
      <TabletAddSongButton />
      <TerminalNavigation />
    </>
  );
}
