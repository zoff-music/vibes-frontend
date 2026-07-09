/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './client.tsx',
    './index.html',
    '../../packages/*/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
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
        body: ['"Space Grotesk"', '"Noto Sans JP"', 'system-ui', 'sans-serif'],
        heading: ['"Orbitron"', '"Noto Sans JP"', 'system-ui', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '18px',
        '2xl': '22px',
        full: '9999px',
      },
      boxShadow: {
        'neon-pink': '0 0 22px rgba(255, 62, 166, 0.6)',
        'neon-cyan': '0 0 24px rgba(53, 211, 255, 0.55)',
        soft: '0 10px 30px rgba(7, 3, 15, 0.45)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        float: 'float 6s ease-in-out infinite',
        'float-delayed': 'float 7s ease-in-out 1s infinite',
        tear: 'tear 2.4s steps(1, end) infinite',
        'tear-shift': 'tearShift 3.6s steps(1, end) infinite',
        'retro-grid-scroll': 'retroGridScroll 16s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        tear: {
          '0%, 100%': { clipPath: 'inset(0 0 0 0)' },
          '12%': { clipPath: 'inset(12% 0 55% 0)' },
          '25%': { clipPath: 'inset(0 0 72% 0)' },
          '42%': { clipPath: 'inset(40% 0 28% 0)' },
          '60%': { clipPath: 'inset(18% 0 60% 0)' },
          '78%': { clipPath: 'inset(0 0 45% 0)' },
        },
        tearShift: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-6px)' },
          '40%': { transform: 'translateX(4px)' },
          '60%': { transform: 'translateX(-3px)' },
          '80%': { transform: 'translateX(5px)' },
        },
        retroGridScroll: {
          from: { backgroundPosition: '0 0, 0 0' },
          to: { backgroundPosition: '0 36px, 0 36px' },
        },
      },
      backgroundImage: {
        'synth-sky': `
          radial-gradient(circle at 20% 20%, rgba(255, 106, 177, 0.28), transparent 45%),
          radial-gradient(circle at 80% 10%, rgba(53, 211, 255, 0.24), transparent 40%),
          linear-gradient(180deg, #120725 0%, #2a0f4e 45%, #ff5d86 100%)
        `,
        'vhs-lines': `repeating-linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.02) 1px, transparent 1px, transparent 3px)`,
        'sun-hero-gradient': `radial-gradient(circle at 50% 40%, #ffd76a, #ff4d86 58%)`,
        'sun-hero-stripes': `repeating-linear-gradient(180deg, rgba(255, 206, 111, 0.9), rgba(255, 206, 111, 0.9) 6px, rgba(255, 120, 160, 0.75) 6px, rgba(255, 120, 160, 0.75) 12px)`,
        'retro-grid-gradient': `linear-gradient(rgba(255, 105, 180, 0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(53, 211, 255, 0.25) 1px, transparent 1px)`,
        'panel-surface-gradient': `linear-gradient(145deg, rgba(26, 12, 50, 0.92), rgba(40, 18, 70, 0.98))`,
      },
    },
  },
  safelist: [
    'hidden',
    'inline',
    'sm:hidden',
    'sm:inline',
    'md:hidden',
    'md:inline',
    'lg:hidden',
    'lg:inline',
    'xl:hidden',
    'xl:inline',
    'space-y-3',
  ],
  plugins: [
    ({ addUtilities }) => {
      addUtilities({
        '.text-readable': {
          textShadow: '0 1px 4px rgba(0, 0, 0, 0.8)',
        },
        '.glow-text': {
          textShadow: '0 0 10px rgba(255, 62, 166, 0.6)',
        },
        '.bg-theme': {
          backgroundColor: '#0b0718',
        },
        '.text-theme': {
          color: '#f9f3ff',
        },
        '.text-theme-muted': {
          color: '#c2b7e8',
        },
        '.text-theme-subtle': {
          color: '#8e82b8',
        },
        '.synth-sky': {
          backgroundImage: `
            radial-gradient(circle at 20% 20%, rgba(255, 106, 177, 0.28), transparent 45%),
            radial-gradient(circle at 80% 10%, rgba(53, 211, 255, 0.24), transparent 40%),
            linear-gradient(180deg, #120725 0%, #2a0f4e 45%, #ff5d86 100%)
          `,
        },
        '.vhs-scanlines::before': {
          content: '""',
          position: 'absolute',
          inset: '0',
          backgroundImage:
            'repeating-linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.02) 1px, transparent 1px, transparent 3px)',
          mixBlendMode: 'screen',
          pointerEvents: 'none',
          opacity: '0.8',
        },
        '.sun-hero': {
          position: 'absolute',
          left: '50%',
          top: '22%',
          transform: 'translateX(-50%)',
          width: 'clamp(240px, 40vw, 420px)',
          aspectRatio: '1 / 1',
          borderRadius: '9999px',
          backgroundImage:
            'radial-gradient(circle at 50% 40%, #ffd76a, #ff4d86 58%)',
          boxShadow: '0 0 40px rgba(255, 102, 153, 0.3)',
        },
        '.sun-hero::after': {
          content: '""',
          position: 'absolute',
          left: '8%',
          right: '8%',
          bottom: '18%',
          height: '28%',
          backgroundImage:
            'repeating-linear-gradient(180deg, rgba(255, 206, 111, 0.9), rgba(255, 206, 111, 0.9) 6px, rgba(255, 120, 160, 0.75) 6px, rgba(255, 120, 160, 0.75) 12px)',
          borderRadius: '999px',
        },
        '.retro-grid': {
          position: 'absolute',
          inset: '55% -10% -40%',
          backgroundImage:
            'linear-gradient(rgba(255, 105, 180, 0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(53, 211, 255, 0.25) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
          animation: 'retroGridScroll 16s linear infinite',
          willChange: 'background-position',
          transform: 'perspective(800px) rotateX(55deg)',
        },
        '.panel-surface': {
          backgroundImage:
            'linear-gradient(145deg, rgba(26, 12, 50, 0.92), rgba(40, 18, 70, 0.98))',
          borderRadius: '14px',
          borderWidth: '1px',
          borderColor: 'rgba(255, 120, 195, 0.2)',
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.4)',
        },
        '.panel-frame': {
          borderRadius: '22px',
          borderWidth: '1px',
          borderColor: 'rgba(255, 120, 195, 0.3)',
          boxShadow: '0 10px 20px rgba(0, 0, 0, 0.5)',
        },
        '.cast-queue button': {
          backgroundColor: 'rgba(40, 18, 70, 0.85)',
          border: '1px solid rgba(112, 72, 140, 0.3)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          textAlign: 'left',
        },
        '.vhs-tear-strong': {
          position: 'relative',
          display: 'inline-block',
        },
        '.vhs-tear-strong::before, .vhs-tear-strong::after': {
          content: 'attr(data-text)',
          position: 'absolute',
          left: '0',
          top: '0',
          width: '100%',
          overflow: 'hidden',
          pointerEvents: 'none',
          animationName: 'tear, tearShift',
          animationDuration: '2.4s, 3.6s',
          animationTimingFunction: 'steps(1, end), steps(1, end)',
          animationIterationCount: 'infinite, infinite',
          opacity: '0.8',
        },
        '.vhs-tear-strong::before': {
          color: 'rgba(53, 211, 255, 0.7)',
          transform: 'translateX(-2px)',
        },
        '.vhs-tear-strong::after': {
          color: 'rgba(255, 62, 166, 0.8)',
          transform: 'translateX(2px)',
        },
      });
    },
  ],
};
