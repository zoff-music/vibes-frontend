import { Link, type LinkProps } from '@kasperrt/smolter/preact';
import { forwardRef } from 'preact/compat';
import type {
  ButtonContentAlignment,
  ButtonShape,
  ButtonSize,
  ButtonVariant,
} from './Button';
import { buttonClassName } from './buttonStyles';

export interface LinkButtonProps
  extends Omit<LinkProps, 'className' | 'style'> {
  to: NonNullable<LinkProps['to']>;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  contentAlignment?: ButtonContentAlignment;
}

export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  ({ variant, size, shape, contentAlignment, className, ...props }, ref) => {
    return (
      <Link
        {...props}
        ref={ref}
        className={buttonClassName({
          variant,
          size,
          shape,
          contentAlignment,
          className,
        })}
      />
    );
  },
);
