import { classNames } from '@vibes/shared';
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
        'bg-primary text-text-inverse hover:bg-primary-muted active:scale-press',
      secondary:
        'bg-secondary text-text-inverse hover:opacity-90 active:scale-press',
      tertiary:
        'border border-theme bg-theme-surface text-theme hover:border-theme-strong',
      'tertiary-active':
        'border border-secondary/60 bg-secondary/20 text-theme shadow-secondary-soft hover:bg-secondary/30',
      ghost: 'bg-transparent text-theme-muted hover:text-theme',
      destructive:
        'border border-error/40 bg-transparent text-error hover:bg-error/10',
      red: 'border border-red-400 bg-youtube text-white shadow-youtube hover:bg-red-500',
      green:
        'border border-green-300 bg-green-500 text-green-950 shadow-lg shadow-green-500/30 hover:bg-green-400',
      orange:
        'border border-orange-300 bg-soundcloud text-on-soundcloud shadow-soundcloud hover:bg-orange-400',
      cyan: 'border border-cyan-200 bg-secondary text-on-secondary shadow-cyan hover:bg-cyan-300',
      magenta:
        'border border-fuchsia-400 bg-fuchsia-700 text-white shadow-lg shadow-fuchsia-500/30 hover:bg-fuchsia-600',
    };

    const sizeClasses: Record<ButtonSize, string> = {
      none: '',
      small: 'rounded-lg px-3 py-1.5 text-xs',
      medium: 'rounded-xl px-5 py-2.5 text-base',
      large: 'rounded-2xl px-6 py-4 text-sm',
      icon: 'h-11 w-11 shrink-0 rounded-xl p-0',
    };

    const classes = classNames(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      className,
    );
    const ariaLabel = props['aria-label'] || title;

    return (
      <button
        type={type}
        ref={ref}
        {...(title && { title })}
        {...(ariaLabel && { 'aria-label': ariaLabel })}
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
