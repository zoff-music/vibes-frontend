import {
  useURLLocation as useLocation,
  useRouter,
} from '@kasperrt/smolter/preact';
import { classNames, usePageVisibility } from '@vibes/shared';
import { useThemeStore } from '@vibes/shared/themeStore';
import { SiteBackground } from '@vibes/ui/web';
import { useInView } from 'framer-motion';
import { useRef, useSyncExternalStore } from 'preact/compat';
import { RetroSun } from './RetroSun';

export function Background() {
  const location = useLocation();
  const router = useRouter();
  const { path = '' } = useSyncExternalStore(
    router.subscribe,
    router.getSnapshot,
    router.getSnapshot,
  );
  const isWarping = useThemeStore((state) => state.isWarping);
  const isTabVisible = usePageVisibility();
  const sunRef = useRef<HTMLDivElement>(null);
  const sunVisible = useInView(sunRef);
  const isHome = homePaths.has(path);
  const showGrid = gridPaths.has(path) || path.startsWith('/discovery/');

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

const gridPaths = new Set([
  '/',
  '/features/:experience',
  '/rooms/explore',
  '/*',
  '/rooms/create',
  '/security',
  '/privacy-policy',
  '/terms-of-service',
]);

const homePaths = new Set(['/', '/features/:experience']);
