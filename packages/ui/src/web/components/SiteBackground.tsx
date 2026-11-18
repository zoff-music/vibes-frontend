import { classNames, usePageVisibility } from '@vibes/shared';
import { useEffect, useState } from 'preact/compat';

interface SiteBackgroundProps {
  variant?: 'page' | 'landing';
  showGrid?: boolean;
  isWarping?: boolean;
  ambient?: boolean;
}

export function SiteBackground({
  variant = 'page',
  showGrid = false,
  isWarping = false,
  ambient = false,
}: SiteBackgroundProps) {
  const visible = usePageVisibility();
  const immersive = variant === 'landing';
  const [motionReady, setMotionReady] = useState(false);
  const drifting = motionReady && (ambient || immersive);

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
            (immersive || ambient) && 'site-gradient-immersive',
            immersive &&
              !ambient &&
              drifting &&
              'md:motion-safe:animate-background-drift md:motion-safe:will-change-transform',
            ambient &&
              drifting &&
              'motion-safe:animate-background-drift motion-safe:will-change-transform',
            !immersive && !ambient && 'inset-0',
            !visible && 'animation-paused',
          )}
        />
      </div>
      <div className="theme-page-glow absolute inset-0 opacity-65" />
      {ambient && (
        <>
          <div
            className={classNames(
              'absolute -top-1/4 -left-1/4 size-[70vmax] rounded-full bg-[radial-gradient(circle,rgba(255,110,190,0.45),transparent_62%)] dark:bg-[radial-gradient(circle,rgba(255,46,151,0.3),transparent_62%)]',
              drifting &&
                'motion-safe:animate-aurora-a motion-safe:will-change-transform',
              !visible && 'animation-paused',
            )}
          />
          <div
            className={classNames(
              'absolute -right-1/4 -bottom-1/4 size-[65vmax] rounded-full bg-[radial-gradient(circle,rgba(110,200,255,0.42),transparent_62%)] dark:bg-[radial-gradient(circle,rgba(0,217,255,0.2),transparent_62%)]',
              drifting &&
                'motion-safe:animate-aurora-b motion-safe:will-change-transform',
              !visible && 'animation-paused',
            )}
          />
        </>
      )}
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
