import { useThemeStore } from '@vibes/shared/themeStore';
import { useEffect } from 'react';

export function useThemeSync() {
  const syncTheme = useThemeStore((state) => state.syncTheme);

  useEffect(() => {
    syncTheme();
  }, [syncTheme]);
}
