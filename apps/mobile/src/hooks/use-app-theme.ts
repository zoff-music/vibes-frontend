import { useColorScheme } from 'react-native';

import { palette } from '@/constants/theme';

export function useAppTheme() {
  const scheme = useColorScheme();
  return palette[scheme === 'light' ? 'light' : 'dark'];
}
