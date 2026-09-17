import { classNames } from '@vibes/shared';
import type { ReactNode } from 'react';

interface SiteHeroProps {
  id: string;
  title: ReactNode;
  description: ReactNode;
  eyebrow?: string;
  children?: ReactNode;
  aside?: ReactNode;
  footer?: ReactNode;
}

export function SiteHero({
  id,
  title,
  description,
  eyebrow,
  children,
  aside,
  footer,
}: SiteHeroProps) {
  return (
    <section
      aria-labelledby={id}
      className="site-hero crt-frame overflow-hidden rounded-frame"
    >
      <div
        className={classNames(
          'grid items-center gap-7 p-6 sm:gap-8 sm:p-8 lg:gap-12 lg:p-10',
          Boolean(aside) && 'md:grid-cols-2',
        )}
      >
        <div className="min-w-0">
          {eyebrow && (
            <p className="mb-4 font-pixel text-2xs text-primary tracking-label">
              {eyebrow}
            </p>
          )}
          <h1
            id={id}
            className="font-pixel text-4xl text-theme normal-case leading-none tracking-tight sm:text-5xl lg:text-6xl"
          >
            {title}
          </h1>
          <p className="mt-4 max-w-xl text-base text-theme-muted leading-relaxed sm:text-lg">
            {description}
          </p>
          {children}
        </div>
        {aside && (
          <div className="min-w-0 border-theme border-t pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-8 lg:pl-12 [&_.music-scene]:rounded-none [&_.music-scene]:border-0 [&_.music-scene]:bg-transparent [&_.music-scene]:shadow-none [&_.scene-content]:px-0 [&_.scene-content]:pb-0 [&_.scene-header]:px-0 [&_.scene-header]:pt-0">
            {aside}
          </div>
        )}
      </div>
      {footer && (
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-theme border-t px-6 py-3 sm:px-8 lg:px-10">
          {footer}
        </div>
      )}
    </section>
  );
}
