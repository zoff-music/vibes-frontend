import { forwardRef } from 'preact/compat';
import { Button, type ButtonProps } from './Button';

export interface IconButtonProps
  extends Omit<ButtonProps, 'size' | 'shape' | 'contentAlignment'> {
  'aria-label': string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ variant = 'ghost', ...props }, ref) => (
    <Button {...props} ref={ref} size="icon" shape="pill" variant={variant} />
  ),
);

IconButton.displayName = 'IconButton';
