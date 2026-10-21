import { forwardRef } from 'preact/compat';
import { LinkButton, type LinkButtonProps } from './LinkButton';

export interface IconLinkButtonProps
  extends Omit<LinkButtonProps, 'size' | 'shape' | 'contentAlignment'> {
  'aria-label': string;
}

export const IconLinkButton = forwardRef<
  HTMLAnchorElement,
  IconLinkButtonProps
>(({ variant = 'ghost', ...props }, ref) => (
  <LinkButton {...props} ref={ref} size="icon" shape="pill" variant={variant} />
));

IconLinkButton.displayName = 'IconLinkButton';
