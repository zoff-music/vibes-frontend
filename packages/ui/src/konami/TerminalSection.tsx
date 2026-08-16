import { classNames } from '@vibes/shared';
import type { ReactNode } from 'react';

interface TerminalSectionProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  label: ReactNode;
  status?: ReactNode;
}

export function TerminalSection({
  children,
  className,
  contentClassName,
  label,
  status,
}: TerminalSectionProps) {
  return (
    <section
      className={classNames(
        'border border-[#71f5ad]/30 bg-[#020e09]/80',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 border-[#71f5ad]/30 border-b bg-[#071b12] px-3 py-2 font-mono text-[#a6ffd0] text-[0.65rem] uppercase tracking-[0.14em]">
        <span>{label}</span>
        {status && <span className="text-[#71f5ad]/65">[{status}]</span>}
      </div>
      <div className={classNames('p-3 sm:p-4', contentClassName)}>
        {children}
      </div>
    </section>
  );
}
