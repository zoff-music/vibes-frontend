import { classNames } from '@vibes/shared';
import type { ReactNode } from 'react';

interface NotFoundViewProps {
  children?: ReactNode;
}

export function NotFoundView({ children }: NotFoundViewProps) {
  return (
    <main className="relative z-10 flex min-h-[calc(100svh-13rem)] items-center justify-center px-5 py-12 sm:px-6 sm:py-16">
      <section
        className={classNames(
          'mx-auto grid w-full max-w-4xl items-center gap-12',
          Boolean(children) && 'md:grid-cols-2 md:gap-16',
        )}
      >
        <div
          className={classNames(
            'text-center',
            Boolean(children) && 'md:text-left',
          )}
        >
          <p className="font-pixel text-primary text-xs tracking-label">
            TRACK NOT FOUND
          </p>
          <p
            aria-hidden="true"
            className="mt-3 font-pixel text-8xl text-theme leading-none sm:text-9xl"
          >
            4<span className="text-primary">0</span>4
          </p>
          <h1 className="mt-5 font-pixel text-3xl text-theme normal-case sm:text-4xl">
            Wrong track.
          </h1>
          <p className="mt-3 text-theme-muted">We couldn’t find that page.</p>
          <a
            className="mt-7 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-6 py-3 font-pixel text-sm text-text-inverse transition-colors hover:bg-primary-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-theme"
            href="/"
          >
            Back to Zoff
          </a>
          {children && (
            <p className="mt-5 text-theme-subtle text-xs">
              404 BPM? Absolutely not.
            </p>
          )}
        </div>
        {children}
      </section>
    </main>
  );
}
