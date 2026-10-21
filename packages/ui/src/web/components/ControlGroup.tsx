import { classNames } from '@vibes/shared';
import type { JSX } from 'preact';
import { forwardRef } from 'preact/compat';

interface ControlGroupProps
  extends Omit<JSX.IntrinsicElements['fieldset'], 'style' | 'ref'> {
  'aria-label': string;
}

export const ControlGroup = forwardRef<HTMLFieldSetElement, ControlGroupProps>(
  ({ className, children, ...props }, ref) => (
    <fieldset
      {...props}
      ref={ref}
      className={classNames(
        'flex min-w-0 items-center gap-1 rounded-full border border-theme bg-theme-surface p-1',
        String(className ?? ''),
      )}
    >
      {children}
    </fieldset>
  ),
);

ControlGroup.displayName = 'ControlGroup';
