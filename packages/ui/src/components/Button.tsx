import React from 'react';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline-solid'
  | 'ghost'
  | 'icon-toggle'
  | 'icon-toggle-active'
  | 'theme-toggle-active'
  | 'menu-toggle'
  | 'menu-toggle-active'
  | 'menu-theme-active'
  | 'header-leave'
  | 'home-join'
  | 'form-primary'
  | 'modal-backdrop'
  | 'settings-backdrop'
  | 'modal-close'
  | 'provider-tab'
  | 'provider-tab-active'
  | 'search-clear'
  | 'search-result'
  | 'search-result-divided'
  | 'dialog-cancel'
  | 'dialog-primary'
  | 'copy-small'
  | 'admin-primary'
  | 'admin-outline'
  | 'admin-neutral'
  | 'cast-button'
  | 'cast-button-connected'
  | 'cast-backdrop'
  | 'cast-close'
  | 'cast-primary-small'
  | 'cast-primary-full'
  | 'cast-demo'
  | 'cast-refresh'
  | 'cast-device'
  | 'cast-device-active'
  | 'source-youtube-active'
  | 'source-youtube-disabled'
  | 'source-spotify-active'
  | 'source-spotify-disabled'
  | 'source-soundcloud-active'
  | 'source-soundcloud-disabled'
  | 'source-disabled'
  | 'room-mode-server-active'
  | 'room-mode-host-active'
  | 'room-mode-inactive'
  | 'settings-source-youtube-active'
  | 'settings-source-spotify-active'
  | 'settings-source-soundcloud-active'
  | 'settings-source-disabled'
  | 'settings-room-mode-server-active'
  | 'settings-room-mode-host-active'
  | 'settings-room-mode-inactive'
  | 'settings-admin-go'
  | 'error-retry'
  | 'error-create'
  | 'player-primary'
  | 'player-control'
  | 'player-control-active'
  | 'player-spotify'
  | 'player-add-song'
  | 'video-overlay'
  | 'auth-primary'
  | 'debug-clear'
  | 'queue-remove';

