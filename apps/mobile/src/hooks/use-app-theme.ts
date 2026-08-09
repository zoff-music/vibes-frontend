import { palette } from '@/constants/theme';
import { useThemePreference } from '@/providers/theme-provider';

export function useAppTheme() {
  const { resolvedScheme } = useThemePreference();
  return palette[resolvedScheme];
}
