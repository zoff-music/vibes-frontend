import React from 'react';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'tertiary-active'
  | 'ghost'
  | 'destructive'
  | 'red'
  | 'green'
  | 'orange'
  | 'cyan'
  | 'magenta';

export type ButtonSize = 'none' | 'small' | 'medium' | 'large' | 'icon';

interface Props
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  title?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, Props>(
  (
    {
      title,
      children,
      variant = 'primary',
      size = 'medium',
      loading = false,
      disabled = false,
      type = 'button',
      className = '',
      ...props
    },
    ref,
  ) => {
    const baseClasses =
      'inline-flex cursor-pointer items-center justify-center font-normal transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-theme disabled:cursor-not-allowed disabled:opacity-50';

    const variantClasses: Record<ButtonVariant, string> = {
      primary:
        'bg-primary text-text-inverse hover:bg-primary-muted active:scale-[0.98]',
      secondary:
        'bg-secondary text-text-inverse hover:opacity-90 active:scale-[0.98]',
      tertiary:
        'border border-theme bg-theme-surface text-theme hover:border-theme-strong',
      'tertiary-active':
        'border border-theme-strong bg-theme-surface-strong text-theme shadow-[0_0_14px_rgba(255,255,255,0.08)]',
      ghost: 'bg-transparent text-theme-muted hover:text-theme',
      destructive:
        'border border-error/40 bg-transparent text-error hover:bg-error/10',
      red: 'border border-red-400 bg-[#ff0000] text-white shadow-[0_0_16px_rgba(255,0,0,0.35)] hover:bg-red-500',
      green:
        'border border-green-300 bg-[#1ed760] text-[#07150b] shadow-[0_0_16px_rgba(30,215,96,0.3)] hover:bg-green-400',
      orange:
        'border border-orange-300 bg-[#ff5500] text-[#1c0900] shadow-[0_0_16px_rgba(255,85,0,0.3)] hover:bg-orange-400',
      cyan: 'border border-cyan-200 bg-[#00d9ff] text-[#04151a] shadow-[0_0_16px_rgba(0,217,255,0.3)] hover:bg-cyan-300',
      magenta:
        'border border-fuchsia-400 bg-fuchsia-700 text-white shadow-lg shadow-fuchsia-500/30 hover:bg-fuchsia-600',
    };

    const sizeClasses: Record<ButtonSize, string> = {
      none: '',
      small: 'rounded-lg px-3 py-1.5 text-xs',
      medium: 'rounded-xl px-5 py-2.5 text-base',
      large: 'rounded-2xl px-6 py-4 text-sm',
      icon: 'rounded-xl p-2.5',
    };

    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
    const ariaLabel = props['aria-label'] || title;

    return (
      <button
        type={type}
        ref={ref}
        title={title}
        aria-label={ariaLabel}
        disabled={disabled || loading}
        className={classes}
        {...props}
      >
        {loading && (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {!loading && (children || title)}
      </button>
    );
  },
);

Button.displayName = 'Button';