interface Props
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    'className' | 'style'
  > {
  title?: string;
  variant?: ButtonVariant;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, Props>(
  (
    {
      title,
      children,
      variant = 'primary',
      loading = false,
      disabled = false,
      type = 'button',
      ...props
    },
    ref,
  ) => {
    const baseClasses =
      'inline-flex items-center justify-center rounded-lg font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 cursor-pointer';

    const variantClasses: Record<ButtonVariant, string> = {
      primary: 'bg-primary px-5 py-2.5 text-base text-text-inverse',
      secondary: 'bg-secondary px-5 py-2.5 text-base text-text-inverse',
      'outline-solid':
        'border border-primary bg-transparent px-5 py-2.5 text-base text-primary',
      ghost: 'bg-transparent px-5 py-2.5 text-base text-primary',
      'icon-toggle':
        'cursor-pointer rounded-xl border border-theme bg-transparent p-2.5 text-theme-muted transition-all hover:border-theme-strong hover:text-theme',
      'icon-toggle-active':
        'cursor-pointer rounded-xl border border-theme-strong bg-theme-surface p-2.5 text-theme transition-all',
      'theme-toggle-active':
        'cursor-pointer rounded-xl border border-secondary/60 bg-secondary/20 p-2.5 text-white shadow-[0_0_18px_rgba(0,217,255,0.35)] transition-all',
      'menu-toggle':
        'flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-theme bg-transparent p-3 font-pixel text-theme-muted text-xs transition-all hover:border-theme-strong hover:text-theme',
      'menu-toggle-active':
        'flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-theme-strong bg-theme-surface p-3 font-pixel text-theme text-xs transition-all',
      'menu-theme-active':
        'flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-secondary/60 bg-secondary/20 p-3 font-pixel text-white text-xs shadow-[0_0_12px_rgba(0,217,255,0.35)] transition-all',
      'header-leave':
        'group inline-flex cursor-pointer items-center gap-2 bg-transparent text-theme-muted transition-colors hover:text-theme',
      'home-join':
        'flex cursor-pointer items-center justify-center gap-3 rounded-2xl border border-secondary/50 bg-secondary/85 px-6 py-4 font-pixel text-sm text-white shadow-[0_0_26px_rgba(0,217,255,0.4)] transition-all hover:-translate-y-0.5 hover:bg-secondary disabled:cursor-not-allowed disabled:bg-theme-surface disabled:text-theme-subtle',
      'form-primary':
        'mt-8 flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl bg-primary px-6 py-4 font-pixel text-sm text-white shadow-[0_0_24px_rgba(255,46,151,0.45)] transition-all hover:-translate-y-0.5 hover:bg-primary-muted disabled:cursor-not-allowed disabled:bg-theme-surface disabled:text-theme-subtle',
      'modal-backdrop':
        'fixed inset-0 h-full w-full cursor-pointer bg-transparent',
      'settings-backdrop':
        'absolute inset-0 h-full w-full cursor-pointer bg-transparent',
      'modal-close':
        'cursor-pointer rounded-xl border border-transparent bg-transparent p-2 transition-colors hover:border-theme-strong hover:bg-theme-surface',
      'provider-tab':
        'cursor-pointer rounded-full border border-transparent bg-theme-bg/10 px-4 py-1.5 font-medium text-theme-muted text-xs transition-all hover:bg-theme-surface/50 hover:text-theme',
      'provider-tab-active':
        'cursor-pointer rounded-full border border-theme-subtle bg-theme-surface px-4 py-1.5 font-medium text-theme text-xs shadow-[0_0_12px_rgba(255,255,255,0.25)] transition-all',
      'search-clear':
        'absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer rounded-lg bg-transparent p-1.5 transition-colors hover:bg-theme-surface',
      'search-result':
        'flex w-full cursor-pointer gap-3 bg-transparent p-4 text-left transition-all hover:bg-theme',
      'search-result-divided':
        'flex w-full cursor-pointer gap-3 border-theme border-t bg-transparent p-4 text-left transition-all hover:bg-theme',
      'dialog-cancel':
        'flex-1 cursor-pointer rounded-xl border border-theme bg-theme-surface py-3 text-theme-muted text-xs transition-all hover:border-theme-strong active:scale-[0.98]',
      'dialog-primary':
        'flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary py-3 text-white text-xs shadow-[0_0_18px_rgba(255,46,151,0.4)] transition-all hover:bg-primary-muted active:scale-[0.98] disabled:bg-theme-surface disabled:text-theme-subtle',
      'copy-small':
        'cursor-pointer rounded-lg bg-theme-surface px-3 py-1.5 text-[10px] text-theme transition-all hover:bg-theme active:scale-95',
      'admin-primary':
        'w-full rounded-xl bg-primary py-3 font-bold text-white transition-all hover:bg-primary/90 hover:shadow-retro-pink active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-ink/10 disabled:text-ink/30 dark:disabled:bg-gray-700 dark:disabled:text-gray-500',
      'admin-outline':
        'rounded-xl border border-ink/15 px-4 py-2 font-semibold text-sm transition-all hover:border-primary hover:text-primary dark:border-gray-700 dark:hover:border-primary-light dark:hover:text-primary-light',
      'admin-neutral':
        'rounded-xl bg-ink/10 px-4 py-2 font-semibold text-sm transition-all hover:bg-ink/20 dark:bg-gray-800 dark:hover:bg-gray-700',
      'cast-button':
        'group flex cursor-pointer items-center space-x-2 rounded-lg border-2 border-transparent bg-gray-200 px-4 py-2 text-gray-900 transition-all duration-200 ease-in-out hover:scale-105 hover:border-primary/20 hover:bg-gray-300 active:scale-95 focus:outline-hidden focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-white dark:hover:border-primary-light/30 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-800',
      'cast-button-connected':
        'group flex cursor-pointer items-center space-x-2 rounded-lg border-2 border-transparent bg-primary px-4 py-2 text-white shadow-lg transition-all duration-200 ease-in-out hover:scale-105 hover:border-primary-dark/20 hover:bg-primary-dark active:scale-95 focus:outline-hidden focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-primary-light dark:hover:border-primary/30 dark:hover:bg-primary dark:focus:ring-offset-gray-800',
      'cast-backdrop':
        'absolute inset-0 bg-black/50 backdrop-blur-sm transition-colors duration-200 dark:bg-black/70',
      'cast-close':
        'cursor-pointer bg-transparent text-gray-400 transition-colors duration-200 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300',
      'cast-primary-small':
        'cursor-pointer rounded bg-primary px-3 py-1 text-sm text-white transition-colors duration-200 hover:bg-primary/90 dark:bg-primary-light dark:hover:bg-primary',
      'cast-primary-full':
        'flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-white transition-colors duration-200 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-primary-light dark:hover:bg-primary',
      'cast-demo':
        'mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-white text-xs transition-colors duration-200 hover:bg-gray-700',
      'cast-refresh':
        'cursor-pointer bg-transparent text-primary text-sm transition-colors duration-200 hover:text-primary/80 dark:text-primary-light dark:hover:text-primary',
      'cast-device':
        'w-full cursor-pointer rounded-lg border border-gray-200 bg-white p-3 text-left transition-colors duration-200 hover:bg-gray-50 focus:outline-hidden focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-800',
      'cast-device-active':
        'w-full cursor-default rounded-lg border border-primary/20 bg-primary/10 p-3 text-left transition-colors duration-200 focus:outline-hidden focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 dark:border-primary/30 dark:bg-primary/20 dark:focus:ring-offset-gray-800',
      'source-youtube-active':
        'group relative flex h-10 w-full flex-1 items-center justify-center rounded-xl bg-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.4)] transition-all',
      'source-youtube-disabled':
        'group relative flex h-10 w-full flex-1 items-center justify-center rounded-xl bg-theme-surface-strong/50 text-red-500 transition-all hover:bg-red-500/10',
      'source-spotify-active':
        'group relative flex h-10 w-full flex-1 items-center justify-center rounded-xl bg-green-500 text-black shadow-[0_0_12px_rgba(34,197,94,0.4)] transition-all',
      'source-spotify-disabled':
        'group relative flex h-10 w-full flex-1 items-center justify-center rounded-xl bg-theme-surface-strong/50 text-green-500 transition-all hover:bg-green-500/10',
      'source-soundcloud-active':
        'group relative flex h-10 w-full flex-1 items-center justify-center rounded-xl bg-orange-500 text-white shadow-[0_0_12px_rgba(249,115,22,0.4)] transition-all',
      'source-soundcloud-disabled':
        'group relative flex h-10 w-full flex-1 items-center justify-center rounded-xl bg-theme-surface-strong/50 text-orange-500 transition-all hover:bg-orange-500/10',
      'source-disabled':
        'group relative flex h-10 w-full flex-1 items-center justify-center rounded-xl bg-theme-surface-strong/50 text-theme-muted transition-all hover:bg-theme-surface',
      'room-mode-server-active':
        'cursor-pointer rounded-2xl border border-secondary/60 bg-secondary/10 px-4 py-4 text-left text-theme shadow-[0_0_18px_rgba(0,217,255,0.35)] transition-all',
      'room-mode-host-active':
        'cursor-pointer rounded-2xl border border-primary/60 bg-primary/10 px-4 py-4 text-left text-theme shadow-[0_0_18px_rgba(255,46,151,0.35)] transition-all',
      'room-mode-inactive':
        'cursor-pointer rounded-2xl border border-theme bg-theme-surface px-4 py-4 text-left text-theme-muted transition-all hover:border-theme-strong',
      'settings-source-youtube-active':
        'group relative flex cursor-pointer items-center justify-center rounded-xl border border-red-500/40 bg-red-500/20 py-3 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)] transition-all',
      'settings-source-spotify-active':
        'group relative flex cursor-pointer items-center justify-center rounded-xl border border-green-500/40 bg-green-500/20 py-3 text-green-500 shadow-[0_0_10px_rgba(34,197,94,0.2)] transition-all',
      'settings-source-soundcloud-active':
        'group relative flex cursor-pointer items-center justify-center rounded-xl border border-orange-500/40 bg-orange-500/20 py-3 text-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.2)] transition-all',
      'settings-source-disabled':
        'group relative flex cursor-pointer items-center justify-center rounded-xl border border-theme bg-theme-surface py-3 text-theme-muted opacity-40 transition-all hover:border-theme-strong hover:opacity-60 disabled:cursor-not-allowed disabled:grayscale',
      'settings-room-mode-server-active':
        'flex min-h-22 w-full cursor-pointer flex-col items-start justify-center gap-1 rounded-xl border border-secondary/60 bg-secondary/10 px-4 py-3 text-left text-theme shadow-[0_0_14px_rgba(0,217,255,0.3)] transition-all disabled:cursor-not-allowed disabled:opacity-30 disabled:grayscale',
      'settings-room-mode-host-active':
        'flex min-h-22 w-full cursor-pointer flex-col items-start justify-center gap-1 rounded-xl border border-primary/60 bg-primary/10 px-4 py-3 text-left text-theme shadow-[0_0_14px_rgba(255,46,151,0.3)] transition-all disabled:cursor-not-allowed disabled:opacity-30 disabled:grayscale',
      'settings-room-mode-inactive':
        'flex min-h-22 w-full cursor-pointer flex-col items-start justify-center gap-1 rounded-xl border border-theme bg-theme-surface px-4 py-3 text-left text-theme-muted transition-all hover:border-theme-strong disabled:cursor-not-allowed disabled:opacity-30 disabled:grayscale',
      'settings-admin-go':
        'cursor-pointer rounded-xl bg-primary/80 px-4 py-2 text-white text-xs transition-all hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50',
      'error-retry':
        'cursor-pointer rounded-xl border border-theme bg-theme-surface px-6 py-3 text-theme text-xs transition-all hover:border-theme-strong',
      'error-create':
        'cursor-pointer rounded-xl border border-primary/60 bg-primary/80 px-6 py-3 text-white text-xs shadow-[0_0_18px_rgba(255,46,151,0.4)] transition-all hover:bg-primary',
      'player-primary':
        'group flex h-12 w-12 cursor-pointer items-center justify-center rounded-2xl border border-primary/60 bg-primary text-white shadow-[0_0_24px_rgba(255,46,151,0.45)] transition-all hover:shadow-[0_0_30px_rgba(255,46,151,0.6)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40',
      'player-control':
        'panel-surface group flex h-12 w-12 cursor-pointer items-center justify-center rounded-2xl border border-theme transition-all hover:shadow-[0_0_18px_rgba(255,46,151,0.25)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40',
      'player-control-active':
        'panel-surface group flex h-12 w-12 cursor-pointer items-center justify-center rounded-2xl border border-primary/40 bg-primary/10 transition-all hover:shadow-[0_0_18px_rgba(255,46,151,0.25)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40',
      'player-spotify':
        'panel-surface group ml-auto flex h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-theme px-4 text-[#1DB954] transition-all hover:border-[#1DB954]/30 hover:bg-[#1DB954]/10 hover:shadow-[0_0_18px_rgba(255,46,151,0.25)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40',
      'player-add-song':
        'panel-surface group ml-auto flex h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-theme px-6 text-primary transition-all hover:border-primary/30 hover:shadow-[0_0_18px_rgba(255,46,151,0.25)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40',
      'video-overlay':
        'absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-sm',
      'auth-primary':
        'w-full rounded-2xl bg-primary px-8 py-4 font-black text-lg text-white shadow-[0_4px_0_0_#9d124b] transition-all hover:-translate-y-1 hover:brightness-110 active:translate-y-0 active:shadow-none',
      'debug-clear':
        'border border-[#666] bg-transparent px-2 py-0.5 text-white',
      'queue-remove':
        'absolute top-1/2 right-6 -translate-y-1/2 cursor-pointer rounded-lg border border-transparent bg-transparent p-2.5 text-theme-subtle transition-all hover:border-error/40 hover:bg-error/10 hover:text-error',
    };

    const classes = `${baseClasses} ${variantClasses[variant]}`;

    return (
      <button
        type={type}
        ref={ref}
        disabled={disabled || loading}
        className={classes}
        {...props}
      >
        {loading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          children || title
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';
