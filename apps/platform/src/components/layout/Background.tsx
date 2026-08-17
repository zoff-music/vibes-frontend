import { classNames, usePageVisibility } from '@vibes/shared';
import { useLocation } from 'react-router';
import { useThemeStore } from '../../stores/themeStore';

export function Background() {
  const location = useLocation();
  const isWarping = useThemeStore((state) => state.isWarping);
  const isTabVisible = usePageVisibility();
  const isHome = location.pathname === '/';

  // Only show the sun on Home and CreateRoom pages
  const showSun = isHome || location.pathname === '/rooms/create';

  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={classNames(
            'theme-page-gradient absolute',
            isHome &&
              'platform-background-gradient-motion -inset-[12%] [background-size:140%_140%]',
            !isHome && 'inset-0',
            !isTabVisible && '[animation-play-state:paused]',
          )}
        />
      </div>
      <div className="theme-page-glow absolute inset-0 opacity-65" />
      {isHome && (
        <div className="absolute inset-0 hidden bg-[repeating-linear-gradient(to_bottom,rgba(255,255,255,0.05),rgba(255,255,255,0.05)_1px,transparent_1px,transparent_3px)] opacity-25 md:block" />
      )}

      {showSun && (
        <div
          className={classNames(
            "absolute left-1/2 h-[clamp(14rem,30vw,18rem)] w-[clamp(14rem,30vw,18rem)] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_50%_35%,rgba(255,208,120,0.95),rgba(255,148,188,0.85)_50%,rgba(255,80,200,0.3)_75%,transparent_85%)] [filter:drop-shadow(0_0_50px_rgba(255,120,160,0.7))] [mask-image:linear-gradient(to_bottom,black_65%,transparent_100%)] after:absolute after:inset-[58%_0%_auto_0%] after:h-[28%] after:bg-[linear-gradient(rgba(15,5,30,0.9),rgba(15,5,30,0.9)),linear-gradient(rgba(15,5,30,0.8),rgba(15,5,30,0.8)),linear-gradient(rgba(15,5,30,0.7),rgba(15,5,30,0.7)),linear-gradient(rgba(15,5,30,0.6),rgba(15,5,30,0.6))] after:bg-no-repeat after:opacity-65 after:content-[''] dark:bg-[radial-gradient(circle_at_50%_35%,rgba(255,46,151,0.8),rgba(180,30,100,0.7)_50%,rgba(100,20,60,0.4)_75%,transparent_85%)] after:[background-position:center_15px,center_32px,center_52px,center_75px] after:[background-size:95%_4px,90%_4.5px,82%_5px,70%_6px]",
            isHome && 'top-[max(0rem,calc(50vh-20.375rem))]',
            !isHome && 'top-[clamp(2rem,6vh,4rem)]',
          )}
        />
      )}

      {isHome && (
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
              !isTabVisible && '[animation-play-state:paused]',
            )}
          />
        </div>
      )}
    </div>
  );
}
