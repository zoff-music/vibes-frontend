import {
  Link,
  useNavigate,
  useNavigation,
  useRevalidator,
} from '@kasperrt/smolter/preact';
import { Button } from '@vibes/ui/web';
import { useCallback, useEffect, useRef } from 'preact/compat';
import { SitePage } from '../../../components/layout/SitePage';
import { type RoomBrowserLoaderData, roomBrowserUrl } from '../utils/search';
import { RoomBrowserFilters } from './RoomBrowserFilters';
import { RoomBrowserPagination } from './RoomBrowserPagination';
import { RoomBrowserResults } from './RoomBrowserResults';

export function RoomBrowser({ result, search }: RoomBrowserLoaderData) {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const revalidator = useRevalidator();
  const resultsRef = useRef<HTMLElement>(null);
  const previousPage = useRef(search.from);
  const pending =
    navigation.location?.pathname === '/rooms/explore' ||
    navigation.state === 'loading';

  const joinRoom = useCallback(
    (roomId: string) => {
      navigate(`/${encodeURIComponent(roomId)}`);
    },
    [navigate],
  );

  useEffect(() => {
    if (previousPage.current !== search.from) {
      const results = resultsRef.current;
      results?.focus({ preventScroll: true });

      if (results && results.getBoundingClientRect().top < 0) {
        results.scrollIntoView({ block: 'start', behavior: 'instant' });
      }
    }

    previousPage.current = search.from;
  }, [search.from]);

  let summary = 'Rooms are temporarily unavailable.';

  if (result) {
    summary = `${result.total} ${result.total === 1 ? 'room' : 'rooms'}`;

    if (result.count > 0 && result.total > result.count) {
      summary = `${result.from + 1}–${result.to + 1} of ${summary}`;
    }
  }

  if (pending) summary = 'Loading rooms…';

  return (
    <SitePage>
      <div className="pt-6 pb-12 sm:pt-8 sm:pb-16">
        <div className="mb-6 sm:mb-8">
          <p className="font-pixel tracking-display dark:text-primary mb-3 text-xs text-pink-700">
            PUBLIC ROOMS
          </p>
          <h1 className="font-pixel text-theme text-3xl leading-tight tracking-normal normal-case sm:text-4xl">
            Find a room.
          </h1>
          <p className="text-theme-muted mt-3 max-w-2xl text-sm leading-relaxed">
            {search.roomType === 'WATCH'
              ? 'Join people watching now, or explore public watch rooms.'
              : 'Join people listening now, or explore public music rooms.'}
          </p>
        </div>

        <RoomBrowserFilters search={search} pending={pending} />

        <section
          ref={resultsRef}
          tabIndex={-1}
          aria-label="Public room results"
          className="scroll-mt-6 pt-6 focus:outline-none"
        >
          <div className="text-theme-muted mb-4 flex flex-wrap items-center justify-between gap-2 text-xs">
            <p role="status" aria-live="polite" aria-atomic="true">
              {summary}
            </p>
            <p>
              {search.roomType === 'WATCH'
                ? 'Most watchers first'
                : 'Most listeners first'}
            </p>
          </div>
          <div aria-busy={pending}>
            {result && result.count > 0 && (
              <RoomBrowserResults rooms={result.rooms} onJoin={joinRoom} />
            )}

            {result && result.count === 0 && (
              <div className="border-theme bg-theme-surface rounded-2xl border px-5 py-12 text-center sm:py-16">
                <h2 className="font-pixel text-theme text-xl">
                  {search.q && `No rooms matching “${search.q}”.`}
                  {!search.q && search.live && 'No live rooms right now.'}
                  {!search.q && !search.live && 'No public rooms yet.'}
                </h2>
                <p className="text-theme-muted mt-3 text-sm">
                  {search.live &&
                    'Browse all public rooms, including those without listeners.'}
                  {!search.live &&
                    'Try another name, or start a room with your friends.'}
                </p>
                <Link
                  to={
                    !search.q && !search.live
                      ? `/rooms/create${search.roomType === 'WATCH' ? '?type=watch' : ''}`
                      : roomBrowserUrl({
                          ...search,
                          q: '',
                          live: false,
                          from: 0,
                        })
                  }
                  className="border-theme bg-theme text-theme hover:border-secondary focus-visible:ring-secondary mt-5 inline-flex min-h-11 items-center rounded-xl border px-5 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  {!search.q && !search.live
                    ? 'Start a room'
                    : 'Browse all public rooms'}
                </Link>
              </div>
            )}

            {!result && (
              <div className="border-theme bg-theme-surface rounded-2xl border p-6 text-center">
                <p className="text-theme-muted">
                  We couldn’t load the rooms. Give it another try.
                </p>
                <Button
                  onClick={() => revalidator()}
                  disabled={pending}
                  variant="tertiary"
                  className="mt-4 min-h-11 text-sm"
                >
                  Try again
                </Button>
              </div>
            )}

            {result && (
              <RoomBrowserPagination
                result={result}
                search={search}
                pending={pending}
              />
            )}
          </div>
        </section>
      </div>
    </SitePage>
  );
}
