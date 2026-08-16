import { classNames } from '@vibes/shared';
import type { ReactNode } from 'react';

interface TerminalShellProps {
  children: ReactNode;
  className?: string;
  channel?: string;
  footer?: ReactNode;
  title: string;
}

export function TerminalShell({
  children,
  className,
  channel = 'SIGNAL TERMINAL',
  footer,
  title,
}: TerminalShellProps) {
  return (
    <main className="terminal-screen relative z-10 min-h-dvh overflow-x-hidden bg-[#010705] px-3 py-4 font-mono text-[#8cffc5] sm:px-6 sm:py-8 lg:grid lg:place-items-center lg:px-10">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_50%_20%,rgba(48,255,153,0.07),transparent_62%)] shadow-[inset_0_0_18vw_#000]" />
      <div className="pointer-events-none fixed inset-0 z-20 bg-[repeating-linear-gradient(to_bottom,transparent_0_3px,rgba(130,255,191,0.045)_3px_4px)]" />
      <section
        className={classNames(
          'relative z-10 flex min-h-[calc(100dvh-2rem)] w-full max-w-6xl flex-col border border-[#55ffad] bg-[rgba(1,12,8,0.97)] shadow-[inset_0_0_5rem_rgba(49,255,154,0.045),0_0_3rem_rgba(49,255,154,0.14)] sm:min-h-[calc(100dvh-4rem)] lg:min-h-0',
          className,
        )}
      >
        <header className="flex min-h-11 items-center justify-between gap-4 bg-[#71f5ad] px-4 py-2 font-bold text-[#03150d] text-xs uppercase tracking-[0.04em] sm:px-5 sm:text-sm">
          <span className="truncate">ZOFF BIOS v19.89</span>
          <span className="truncate text-right">[ {channel} ]</span>
        </header>
        <div className="border-[#71f5ad]/35 border-b px-4 py-2 text-[#a6ffd0]/70 text-[0.62rem] uppercase tracking-[0.16em] sm:px-5">
          CH 1989 / {title} / LINK SECURE
        </div>
        <div className="relative flex min-h-0 flex-1 flex-col p-4 sm:p-6">
          {children}
        </div>
        <footer className="flex min-h-9 items-center justify-between gap-4 border-[#71f5ad]/35 border-t px-4 py-2 text-[#a6ffd0]/65 text-[0.58rem] uppercase tracking-[0.12em] sm:px-5">
          {footer ?? (
            <>
              <span>SIGNAL LOCKED</span>
              <span>音楽は共有するもの</span>
            </>
          )}
        </footer>
      </section>
    </main>
  );
}
