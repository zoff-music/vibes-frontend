import type { ColorScheme, ResolvedColorScheme } from '../types';

export const parseColorScheme = (value: string | null): ColorScheme => {
  if (value === 'light' || value === 'dark') return value;
  return 'auto';
};

export const resolveColorScheme = (
  colorScheme: ColorScheme,
  prefersDark: boolean,
): ResolvedColorScheme => {
  if (colorScheme === 'auto') return prefersDark ? 'dark' : 'light';
  return colorScheme;
};
