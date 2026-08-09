import {
  PixelifySans_700Bold,
  useFonts,
} from '@expo-google-fonts/pixelify-sans';
import { safeWrapAsync } from '@vibes/shared';
import { setAudioModeAsync } from 'expo-audio';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import '@/global.css';

import AppTabs from '@/components/app-tabs';
import { palette } from '@/constants/theme';
import { AppProvider } from '@/providers/app-provider';

export default function RootLayout() {
  const scheme = useColorScheme();
  const theme = palette[scheme === 'light' ? 'light' : 'dark'];
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
    <GestureHandlerRootView
      style={{ backgroundColor: theme.background, flex: 1 }}
    >
      <SafeAreaProvider>
        <ThemeProvider value={scheme === 'light' ? DefaultTheme : DarkTheme}>
          <AppProvider>
            <StatusBar style={scheme === 'light' ? 'dark' : 'light'} />
            <AppTabs />
          </AppProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
