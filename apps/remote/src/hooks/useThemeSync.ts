import { useThemeStore } from '@vibes/shared/themeStore';
import { useEffect } from 'preact/compat';

export function useThemeSync() {
  const syncTheme = useThemeStore((state) => state.syncTheme);

  useEffect(() => {
    syncTheme();
  }, [syncTheme]);
}
