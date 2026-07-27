import { classNames } from '@vibes/shared';
import type { ReactNode } from 'react';

type TooltipSide = 'bottom' | 'top';

interface TooltipProps {
  children: ReactNode;
  className: string;
  content: string;
  side?: TooltipSide;
}

export function Tooltip({
  children,
  className,
  content,
  side = 'top',
}: TooltipProps) {
  return (
    <span className={`group/tooltip relative ${className}`}>
      {children}
      <span
        aria-hidden="true"
        className={classNames(
          'pointer-events-none absolute left-1/2 z-100 -translate-x-1/2 whitespace-nowrap rounded-lg border border-theme bg-theme-surface px-2.5 py-1.5 font-pixel text-3xs text-theme opacity-0 shadow-xl transition-opacity group-focus-within/tooltip:opacity-100 group-hover/tooltip:opacity-100',
          tooltipSideClasses[side],
        )}
      >
        {content}
      </span>
    </span>
  );
}

const tooltipSideClasses: Record<TooltipSide, string> = {
  bottom: 'top-full mt-2',
  top: 'bottom-full mb-2',
};
