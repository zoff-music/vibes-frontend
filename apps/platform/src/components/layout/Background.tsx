import { classNames, usePageVisibility } from '@vibes/shared';
import { useLocation, useMatches } from 'react-router';
import { useThemeStore } from '../../stores/themeStore';
import { RetroSun } from './RetroSun';

export function Background() {
  const location = useLocation();
  const matches = useMatches();
  const isWarping = useThemeStore((state) => state.isWarping);
  const isTabVisible = usePageVisibility();
  const isHome = location.pathname === '/';
  const showGrid = matches.some((match) => gridRouteIds.has(match.id));

  // Only show the sun on Home and CreateRoom pages
  const showSun = isHome || location.pathname === '/rooms/create';

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div
            className={classNames(
              'theme-page-gradient absolute',
              isHome &&
                'platform-background-gradient-motion -inset-[12%] [background-size:140%_140%]',
              !isHome && 'inset-0',
              !isTabVisible && 'platform-background-motion-paused',
            )}
          />
        </div>
        <div className="theme-page-glow absolute inset-0 opacity-65" />
        {isHome && (
          <div className="absolute inset-0 hidden bg-[repeating-linear-gradient(to_bottom,rgba(255,255,255,0.05),rgba(255,255,255,0.05)_1px,transparent_1px,transparent_3px)] opacity-25 md:block" />
        )}

        {showGrid && (
          <div
            className={classNames(
              'absolute bottom-0 left-1/2 h-[100vh] w-[200%] origin-bottom overflow-hidden transition-opacity duration-500 [backface-visibility:hidden] [mask-image:linear-gradient(to_top,black_30%,transparent_95%)] [transform:translateX(-50%)_perspective(600px)_rotateX(60deg)]',
              isWarping && 'opacity-100',
              !isWarping && 'opacity-80',
            )}
          >
            <div
              className={classNames(
                'platform-background-grid-motion absolute -top-20 right-0 left-0 h-[calc(100%+5rem)] bg-[length:80px_80px] bg-[linear-gradient(to_right,rgba(255,105,180,0)_0px,rgba(255,105,180,0.45)_1px,rgba(255,105,180,0)_2px),linear-gradient(to_bottom,rgba(0,217,255,0)_0px,rgba(0,217,255,0.45)_1px,rgba(0,217,255,0)_2px)]',
                isWarping && 'platform-background-grid-warp',
                !isTabVisible && 'platform-background-motion-paused',
              )}
            />
          </div>
        )}
      </div>
      {showSun && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[44rem] overflow-hidden"
        >
          <div
            className={classNames(
              'absolute left-1/2 w-[clamp(18rem,34vw,26rem)] -translate-x-1/2',
              isHome && 'top-[clamp(3rem,8svh,6rem)]',
              !isHome && '-top-12 opacity-60',
            )}
          >
            <RetroSun paused={!isTabVisible} />
          </div>
        </div>
      )}
    </>
  );
}

const gridRouteIds = new Set([
  'routes/_index/route',
  'routes/discover/route',
  'routes/rooms.create/route',
  'routes/security/route',
  'routes/privacy-policy/route',
  'routes/terms-of-service/route',
]);
