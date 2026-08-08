import { parseColorScheme, resolveColorScheme, safeWrap } from '@vibes/shared';
import { useEffect } from 'react';

export function useThemeSync() {
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const apply = () => {
      const [, value] = safeWrap(() =>
        window.localStorage.getItem(themeStorageName),
      );
      const [, preferences] = safeWrap<ThemePreferences>(() =>
        JSON.parse(value ?? '{}'),
      );
      const colorScheme = parseColorScheme(preferences?.theme ?? null);
      const resolved = resolveColorScheme(colorScheme, media.matches);
      document.documentElement.classList.toggle(
        darkThemeClassName,
        resolved === 'dark',
      );
      document.documentElement.classList.toggle(
        lightThemeClassName,
        resolved === 'light' && colorScheme === 'light',
      );
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === themeStorageName) apply();
    };
    apply();
    media.addEventListener('change', apply);
    window.addEventListener('storage', handleStorage);

    return () => {
      media.removeEventListener('change', apply);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);
}

interface ThemePreferences {
  theme?: string;
}

const themeStorageName = 'preferences';

const darkThemeClassName = 'dark';

const lightThemeClassName = 'theme-light';
