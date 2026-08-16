import { classNames } from '@vibes/shared';
import { type ButtonHTMLAttributes, forwardRef } from 'react';

export type TerminalButtonVariant =
  | 'default'
  | 'danger'
  | 'ghost'
  | 'header'
  | 'primary';

interface TerminalButtonStyleOptions {
  className?: string;
  variant?: TerminalButtonVariant;
}

export function terminalButtonClassName({
  className,
  variant = 'default',
}: TerminalButtonStyleOptions = {}) {
  return classNames(
    'inline-flex cursor-pointer items-center border px-3 py-2 text-left font-mono text-xs uppercase tracking-[0.08em] transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-35',
    variant === 'default' &&
      'border-[#71f5ad]/55 bg-[#071b12] text-[#b9ffda] hover:border-[#a6ffd0] hover:bg-[#0d2a1c] focus-visible:ring-[#71f5ad]',
    variant === 'danger' &&
      'border-[#ff8e8e]/45 bg-[#1b0707] text-[#ffb3b3] hover:border-[#ff8e8e] hover:bg-[#2a0d0d] focus-visible:ring-[#ff8e8e]',
    variant === 'ghost' &&
      'border-transparent bg-transparent text-[#b9ffda] hover:border-[#71f5ad]/45 hover:text-white focus-visible:ring-[#71f5ad]',
    variant === 'header' &&
      'border-[#03150d]/45 bg-transparent text-[#03150d] hover:bg-[#03150d] hover:text-[#71f5ad] focus-visible:ring-[#03150d]',
    variant === 'primary' &&
      'justify-center border-[#71f5ad] bg-[#71f5ad] font-bold text-[#03150d] hover:bg-[#a6ffd0] focus-visible:ring-[#a6ffd0]',
    className,
  );
}

interface TerminalButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  variant?: TerminalButtonVariant;
}

export const TerminalButton = forwardRef<
  HTMLButtonElement,
  TerminalButtonProps
>(function TerminalButton(
  { children, className, type = 'button', variant = 'default', ...props },
  ref,
) {
  return (
    <button
      className={terminalButtonClassName({ className, variant })}
      ref={ref}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
});
