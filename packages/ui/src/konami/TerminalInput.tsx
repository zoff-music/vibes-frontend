import { classNames } from '@vibes/shared';
import { forwardRef, type InputHTMLAttributes } from 'react';

interface TerminalInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'style'> {
  invalid?: boolean;
}

export const TerminalInput = forwardRef<HTMLInputElement, TerminalInputProps>(
  function TerminalInput({ className, invalid = false, ...props }, ref) {
    return (
      <input
        {...(invalid && { 'aria-invalid': true })}
        className={classNames(
          'min-w-0 flex-1 border border-[#71f5ad]/50 bg-black/40 px-3 py-2.5 font-mono text-[#e0ffef] text-sm placeholder:text-[#71f5ad]/30 focus:border-[#a6ffd0] focus:outline-none focus:ring-1 focus:ring-[#71f5ad] disabled:cursor-not-allowed disabled:opacity-50',
          invalid && 'border-[#ff8e8e]/65 focus:border-[#ff8e8e]',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
