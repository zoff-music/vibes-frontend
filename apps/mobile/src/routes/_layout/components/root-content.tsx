import { NativePresentationProvider } from '@vibes/ui/native';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { vars } from 'nativewind';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NativeKonamiBoot } from '@/components/native-konami-boot';
import {
  ActiveRoomKeepAwake,
  PersistentRoomPlayer,
} from '@/components/persistent-room-player';
import { ToastProvider } from '@/components/toast';
import { palette, terminalThemeVariables } from '@/constants/theme';
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
  const terminalVariables = vars(terminalThemeVariables);

  useEffect(() => {
    const background = enabled
      ? palette.terminal.background
      : palette[resolvedScheme].background;
    void SystemUI.setBackgroundColorAsync(background);
  }, [enabled, resolvedScheme]);

  return (
    <NativePresentationProvider mode={enabled ? 'terminal' : 'default'}>
      <GestureHandlerRootView
        className={
          enabled
            ? 'flex-1 bg-[#010705]'
            : 'flex-1 bg-mobile-background dark:bg-mobile-dark-background'
        }
        {...(enabled
          ? {
              style: [terminalVariables, terminalRootBackgroundStyle],
            }
          : {})}
      >
        <SafeAreaProvider>
          <ThemeProvider
            value={
              enabled
                ? terminalNavigationTheme
                : resolvedScheme === 'light'
                  ? DefaultTheme
                  : DarkTheme
            }
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

const terminalRootBackgroundStyle = {
  backgroundColor: palette.terminal.background,
};

const terminalNavigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: palette.terminal.background,
    border: palette.terminal.border,
    card: palette.terminal.card,
    notification: palette.terminal.accent,
    primary: palette.terminal.accent,
    text: palette.terminal.text,
  },
};

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
