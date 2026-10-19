import { Link, type LinkProps } from '@kasperrt/smolter/preact';
import { forwardRef } from 'preact/compat';
import type {
  ButtonContentAlignment,
  ButtonSize,
  ButtonVariant,
} from './Button';
import { buttonClassName } from './buttonStyles';

interface Props extends Omit<LinkProps, 'className' | 'style'> {
  to: NonNullable<LinkProps['to']>;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  contentAlignment?: ButtonContentAlignment;
}

export const LinkButton = forwardRef<HTMLAnchorElement, Props>(
  ({ variant, size, contentAlignment, className, ...props }, ref) => {
    return (
      <Link
        {...props}
        ref={ref}
        className={buttonClassName({
          variant,
          size,
          contentAlignment,
          className,
        })}
      />
    );
  },
);
