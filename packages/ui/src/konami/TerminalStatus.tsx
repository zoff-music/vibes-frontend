import { classNames } from '@vibes/shared';
import type { ReactNode } from 'react';

interface TerminalStatusGridProps {
  children: ReactNode;
  className?: string;
}

export function TerminalStatusGrid({
  children,
  className,
}: TerminalStatusGridProps) {
  return (
    <div
      className={classNames(
        'grid gap-2 font-mono text-[0.62rem] uppercase tracking-[0.08em] sm:grid-cols-3',
        className,
      )}
    >
      {children}
    </div>
  );
}

interface TerminalStatusProps {
  label: ReactNode;
  value: ReactNode;
}

export function TerminalStatus({ label, value }: TerminalStatusProps) {
  return (
    <div className="border border-[#71f5ad]/20 bg-black/15 p-2.5">
      <p className="text-[#71f5ad]/50">{label}</p>
      <p className="mt-1 truncate text-[#dffff0]">{value}</p>
    </div>
  );
}
