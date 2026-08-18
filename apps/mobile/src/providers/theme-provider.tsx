import { useFetcher, useRouteLoaderData } from '@vibes/native-router';
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
import type { ThemeActionData } from '@/routes/preferences.theme/action';

export type ThemePreference = 'auto' | 'dark' | 'light';

interface ThemeState {
  preference: ThemePreference;
  resolvedScheme: 'dark' | 'light';
  warning: string;
}

type ThemeContextValue = readonly [
  ThemeState,
  (preference: ThemePreference) => Promise<void>,
];

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function AppThemeProvider({ children }: PropsWithChildren) {
  const [, preferenceFetcher] = useFetcher<ThemeActionData>({
    routeId: 'preferences.theme',
  });
  const systemScheme = useColorScheme();
  const loadedPreference =
    useRouteLoaderData<ThemePreference>('preferences.theme');
  const [preference, setPreferenceValue] = useState<ThemePreference>('auto');
  const [warning, setWarning] = useState('');

  useEffect(() => {
    if (!loadedPreference) return;
    Appearance.setColorScheme(
      loadedPreference === 'auto' ? 'unspecified' : loadedPreference,
    );
    setPreferenceValue(loadedPreference);
  }, [loadedPreference]);

  const setPreference = useCallback(
    async (nextPreference: ThemePreference) => {
      const result = await preferenceFetcher.submit(nextPreference);
      if (!result.data) return;
      Appearance.setColorScheme(
        result.data.preference === 'auto'
          ? 'unspecified'
          : result.data.preference,
      );
      setPreferenceValue(result.data.preference);
      setWarning(result.data.warning);
    },
    [preferenceFetcher.submit],
  );

  const resolvedScheme =
    preference === 'auto'
      ? systemScheme === 'light'
        ? 'light'
        : 'dark'
      : preference;

  const value = useMemo<ThemeContextValue>(
    () => [{ preference, resolvedScheme, warning }, setPreference],
    [preference, resolvedScheme, setPreference, warning],
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
