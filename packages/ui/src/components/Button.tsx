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
      red: 'border border-red-500/40 bg-red-500/20 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)] hover:bg-red-500/30',
      green:
        'border border-green-500/40 bg-green-500/20 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.2)] hover:bg-green-500/30',
      orange:
        'border border-orange-500/40 bg-orange-500/20 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.2)] hover:bg-orange-500/30',
      cyan: 'border border-secondary/60 bg-secondary/10 text-theme shadow-[0_0_14px_rgba(0,217,255,0.3)] hover:bg-secondary/20',
      magenta:
        'border border-primary/60 bg-primary/10 text-theme shadow-[0_0_14px_rgba(255,46,151,0.3)] hover:bg-primary/20',
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
