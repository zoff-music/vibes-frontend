import { palette } from '@/constants/theme';
import { useKonamiMode } from '@/providers/konami-mode-provider';
import { useThemePreference } from '@/providers/theme-provider';

export function useAppTheme() {
  const [{ resolvedScheme }] = useThemePreference();
  const { enabled } = useKonamiMode();
  if (enabled) return palette.terminal;
  return palette[resolvedScheme];
}
