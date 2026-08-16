import { classNames } from '@vibes/shared';
import type { ReactNode } from 'react';

interface TerminalFieldProps {
  children: ReactNode;
  className?: string;
  error?: ReactNode;
  htmlFor: string;
  label: ReactNode;
}

export function TerminalField({
  children,
  className,
  error,
  htmlFor,
  label,
}: TerminalFieldProps) {
  return (
    <div className={className}>
      <label
        className="mb-2 block font-mono text-[#71f5ad]/65 text-[0.6rem] uppercase tracking-[0.16em]"
        htmlFor={htmlFor}
      >
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-2 font-mono text-[#ff8e8e] text-xs" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

interface TerminalInputGroupProps {
  children: ReactNode;
  className?: string;
  prefix?: ReactNode;
}

export function TerminalInputGroup({
  children,
  className,
  prefix,
}: TerminalInputGroupProps) {
  return (
    <div className={classNames('flex items-stretch gap-2', className)}>
      {prefix && (
        <span className="flex items-center border border-[#71f5ad]/35 bg-black/40 px-3 font-mono text-[#71f5ad]">
          {prefix}
        </span>
      )}
      {children}
    </div>
  );
}
