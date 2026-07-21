import React from 'react';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'ghost'
  | 'destructive';

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
      'inline-flex cursor-pointer items-center justify-center font-normal transition-all disabled:cursor-not-allowed disabled:opacity-50';

    const variantClasses: Record<ButtonVariant, string> = {
      primary:
        'bg-primary text-text-inverse hover:bg-primary-muted active:scale-[0.98]',
      secondary:
        'bg-secondary text-text-inverse hover:opacity-90 active:scale-[0.98]',
      tertiary:
        'border border-theme bg-theme-surface text-theme hover:border-theme-strong',
      ghost: 'bg-transparent text-theme-muted hover:text-theme',
      destructive:
        'border border-error/40 bg-transparent text-error hover:bg-error/10',
    };

    const sizeClasses: Record<ButtonSize, string> = {
      none: '',
      small: 'rounded-lg px-3 py-1.5 text-xs',
      medium: 'rounded-xl px-5 py-2.5 text-base',
      large: 'rounded-2xl px-6 py-4 text-sm',
      icon: 'rounded-xl p-2.5',
    };

    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

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
