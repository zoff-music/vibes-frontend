import { create } from 'zustand';
import { browserDebugLog } from '../utils/debug';
import { safeWrap } from '../wrap';

// Theme definitions - easy to add new themes by adding to this object
export const themes = {
  light: {
    id: 'light',
    name: 'Light',
    class: 'theme-light',
  },
  dark: {
    id: 'dark',
    name: 'Dark',
    class: 'dark',
  },
  auto: {
    id: 'auto',
    name: 'Auto',
    class: '', // Auto is the baseline (no class)
  },
} as const;

export type ThemeId = keyof typeof themes;

export type Theme = (typeof themes)[ThemeId];

interface Preferences {
  theme: ThemeId;
  version: number;
}

interface ThemeState {
  themeId: ThemeId;
  resolvedTheme: 'light' | 'dark';
  isDarkMode: boolean;
  isWarping: boolean;
  currentTheme: Theme;
  syncTheme: () => void;
  setTheme: (themeId: ThemeId) => void;
  toggleDarkMode: () => void; // Convenience method for simple light/dark toggle
  setIsWarping: (warp: boolean) => void;
}

// Cookie utilities
const COOKIE_NAME = 'preferences';
const STORAGE_NAME = 'preferences';
const CURRENT_VERSION = 1;

function setCookie(name: string, value: string, days: number = 365) {
  if (typeof document === 'undefined') return;

  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

  const cookieString = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;

  Reflect.set(document, 'cookie', cookieString);
}

function savePreferences(preferences: Preferences) {
  const json = JSON.stringify(preferences);
  const base64 = btoa(json);
  const encoded = base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  setCookie(COOKIE_NAME, encoded);

  if (typeof window === 'undefined') return;

  safeWrap(() => window.localStorage.setItem(STORAGE_NAME, json));
}

// Apply theme class to document
function applyTheme(themeId: ThemeId) {
  if (typeof document === 'undefined') return;

  const html = document.documentElement;

  html.classList.toggle(themes.light.class, themeId === 'light');
  html.classList.toggle(themes.dark.class, resolveTheme(themeId) === 'dark');
}

function getCookieTheme(): ThemeId | null {
  if (typeof document === 'undefined') return null;

  const encoded = document.cookie
    .split(';')
    .map((value) => value.trim())
    .find((value) => value.startsWith(`${COOKIE_NAME}=`))
    ?.slice(COOKIE_NAME.length + 1);

  if (!encoded) return null;

  const [error, preferences] = safeWrap(() =>
    getStoredPreferences(
      atob(decodeURIComponent(encoded).replace(/-/g, '+').replace(/_/g, '/')),
    ),
  );

  return error ? null : (preferences?.theme ?? null);
}

// Initialize theme by checking the initial data provided by SSR, then DOM state
function getInitialThemeSync(): ThemeId {
  if (typeof document === 'undefined') {
    return 'auto'; // Server-side fallback
  }

  const cookieTheme = getCookieTheme();

  if (cookieTheme) return cookieTheme;

  // 1. Try to get theme from SSR data (most reliable source of truth)
  const dataElement = document.getElementById('ssr-data');

  if (dataElement) {
    const [err, data] = safeWrap(() =>
      JSON.parse(dataElement.textContent || '{}'),
    );

    if (!err && data && data.theme) {
      // Validate that the theme is valid
      if (
        data.theme === 'dark' ||
        data.theme === 'light' ||
        data.theme === 'auto'
      ) {
        browserDebugLog('[Theme] Initialized from SSR data:', data.theme);

        return data.theme as ThemeId;
      }
    }
  }

  // 2. Fallback: Check if the HTML element has any theme class
  const classList = document.documentElement.classList;

  if (classList.contains('dark')) return 'dark';

  if (classList.contains('theme-light')) return 'light';

  return 'auto';
}

function resolveTheme(themeId: ThemeId): 'light' | 'dark' {
  if (themeId !== 'auto') return themeId as 'light' | 'dark';

  if (typeof window === 'undefined') return 'light';

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function getStoredPreferences(value: string | null): Preferences | null {
  if (!value) return null;

  const [err, preferences] = safeWrap<unknown>(() => JSON.parse(value));

  if (err || !preferences || typeof preferences !== 'object') return null;

  const theme = Reflect.get(preferences, 'theme');
  const version = Reflect.get(preferences, 'version');

  if (
    version !== CURRENT_VERSION ||
    (theme !== 'light' && theme !== 'dark' && theme !== 'auto')
  ) {
    return null;
  }

  return { theme, version };
}

// Initialize theme immediately - before any React rendering
const INITIAL_THEME = getInitialThemeSync();

browserDebugLog('[Theme] Initial theme detected from DOM:', INITIAL_THEME);

export const useThemeStore = create<ThemeState>((set, get) => {
  browserDebugLog('[Theme] Store initialized with theme:', INITIAL_THEME);

  // Set up listener for system theme changes if in auto mode
  if (typeof window !== 'undefined') {
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (e) => {
        if (get().themeId === 'auto') {
          const newResolved = e.matches ? 'dark' : 'light';
          applyTheme('auto');
          set({
            resolvedTheme: newResolved,
            isDarkMode: newResolved === 'dark',
          });
        }
      });

    // Cookies share the user's choice across local app ports; storage events do not.
    window.addEventListener('focus', () => get().syncTheme());
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') get().syncTheme();
    });

    window.addEventListener('storage', (event) => {
      if (event.key !== STORAGE_NAME) return;

      const preferences = getStoredPreferences(event.newValue);

      if (!preferences || preferences.theme === get().themeId) return;

      applyTheme(preferences.theme);
      const resolved = resolveTheme(preferences.theme);
      set({
        themeId: preferences.theme,
        resolvedTheme: resolved,
        isDarkMode: resolved === 'dark',
        currentTheme: themes[preferences.theme],
      });
    });
  }

  const initialResolved = resolveTheme(INITIAL_THEME);

  return {
    themeId: INITIAL_THEME,
    resolvedTheme: initialResolved,
    isDarkMode: initialResolved === 'dark',
    isWarping: false,
    currentTheme: themes[INITIAL_THEME],

    syncTheme: () => {
      const themeId = getCookieTheme() ?? get().themeId;
      const resolved = resolveTheme(themeId);

      if (themeId === get().themeId && resolved === get().resolvedTheme) return;

      applyTheme(themeId);
      set({
        themeId,
        currentTheme: themes[themeId],
        resolvedTheme: resolved,
        isDarkMode: resolved === 'dark',
      });
    },

    setTheme: (themeId: ThemeId) => {
      browserDebugLog('[Theme] Setting theme to:', themeId);
      applyTheme(themeId);
      savePreferences({ theme: themeId, version: CURRENT_VERSION });

      const resolved = resolveTheme(themeId);
      set({
        themeId,
        resolvedTheme: resolved,
        isDarkMode: resolved === 'dark',
        currentTheme: themes[themeId],
      });
    },

    toggleDarkMode: () => {
      const current = get().themeId;
      // Toggle cycles: light -> dark -> auto -> light
      let newTheme: ThemeId;

      if (current === 'light') newTheme = 'dark';
      else if (current === 'dark') newTheme = 'auto';
      else newTheme = 'light';

      get().setTheme(newTheme);
    },

    setIsWarping: (warp: boolean) => {
      set({ isWarping: warp });
    },
  };
});
