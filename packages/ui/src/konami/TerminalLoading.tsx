import { classNames } from '@vibes/shared';

interface TerminalLoadingProps {
  className?: string;
  label: string;
  overlay?: boolean;
}

export function TerminalLoading({
  className,
  label,
  overlay = false,
}: TerminalLoadingProps) {
  return (
    <output
      aria-live="polite"
      className={classNames(
        'flex items-center justify-center bg-[#020e09] font-mono text-[#71f5ad] text-xs uppercase tracking-[0.12em]',
        overlay && 'fixed inset-0 z-50 bg-[#010705]/95 p-4 backdrop-blur-sm',
        !overlay && 'min-h-24 border border-[#71f5ad]/30 px-4 py-5',
        className,
      )}
    >
      <span className="flex items-center gap-3 border border-[#71f5ad]/30 bg-black/30 px-4 py-3">
        <span aria-hidden className="flex items-end gap-0.5">
          <span className="h-2 w-1 animate-pulse bg-[#71f5ad]/35" />
          <span className="h-3 w-1 animate-pulse bg-[#71f5ad]/65" />
          <span className="h-4 w-1 animate-pulse bg-[#71f5ad]" />
          <span className="h-3 w-1 animate-pulse bg-[#71f5ad]/65" />
          <span className="h-2 w-1 animate-pulse bg-[#71f5ad]/35" />
        </span>
        <span>
          {label}
          <span className="terminal-cursor">_</span>
        </span>
      </span>
    </output>
  );
}
