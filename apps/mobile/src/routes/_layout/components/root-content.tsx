import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
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
import { useThemePreference } from '@/providers/theme-provider';
import { AndroidFloatingNavigation } from './android-floating-navigation';
import AppTabs from './app-tabs';
import { DeviceOrientationLock } from './device-orientation-lock';
import { TabletAddSongButton } from './tablet-add-song-button';
import { TabletTopNavigation } from './tablet-top-navigation';

export function RootContent() {
  const [{ resolvedScheme }] = useThemePreference();
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
    </>
  );
}
