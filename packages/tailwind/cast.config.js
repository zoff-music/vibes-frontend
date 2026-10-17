/** Cast-specific theme exported from the shared Tailwind package. */
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        'cast-compact': {
          raw: '(min-width: 640px) and (max-width: 1100px), (min-width: 640px) and (max-aspect-ratio: 4/3)',
        },
        'cast-square': { raw: '(max-aspect-ratio: 4/3)' },
        'cast-square-wide': {
          raw: '(min-width: 640px) and (max-aspect-ratio: 4/3)',
        },
        'cast-landscape': {
          raw: '(max-width: 1100px) and (min-aspect-ratio: 4/3)',
        },
        'cast-short': { raw: '(max-width: 1100px) and (max-height: 560px)' },
        'cast-short-square': {
          raw: '(max-width: 1100px) and (max-height: 560px) and (max-aspect-ratio: 4/3)',
        },
        'cast-tiny-square': {
          raw: '(max-width: 1100px) and (max-height: 400px) and (max-aspect-ratio: 4/3)',
        },
      },
      textShadow: {
        'cast-readable': '0 1px 4px rgba(0,0,0,0.8)',
      },
      colors: {
        'cast-border': 'rgba(86, 53, 121, 0.18)',
        'cast-border-dark': 'rgba(112, 72, 140, 0.25)',
        'cast-border-strong': 'rgba(255, 62, 166, 0.28)',
        'cast-border-strong-dark': 'rgba(255, 120, 195, 0.24)',
        'cast-surface-dark': '#1e1330',
        'cast-panel-dark': '#160b27',
        'cast-track-dark': '#07030d',
        background: '#f7f4ff',
        paper: '#ffffff',
        surface: '#f2effa',
        surfaceElevated: '#ffffff',
        border: '#e2d8f6',

        dark: {
          background: '#0b0718',
          paper: '#130b26',
          surface: '#1b0f34',
          surfaceElevated: '#251248',
          border: '#3c1f62',
          text: '#f9f3ff',
          'text-muted': '#c2b7e8',
          'text-subtle': '#8e82b8',
        },

        primary: '#ff3ea6',
        secondary: '#35d3ff',
        accent: '#ffd06a',
        purple: '#b26bff',

        text: '#281c4b',
        'text-muted': '#6e5f97',
        'text-subtle': '#9a8bc8',
        'text-inverse': '#ffffff',
      },
      fontFamily: {
        body: ['"MSW98UI"', '"MS Sans Serif"', 'Tahoma', 'sans-serif'],
        heading: ['"MSW98UI"', '"MS Sans Serif"', 'Tahoma', 'sans-serif'],
        mono: ['"MSW98UI"', '"Lucida Console"', '"Courier New"', 'monospace'],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '18px',
        '2xl': '22px',
        full: '9999px',
      },
      backgroundImage: {
        'cast-shell':
          'linear-gradient(145deg, #f7f4ff 0%, #eee8fa 55%, #fceff8 100%)',
        'cast-shell-dark':
          'linear-gradient(145deg, #120820 0%, #090412 55%, #160927 100%)',
        'cast-panel-surface':
          'linear-gradient(145deg, rgba(255,255,255,0.94), rgba(246,238,255,0.98))',
        'cast-panel-surface-dark':
          'linear-gradient(145deg, rgba(26,12,50,0.92), rgba(40,18,70,0.98))',
      },
      boxShadow: {
        cast: '0 10px 20px rgba(50,26,82,0.15)',
        'cast-dark': '0 10px 20px rgba(0,0,0,0.5)',
        'neon-pink': '0 0 22px rgba(255, 62, 166, 0.6)',
        'neon-cyan': '0 0 24px rgba(53, 211, 255, 0.55)',
        soft: '0 10px 30px rgba(7, 3, 15, 0.45)',
      },
    },
  },
};
