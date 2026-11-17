import { classNames, usePageVisibility } from '@vibes/shared';
import { useEffect, useState } from 'preact/compat';

interface SiteBackgroundProps {
  variant?: 'page' | 'landing';
  showGrid?: boolean;
  isWarping?: boolean;
}

export function SiteBackground({
  variant = 'page',
  showGrid = false,
  isWarping = false,
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
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={classNames(
            'theme-page-gradient absolute',
            immersive && 'site-gradient-immersive',
            immersive &&
              motionReady &&
              'md:motion-safe:animate-background-drift md:motion-safe:will-change-transform',
            !immersive && 'inset-0',
            !visible && 'animation-paused',
          )}
        />
      </div>
      <div className="theme-page-glow absolute inset-0 opacity-65" />
      {immersive && (
        <div className="site-scanlines absolute inset-0 hidden opacity-25 md:block" />
      )}
      {showGrid && (
        <div
          className={classNames(
            'site-grid-plane backface-hidden absolute bottom-0 left-1/2 h-screen origin-bottom overflow-hidden transition-opacity duration-500',
            isWarping ? 'opacity-100' : 'opacity-80',
          )}
        >
          <div
            className={classNames(
              'site-grid-lines absolute right-0 left-0',
              motionReady &&
                'motion-safe:animate-background-grid motion-safe:will-change-transform',
              isWarping && '[animation-duration:80ms]',
              !visible && 'animation-paused',
            )}
          />
        </div>
      )}
    </div>
  );
}
