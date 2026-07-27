import type { ReactNode } from 'react';

interface TooltipProps {
  children: ReactNode;
  className: string;
  content: string;
}

export function Tooltip({ children, className, content }: TooltipProps) {
  return (
    <span className={`group/tooltip relative ${className}`}>
      {children}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-full left-1/2 z-100 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-theme bg-theme-surface px-2.5 py-1.5 font-pixel text-3xs text-theme opacity-0 shadow-xl transition-opacity group-focus-within/tooltip:opacity-100 group-hover/tooltip:opacity-100"
      >
        {content}
      </span>
    </span>
  );
}
