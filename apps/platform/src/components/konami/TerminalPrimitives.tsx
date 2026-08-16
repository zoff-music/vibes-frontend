import { classNames } from '@vibes/shared';
import type { ReactNode } from 'react';

interface TerminalButtonProps {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
}

export function TerminalButton({
  children,
  className,
  disabled = false,
  onClick,
  type = 'button',
}: TerminalButtonProps) {
  return (
    <button
      className={classNames(
        'cursor-pointer border border-[#71f5ad]/55 bg-[#071b12] px-3 py-2 text-left font-mono text-[#b9ffda] text-xs uppercase tracking-[0.08em] transition-colors hover:border-[#a6ffd0] hover:bg-[#0d2a1c] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#71f5ad] disabled:cursor-not-allowed disabled:opacity-35',
        className,
      )}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
}

interface TerminalSectionProps {
  children: ReactNode;
  className?: string;
  label: string;
  status?: string;
}

export function TerminalSection({
  children,
  className,
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
      <div className="flex items-center justify-between gap-3 border-[#71f5ad]/30 border-b bg-[#071b12] px-3 py-2 text-[#a6ffd0] text-[0.65rem] uppercase tracking-[0.14em]">
        <span>{label}</span>
        {status && <span className="text-[#71f5ad]/65">[{status}]</span>}
      </div>
      <div className="p-3 sm:p-4">{children}</div>
    </section>
  );
}
