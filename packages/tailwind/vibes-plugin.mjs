/** Shared Vibes utilities for the Tailwind compatibility config. */
export function addVibesUtilities({ addBase, addUtilities }) {
  addBase({
    '@keyframes vhsJitter': {
      '0%, 100%': { transform: 'translate(0, 0)' },
      '20%': { transform: 'translate(-1px, 1px)' },
      '40%': { transform: 'translate(1px, -1px)' },
      '60%': { transform: 'translate(-2px, 0)' },
      '80%': { transform: 'translate(2px, 1px)' },
    },
    '@keyframes vhsSlice': {
      '0%': { clipPath: 'inset(0 0 80% 0)' },
      '20%': { clipPath: 'inset(10% 0 60% 0)' },
      '40%': { clipPath: 'inset(30% 0 30% 0)' },
      '60%': { clipPath: 'inset(55% 0 10% 0)' },
      '80%': { clipPath: 'inset(20% 0 50% 0)' },
      '100%': { clipPath: 'inset(0 0 80% 0)' },
    },
    '@keyframes retroGridScroll': {
      from: { backgroundPosition: '0 0, 0 0' },
      to: { backgroundPosition: '0 80px, 0 80px' },
    },
    '@media (prefers-reduced-motion: reduce)': {
      '*, *::before, *::after': {
        animationDuration: '0.01ms',
        animationIterationCount: '1',
        transitionDuration: '0.01ms',
      },
      '.vhs-tear::before, .vhs-tear::after, .vhs-tear-strong::before, .vhs-tear-strong::after, .vhs-scanlines, .synth-sky, .retro-grid, .float-slow, .float-fast, .scanlines, .glow-pulse, .gradient-shift':
        {
          animation: 'none',
        },
    },
  });

  addUtilities({
    '.glass': {
      backgroundColor: 'var(--theme-glass-bg)',
      border: '1px solid var(--theme-glass-border)',
      boxShadow: '4px 4px 0px 0px var(--theme-shadow)',
      transition:
        'background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
    },
    '.glass-elevated': {
      backgroundColor: 'var(--theme-bg-elevated)',
      border: '1px solid var(--theme-border-strong)',
      boxShadow:
        '6px 6px 0px 0px var(--theme-shadow-accent), 0 4px 20px var(--theme-shadow)',
      transition:
        'background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
    },
    '.neon-pink': {
      boxShadow:
        '0 0 10px rgba(255, 46, 151, 0.3), 0 0 20px rgba(255, 46, 151, 0.15)',
    },
    '.dark .neon-pink': {
      boxShadow:
        '0 0 15px rgba(255, 46, 151, 0.5), 0 0 30px rgba(255, 46, 151, 0.25)',
    },
    '.neon-cyan': {
      boxShadow:
        '0 0 10px rgba(0, 217, 255, 0.3), 0 0 20px rgba(0, 217, 255, 0.15)',
    },
    '.dark .neon-cyan': {
      boxShadow:
        '0 0 15px rgba(0, 217, 255, 0.5), 0 0 30px rgba(0, 217, 255, 0.25)',
    },
    '.transition-smooth': {
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    '.jp-art': {
      fontFamily: '"Noto Sans JP", sans-serif',
      letterSpacing: '0.1em',
    },
    '.font-display': {
      fontFamily: '"Pixelify Sans", sans-serif',
      letterSpacing: '0.08em',
    },
    '.font-body': {
      fontFamily: '"Pixelify Sans", "Zen Maru Gothic", system-ui, sans-serif',
    },
    '.font-mono': {
      fontFamily: '"Pixelify Sans", "Courier New", monospace',
    },
    '.font-pixel': {
      fontFamily: '"Pixelify Sans", cursive',
      letterSpacing: '0.05em',
    },
    '.font-wide': {
      fontFamily: '"Syncopate", sans-serif',
      textTransform: 'uppercase',
      letterSpacing: '0.25em',
    },
    '.vhs-tear': {
      position: 'relative',
      display: 'inline-block',
      textShadow:
        '0 0 12px rgba(255, 80, 200, 0.4), 0 0 24px rgba(0, 217, 255, 0.35)',
    },
    '.vhs-tear::before': {
      content: 'attr(data-text)',
      position: 'absolute',
      left: '2px',
      top: '-1px',
      color: 'rgba(0, 217, 255, 0.7)',
      opacity: '0.75',
      animation: 'vhsJitter 1.4s infinite linear',
    },
    '.vhs-tear::after': {
      content: 'attr(data-text)',
      position: 'absolute',
      left: '-2px',
      top: '1px',
      color: 'rgba(255, 46, 151, 0.8)',
      opacity: '0.7',
      animation: 'vhsJitter 1.1s infinite linear reverse',
    },
    '.vhs-tear-strong': {
      textShadow:
        '0 0 14px rgba(255, 80, 200, 0.6), 0 0 26px rgba(0, 217, 255, 0.45)',
    },
    '.vhs-tear-strong::before': {
      left: '3px',
      top: '-2px',
      color: 'rgba(0, 217, 255, 0.85)',
      opacity: '0.85',
      filter: 'blur(0.4px)',
      animation:
        'vhsJitter 1.2s infinite linear, vhsSlice 2.2s infinite steps(2, end)',
    },
    '.vhs-tear-strong::after': {
      left: '-3px',
      top: '2px',
      color: 'rgba(255, 46, 151, 0.9)',
      opacity: '0.85',
      filter: 'blur(0.4px)',
      animation:
        'vhsJitter 1s infinite linear reverse, vhsSlice 1.8s infinite steps(2, end)',
    },
    '.glow-text': {
      textShadow:
        '0 0 10px rgba(255, 80, 200, 0.35), 0 0 24px rgba(0, 217, 255, 0.25)',
    },
    '.vhs-scanlines': {
      backgroundImage:
        'repeating-linear-gradient(to bottom, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05) 1px, transparent 1px, transparent 3px)',
      mixBlendMode: 'screen',
      opacity: '0.25',
      animation: 'scanlines 1.8s linear infinite',
    },
    '.crt-overlay': {
      position: 'fixed',
      inset: '0',
      pointerEvents: 'none',
      zIndex: '9999',
      background:
        'radial-gradient(circle, rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.4) 90%, rgba(0, 0, 0, 0.7) 100%)',
      boxShadow: 'inset 0 0 10rem rgba(0, 0, 0, 0.5)',
    },
    '.crt-overlay::before': {
      content: '" "',
      display: 'block',
      position: 'absolute',
      inset: '0',
      background:
        'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
      zIndex: '2',
      backgroundSize: '100% 2px, 4px 100%',
      pointerEvents: 'none',
    },
    '.neon-panel': {
      background:
        'linear-gradient(145deg, rgba(11, 6, 24, 0.95), rgba(37, 16, 61, 0.85))',
      border: '1px solid rgba(255, 120, 200, 0.3)',
      boxShadow:
        '0 0 0 1px rgba(255, 120, 200, 0.15), 0 20px 60px rgba(7, 4, 16, 0.7), 0 0 24px rgba(255, 46, 151, 0.35)',
      backdropFilter: 'blur(12px)',
    },
    '.crt-frame': {
      border: '1px solid var(--theme-panel-border)',
      boxShadow:
        'inset 0 0 0 1px rgba(255, 255, 255, 0.05), 0 0 40px var(--theme-crt-shadow), 0 0 24px rgba(0, 217, 255, 0.2)',
      background: 'var(--theme-crt-bg)',
      backdropFilter: 'blur(8px)',
    },
    '.neon-glow': {
      boxShadow:
        '0 0 16px rgba(255, 46, 151, 0.5), 0 0 32px rgba(0, 217, 255, 0.35)',
    },
    '.float-slow': {
      animation: 'float 5s ease-in-out infinite',
    },
    '.float-fast': {
      animation: 'float 2.2s ease-in-out infinite',
    },
    '.progress-bar': {
      appearance: 'none',
      backgroundColor: 'rgba(255, 255, 255, 0.12)',
      borderRadius: '9999px',
      overflow: 'hidden',
    },
    '.progress-bar::-webkit-progress-bar': {
      backgroundColor: 'rgba(255, 255, 255, 0.12)',
      borderRadius: '9999px',
    },
    '.progress-bar::-webkit-progress-value': {
      background: 'linear-gradient(90deg, #ff3fa4, #00d9ff)',
      borderRadius: '9999px',
      boxShadow: '0 0 12px rgba(255, 63, 164, 0.6)',
    },
    '.progress-bar::-moz-progress-bar': {
      background: 'linear-gradient(90deg, #ff3fa4, #00d9ff)',
      borderRadius: '9999px',
      boxShadow: '0 0 12px rgba(255, 63, 164, 0.6)',
    },
    '.panel-surface': {
      backgroundColor: 'var(--theme-panel-bg)',
      border: '1px solid var(--theme-panel-border)',
      boxShadow: '0 20px 60px var(--theme-shadow)',
      backdropFilter: 'blur(20px)',
    },
    '.panel-surface.no-box': {
      boxShadow: 'unset',
    },
    '.panel-strong': {
      backgroundColor: 'var(--theme-panel-strong-bg)',
      border: '1px solid var(--theme-panel-border-strong)',
      boxShadow: '0 20px 60px var(--theme-shadow)',
      backdropFilter: 'blur(24px)',
    },
    '.text-theme': {
      color: 'var(--theme-text)',
    },
    '.text-theme-muted': {
      color: 'var(--theme-text-muted)',
    },
    '.text-theme-subtle': {
      color: 'var(--theme-text-subtle)',
    },
    '.bg-theme-surface': {
      backgroundColor: 'var(--theme-bg-surface)',
    },
    '.bg-theme-elevated': {
      backgroundColor: 'var(--theme-bg-elevated)',
    },
    '.border-theme': {
      borderColor: 'var(--theme-border)',
    },
    '.border-theme-strong': {
      borderColor: 'var(--theme-border-strong)',
    },
    '.bg-theme': {
      backgroundColor: 'var(--theme-bg)',
    },
  });
}
