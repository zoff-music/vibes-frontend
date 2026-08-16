import { classNames } from '@vibes/shared';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface TerminalListButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style' | 'title'> {
  action?: ReactNode;
  index?: ReactNode;
  metadata?: ReactNode;
  title: ReactNode;
}

export function TerminalListButton({
  action,
  className,
  index,
  metadata,
  title,
  type = 'button',
  ...props
}: TerminalListButtonProps) {
  return (
    <button
      className={classNames(
        'group grid w-full cursor-pointer grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-2 border border-[#71f5ad]/20 bg-black/15 px-2.5 py-2.5 text-left font-mono hover:border-[#71f5ad] hover:bg-[#071b12] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#71f5ad] disabled:cursor-not-allowed disabled:opacity-35',
        className,
      )}
      type={type}
      {...props}
    >
      <span className="text-[#71f5ad]/55 text-xs">{index}</span>
      <span className="min-w-0">
        <span className="block truncate text-[#dffff0] text-xs uppercase">
          {title}
        </span>
        {metadata && (
          <span className="mt-1 block truncate text-[#a6ffd0]/50 text-[0.6rem] uppercase">
            {metadata}
          </span>
        )}
      </span>
      {action && (
        <span className="border border-[#71f5ad]/35 px-2 py-1 text-[#a6ffd0]/70 text-[0.62rem] group-hover:border-[#71f5ad] group-hover:text-white">
          {action}
        </span>
      )}
    </button>
  );
}
