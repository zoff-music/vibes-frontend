import { addVibesUtilities } from '../../tailwind.vibes.mjs';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#ff2e97',
        secondary: '#00d9ff',
      },
      fontFamily: {
        body: ['"Pixelify Sans"', 'system-ui', 'sans-serif'],
        heading: ['"Pixelify Sans"', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
        pixel: ['"Pixelify Sans"', 'cursive'],
      },
    },
  },
  plugins: [addVibesUtilities],
};
