import * as SecureStore from 'expo-secure-store';
import type { PropsWithChildren } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Appearance, useColorScheme } from 'react-native';

export type ThemePreference = 'auto' | 'dark' | 'light';

interface ThemeState {
  preference: ThemePreference;
  resolvedScheme: 'dark' | 'light';
  setPreference: (preference: ThemePreference) => Promise<void>;
}

const ThemeContext = createContext<ThemeState | null>(null);

export function AppThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceValue] = useState<ThemePreference>('auto');

  useEffect(() => {
    const restorePreference = async () => {
      const storedPreference = await SecureStore.getItemAsync(themeStorageKey);
      if (!isThemePreference(storedPreference)) return;
      Appearance.setColorScheme(
        storedPreference === 'auto' ? 'unspecified' : storedPreference,
      );
      setPreferenceValue(storedPreference);
    };
    void restorePreference();
  }, []);

  const setPreference = useCallback(async (nextPreference: ThemePreference) => {
    Appearance.setColorScheme(
      nextPreference === 'auto' ? 'unspecified' : nextPreference,
    );
    setPreferenceValue(nextPreference);
    await SecureStore.setItemAsync(themeStorageKey, nextPreference);
  }, []);

  const resolvedScheme =
    preference === 'auto'
      ? systemScheme === 'light'
        ? 'light'
        : 'dark'
      : preference;

  const value = useMemo<ThemeState>(
    () => ({ preference, resolvedScheme, setPreference }),
    [preference, resolvedScheme, setPreference],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useThemePreference() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemePreference must be used inside AppThemeProvider');
  }
  return context;
}

function isThemePreference(value: string | null): value is ThemePreference {
  return value === 'auto' || value === 'dark' || value === 'light';
}

const themeStorageKey = 'zoff.mobile.theme';
