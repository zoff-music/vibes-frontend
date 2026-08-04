import {
  parseColorScheme,
  type ResolvedColorScheme,
  resolveColorScheme,
} from '@vibes/shared';

export const getInitialColorScheme = (): ResolvedColorScheme => {
  const value = new URLSearchParams(window.location.search).get('theme');
  return resolveColorScheme(
    parseColorScheme(value),
    window.matchMedia('(prefers-color-scheme: dark)').matches,
  );
};

export const applyColorScheme = (colorScheme: ResolvedColorScheme) => {
  const root = document.documentElement;
  root.classList.remove('dark', 'theme-light');
  root.classList.add(colorScheme === 'dark' ? 'dark' : 'theme-light');

  const colorSchemeMeta = document.querySelector<HTMLMetaElement>(
    'meta[name="color-scheme"]',
  );
  if (colorSchemeMeta) colorSchemeMeta.content = colorScheme;
};
