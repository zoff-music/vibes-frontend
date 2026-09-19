import { AnimatedNumber } from '@vibes/ui/web';
import { useLoaderData } from 'react-router';
import type { HomeLoaderData } from '../loader';

export function CommunityStats() {
  const { data, pending } = useLoaderData<HomeLoaderData>();
  const { stats } = data;

  return (
    <section
      aria-label="Zoff community statistics"
      aria-busy={pending && stats === null}
      className="mt-6 mb-4 border-theme border-y py-8 sm:mt-10 sm:mb-8 sm:py-10"
    >
      <dl className="grid grid-cols-3 items-start text-center">
        <div className="pr-3 sm:pr-6">
          <dt className="flex min-h-8 items-center justify-center text-theme-muted text-xs sm:min-h-4">
            Rooms
          </dt>
          <dd className="mt-1 font-pixel text-2xl text-theme tabular-nums sm:text-5xl">
            <AnimatedNumber value={stats?.totalRooms ?? null} />
          </dd>
        </div>
        <div className="border-theme border-l px-3 sm:px-6">
          <dt className="flex min-h-8 items-center justify-center text-theme-muted text-xs sm:min-h-4">
            Songs in queues
          </dt>
          <dd className="mt-1 font-pixel text-2xl text-theme tabular-nums sm:text-5xl">
            <AnimatedNumber value={stats?.totalSongs ?? null} />
          </dd>
        </div>
        <div className="border-theme border-l pl-3 sm:pl-6">
          <dt className="flex min-h-8 items-center justify-center gap-1.5 text-theme-muted text-xs sm:min-h-4">
            {stats && (
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-secondary"
              />
            )}
            Listeners
          </dt>
          <dd className="mt-1 font-pixel text-2xl text-theme tabular-nums sm:text-5xl">
            <AnimatedNumber value={stats?.totalListeners ?? null} />
          </dd>
        </div>
      </dl>
      <p role="status" className="sr-only">
        {pending && !stats && 'Loading community totals.'}
        {!pending && !stats && 'Community totals are currently unavailable.'}
      </p>
    </section>
  );
}
