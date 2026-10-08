import { classNames, usePageVisibility } from '@vibes/shared';

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

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={classNames(
            'theme-page-gradient absolute',
            immersive &&
              '-inset-[12%] [background-size:140%_140%] md:motion-safe:animate-background-drift md:motion-safe:will-change-transform',
            !immersive && 'inset-0',
            !visible && '[animation-play-state:paused]',
          )}
        />
      </div>
      <div className="theme-page-glow absolute inset-0 opacity-65" />
      {immersive && (
        <div className="absolute inset-0 hidden bg-[repeating-linear-gradient(to_bottom,rgba(255,255,255,0.05),rgba(255,255,255,0.05)_1px,transparent_1px,transparent_3px)] opacity-25 md:block" />
      )}
      {showGrid && (
        <div
          className={classNames(
            'absolute bottom-0 left-1/2 h-[100vh] w-[200%] origin-bottom overflow-hidden transition-opacity duration-500 [backface-visibility:hidden] [mask-image:linear-gradient(to_top,black_30%,transparent_95%)] [transform:translateX(-50%)_perspective(600px)_rotateX(60deg)]',
            isWarping ? 'opacity-100' : 'opacity-80',
          )}
        >
          <div
            className={classNames(
              'absolute -top-20 right-0 left-0 h-[calc(100%+5rem)] bg-[length:80px_80px] bg-[linear-gradient(to_right,rgba(255,105,180,0)_0px,rgba(255,105,180,0.45)_1px,rgba(255,105,180,0)_2px),linear-gradient(to_bottom,rgba(0,217,255,0)_0px,rgba(0,217,255,0.45)_1px,rgba(0,217,255,0)_2px)] motion-safe:animate-background-grid motion-safe:will-change-transform',
              isWarping && '[animation-duration:80ms]',
              !visible && '[animation-play-state:paused]',
            )}
          />
        </div>
      )}
    </div>
  );
}
