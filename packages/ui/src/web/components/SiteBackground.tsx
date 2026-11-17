import { classNames, usePageVisibility } from '@vibes/shared';
import { useEffect, useState } from 'preact/compat';

interface SiteBackgroundProps {
  variant?: 'page' | 'landing';
  showGrid?: boolean;
  isWarping?: boolean;
  animated?: boolean;
  active?: boolean;
}

export function SiteBackground({
  variant = 'page',
  showGrid = false,
  isWarping = false,
  animated = variant === 'landing',
  active = true,
}: SiteBackgroundProps) {
  const visible = usePageVisibility();
  const immersive = variant === 'landing';
  const [motionReady, setMotionReady] = useState(false);

  // Keep the SSR background visible without promoting animated layers before paint.
  useEffect(() => {
    setMotionReady(true);
  }, []);

  return (
    <div
      aria-hidden="true"
      className={classNames(
        'pointer-events-none fixed inset-0 z-0 overflow-hidden transition-opacity duration-700 [view-transition-name:site-background] motion-reduce:transition-none',
        active ? 'opacity-100' : 'opacity-0',
      )}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={classNames(
            'theme-page-gradient absolute',
            animated && 'site-gradient-immersive',
            animated &&
              motionReady &&
              'motion-safe:animate-background-drift motion-safe:will-change-transform',
            !animated && 'inset-0',
            (!visible || !active) &&
              'motion-safe:[animation-play-state:paused]',
          )}
        />
      </div>
      <div className="theme-page-glow absolute inset-0 opacity-65" />
      <div
        className={classNames(
          'site-scanlines absolute inset-0 hidden transition-opacity duration-500 md:block motion-reduce:transition-none',
          immersive ? 'opacity-25' : 'opacity-0',
        )}
      />
      <div
        className={classNames(
          'site-grid-plane backface-hidden absolute bottom-0 left-1/2 h-screen origin-bottom overflow-hidden transition-opacity duration-500',
          !showGrid && 'opacity-0',
          showGrid && (isWarping ? 'opacity-100' : 'opacity-80'),
        )}
      >
        <div
          className={classNames(
            'site-grid-lines absolute right-0 left-0',
            motionReady &&
              'motion-safe:animate-background-grid motion-safe:will-change-transform',
            isWarping && '[animation-duration:80ms]',
            (!visible || !active) &&
              'motion-safe:[animation-play-state:paused]',
          )}
        />
      </div>
    </div>
  );
}
