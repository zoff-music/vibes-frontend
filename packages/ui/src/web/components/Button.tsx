import React from 'preact/compat';
import { buttonClassName } from './buttonStyles';

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

export type ButtonContentAlignment = 'center' | 'between';

interface Props
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  title?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  contentAlignment?: ButtonContentAlignment;
}

export const Button = React.forwardRef<HTMLButtonElement, Props>(
  (
    {
      title,
      children,
      variant = 'primary',
      size = 'medium',
      loading = false,
      contentAlignment = 'center',
      disabled = false,
      type = 'button',
      className = '',
      ...props
    },
    ref,
  ) => {
    const classes = buttonClassName({
      variant,
      size,
      contentAlignment,
      className: String(className ?? ''),
    });
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
