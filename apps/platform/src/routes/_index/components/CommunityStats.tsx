import { useLoaderData } from 'react-router';
import type { HomeLoaderData } from '../loader';

export function CommunityStats() {
  const { totalRooms, totalSongs, totalListeners, statsAvailable } =
    useLoaderData<HomeLoaderData>();
  const format = new Intl.NumberFormat('en');
  return (
    <section
      aria-label="Zoff community statistics"
      className="my-8 border-theme border-y py-10 sm:my-12 sm:py-14"
    >
      <dl className="grid grid-cols-3 text-center">
        <div className="pr-3 sm:pr-6">
          <dt className="text-theme-muted text-xs">Rooms</dt>
          <dd className="mt-1 font-pixel text-3xl text-theme tabular-nums sm:text-5xl">
            {statsAvailable ? format.format(totalRooms) : '—'}
          </dd>
        </div>
        <div className="border-theme border-l px-3 sm:px-6">
          <dt className="text-theme-muted text-xs">Songs in queues</dt>
          <dd className="mt-1 font-pixel text-3xl text-theme tabular-nums sm:text-5xl">
            {statsAvailable ? format.format(totalSongs) : '—'}
          </dd>
        </div>
        <div className="border-theme border-l pl-3 sm:pl-6">
          <dt className="flex items-center justify-center gap-1.5 text-theme-muted text-xs">
            {statsAvailable && (
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-secondary"
              />
            )}
            Listeners
          </dt>
          <dd className="mt-1 font-pixel text-3xl text-theme tabular-nums sm:text-5xl">
            {statsAvailable ? format.format(totalListeners) : '—'}
          </dd>
        </div>
      </dl>
    </section>
  );
}
