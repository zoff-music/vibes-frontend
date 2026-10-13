import { getRoomAnalyticsPath } from '@vibes/api';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
  usePathname,
} from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  ActiveRoomKeepAwake,
  PersistentRoomPlayer,
} from '@/components/persistent-room-player';
import { ToastProvider } from '@/components/toast';
import { palette } from '@/constants/theme';
import { mobileAnalytics } from '@/lib/analytics';
import {
  AppProvider,
  usePlaybackSession,
  useRoomSession,
} from '@/providers/app-provider';
import { RoomPlayerLayoutProvider } from '@/providers/room-player-layout-provider';
import { useThemePreference } from '@/providers/theme-provider';
import { AndroidFloatingNavigation } from './android-floating-navigation';
import AppTabs from './app-tabs';
import { DeviceOrientationLock } from './device-orientation-lock';
import { TabletAddPlaylistItemButton } from './tablet-add-button';
import { TabletTopNavigation } from './tablet-top-navigation';

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

function RoomRuntime() {
  const { controllerRemote, room } = useRoomSession();
  const { playerEnabled, playerPreferenceLoaded } = usePlaybackSession();
  const hasActiveSession = Boolean(room || controllerRemote?.roomId);
  return (
    <>
      <MobileAnalytics />
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
      <TabletAddPlaylistItemButton />
    </>
  );
}

function MobileAnalytics() {
  const pathname = usePathname();
  const { controllerRemote, roomId } = useRoomSession();
  const analyticsPath = roomId
    ? getRoomAnalyticsPath(roomId)
    : controllerRemote?.roomId
      ? getRoomAnalyticsPath(controllerRemote.roomId)
      : pathname;

  useEffect(() => {
    void mobileAnalytics.trackPageview({
      path: analyticsPath,
      surface: 'mobile',
    });
  }, [analyticsPath]);

  return null;
}
