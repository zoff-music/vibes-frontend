import { classNames } from '@vibes/shared';
import { PauseIcon, PlayIcon } from '@vibes/ui/web';
import { useReducedMotion } from 'framer-motion';
import { type ReactNode, type Ref, useEffect, useState } from 'preact/compat';

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
      className="music-demo focus-visible:ring-secondary dark:[&_.text-primary]:text-primary dark:[&_.text-secondary]:text-secondary relative isolate flex min-w-0 flex-col focus-visible:ring-2 focus-visible:outline-none [&_.text-primary]:text-pink-800 [&_.text-secondary]:text-cyan-800"
    >
      <div
        data-demo-content
        className={classNames(
          'relative min-h-0 min-w-0 flex-1 rounded-3xl',
          // Only framed demos clip; a stage lets device shadows fall naturally.
          presentation === 'window' &&
            'overflow-hidden border border-theme bg-theme shadow-lg',
          className,
        )}
      >
        {children}
      </div>
      <figcaption className="text-theme-muted mt-3 flex min-h-11 shrink-0 items-center justify-between gap-3 px-1 text-sm">
        <span className="min-w-0">
          {caption}
          <span className="sr-only"> {detail}</span>
        </span>
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
          className="hover:bg-theme-surface hover:text-theme focus-visible:ring-secondary flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-default disabled:opacity-50"
        >
          {animationPaused && (
            <PlayIcon aria-hidden="true" className="size-3.5" />
          )}
          {!animationPaused && (
            <PauseIcon aria-hidden="true" className="size-3.5" />
          )}
        </button>
      </figcaption>
    </figure>
  );
}
