import { classNames } from '@vibes/shared';
import type { HTMLAttributes, ReactNode } from 'react';

interface TerminalFeedbackProps
  extends Omit<HTMLAttributes<HTMLParagraphElement>, 'style'> {
  children: ReactNode;
  className?: string;
  tone?: 'error' | 'muted' | 'success';
}

export function TerminalFeedback({
  children,
  className,
  tone = 'muted',
  ...props
}: TerminalFeedbackProps) {
  return (
    <p
      className={classNames(
        'border p-3 font-mono text-xs uppercase',
        tone === 'error' && 'border-[#ff8e8e]/50 text-[#ff8e8e]',
        tone === 'muted' &&
          'border-[#71f5ad]/25 border-dashed text-[#a6ffd0]/55',
        tone === 'success' && 'border-[#71f5ad]/30 text-[#71f5ad]',
        className,
      )}
      {...(tone === 'error' && { role: 'alert' })}
      {...props}
    >
      {children}
    </p>
  );
}
