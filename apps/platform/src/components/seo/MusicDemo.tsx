import { classNames } from '@vibes/shared';
import { PauseIcon, PlayIcon } from '@vibes/ui/web';
import { useReducedMotion } from 'framer-motion';
import { type ReactNode, type Ref, useEffect, useState } from 'react';

interface MusicDemoProps {
  children: ReactNode;
  label: string;
  detail: string;
  caption: string;
  paused: boolean;
  onToggle: () => void;
  elementRef?: Ref<HTMLElement>;
  className?: string;
  presentation?: 'window' | 'stage';
}

export function MusicDemo({
  children,
  label,
  detail,
  caption,
  paused,
  onToggle,
  elementRef,
  className,
  presentation = 'window',
}: MusicDemoProps) {
  const reducedMotion = useReducedMotion();
  const [hydrated, setHydrated] = useState(false);
  const motionDisabled = hydrated && reducedMotion === true;
  const animationPaused = hydrated && (paused || motionDisabled);

  useEffect(() => setHydrated(true), []);

  return (
    <figure
      ref={elementRef}
      tabIndex={-1}
      aria-label={label}
      className={classNames(
        'music-demo relative isolate flex min-w-0 flex-col overflow-hidden rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary [&_.text-primary]:text-pink-800 dark:[&_.text-primary]:text-primary [&_.text-secondary]:text-cyan-800 dark:[&_.text-secondary]:text-secondary',
        presentation === 'window' && 'border border-theme bg-theme shadow-lg',
        className,
      )}
    >
      <div
        className={classNames(
          'relative flex h-16 shrink-0 items-center justify-between gap-3 px-4 sm:px-6',
          presentation === 'window' && 'border-theme border-b',
        )}
      >
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-pixel text-sm text-theme">
            <span
              aria-hidden="true"
              className="size-1.5 shrink-0 rounded-full bg-secondary"
            />
            {label}
          </p>
          <p className="mt-0.5 text-theme-muted text-xs">{detail}</p>
        </div>
        <button
          type="button"
          onClick={onToggle}
          disabled={motionDisabled}
          title={
            motionDisabled
              ? 'Animations follow your reduced-motion preference'
              : 'Pause or resume this preview'
          }
          aria-label={
            motionDisabled
              ? 'Animation disabled by reduced-motion preference'
              : animationPaused
                ? `Play ${label} animation`
                : `Pause ${label} animation`
          }
          aria-pressed={animationPaused}
          className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-theme-muted transition-colors hover:bg-theme-surface hover:text-theme focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
        >
          {animationPaused && (
            <PlayIcon aria-hidden="true" className="size-3.5" />
          )}
          {!animationPaused && (
            <PauseIcon aria-hidden="true" className="size-3.5" />
          )}
        </button>
      </div>
      <div data-demo-content className="relative min-h-0 flex-1">
        {children}
      </div>
      <figcaption
        className={classNames(
          'relative flex h-16 shrink-0 items-center px-4 py-3 text-sm text-theme-muted sm:px-6',
          presentation === 'window' && 'border-theme border-t',
        )}
      >
        {caption}
      </figcaption>
    </figure>
  );
}
