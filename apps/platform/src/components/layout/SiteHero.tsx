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
  layout?: 'split' | 'centered';
}

export function SiteHero({
  id,
  title,
  description,
  eyebrow,
  children,
  aside,
  footer,
  layout = 'split',
}: SiteHeroProps) {
  const centered = layout === 'centered';

  return (
    <section
      aria-labelledby={id}
      className="site-hero crt-frame overflow-hidden rounded-frame"
    >
      <div
        className={classNames(
          'grid items-center',
          centered &&
            'gap-6 px-6 pt-10 pb-6 sm:px-8 sm:pt-12 md:justify-items-center lg:px-10',
          !centered && 'gap-7 p-6 sm:gap-8 sm:p-8 lg:gap-12 lg:p-10',
          !centered && Boolean(aside) && 'md:grid-cols-2',
        )}
      >
        <div
          className={classNames(
            'min-w-0',
            centered && 'md:mx-auto md:w-full md:text-center',
          )}
        >
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
          <p
            className={classNames(
              'mt-4 max-w-xl text-base text-theme-muted leading-relaxed sm:text-lg',
              centered && 'md:mx-auto',
            )}
          >
            {description}
          </p>
          {children}
        </div>
        {aside && (
          <div
            className={classNames(
              'min-w-0',
              centered && 'md:mx-auto md:w-full md:max-w-3xl',
              !centered &&
                'border-theme border-t pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-8 lg:pl-12',
            )}
          >
            {aside}
          </div>
        )}
      </div>
      {footer && (
        <div
          className={classNames(
            'flex flex-wrap items-center gap-x-6 gap-y-2 px-6 sm:px-8 lg:px-10',
            centered && 'justify-center pb-10 sm:pb-12',
            !centered && 'justify-between border-theme border-t py-3',
          )}
        >
          {footer}
        </div>
      )}
    </section>
  );
}
