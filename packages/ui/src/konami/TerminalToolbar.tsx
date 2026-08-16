import { classNames } from '@vibes/shared';
import type { ReactNode } from 'react';

interface TerminalToolbarProps {
  actions?: ReactNode;
  className?: string;
  description?: ReactNode;
  leading?: ReactNode;
  title: ReactNode;
}

export function TerminalToolbar({
  actions,
  className,
  description,
  leading,
  title,
}: TerminalToolbarProps) {
  return (
    <section
      className={classNames(
        'flex flex-wrap items-center gap-2 border border-[#71f5ad]/30 bg-[#020e09] p-2',
        className,
      )}
    >
      {leading && <div className="flex shrink-0">{leading}</div>}
      <div className="min-w-0 flex-1 px-2 py-1">
        <p className="truncate font-mono text-[#dffff0] text-sm uppercase">
          {title}
        </p>
        {description && (
          <p className="mt-1 font-mono text-[#71f5ad]/55 text-[0.58rem] uppercase tracking-[0.12em]">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </section>
  );
}
