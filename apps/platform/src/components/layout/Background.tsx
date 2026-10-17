import {
  useURLLocation as useLocation,
  useMatches,
} from '@kasperrt/smolter/preact';
import { classNames, usePageVisibility } from '@vibes/shared';
import { useThemeStore } from '@vibes/shared/themeStore';
import { SiteBackground } from '@vibes/ui/web';
import { useInView } from 'framer-motion';
import { useRef } from 'preact/compat';
import { RetroSun } from './RetroSun';

export function Background() {
  const location = useLocation();
  const matches = useMatches();
  const isWarping = useThemeStore((state) => state.isWarping);
  const isTabVisible = usePageVisibility();
  const sunRef = useRef<HTMLDivElement>(null);
  const sunVisible = useInView(sunRef);
  const isHome = matches.some((match) => homeRouteIds.has(match.id));
  const showGrid = matches.some(
    (match) =>
      gridRouteIds.has(match.id) || match.id.startsWith('routes/discovery.'),
  );

  // The home hero positions its own sun behind the card.
  const showSun = location.pathname === '/rooms/create';

  return (
    <>
      <SiteBackground
        variant={isHome ? 'landing' : 'page'}
        showGrid={showGrid}
        isWarping={isWarping}
      />
      {showSun && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[44rem] overflow-hidden"
        >
          <div
            ref={sunRef}
            className={classNames(
              'absolute left-1/2 w-[clamp(18rem,34vw,26rem)] -translate-x-1/2',
              isHome && 'top-[clamp(3rem,8svh,6rem)]',
              !isHome && '-top-12 opacity-60',
            )}
          >
            <RetroSun paused={!isTabVisible || !sunVisible} />
          </div>
        </div>
      )}
    </>
  );
}

const gridRouteIds = new Set([
  'routes/_index/route',
  'routes/features.$experience/route',
  'routes/discovery.$topic/route',
  'routes/rooms.explore/route',
  'routes/$/route',
  'routes/rooms.create/route',
  'routes/security/route',
  'routes/privacy-policy/route',
  'routes/terms-of-service/route',
]);

const homeRouteIds = new Set([
  'routes/_index/route',
  'routes/features.$experience/route',
]);
