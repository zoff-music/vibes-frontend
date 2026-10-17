import { Await, useLoaderData } from '@kasperrt/smolter/preact';
import type { StatsV2 } from '@vibes/models';
import { AnimatedNumber } from '@vibes/ui/web';
import { Suspense } from 'preact/compat';
import { useExperience } from '../../../hooks/useExperience';
import type { HomeLoaderData } from '../loader';

interface CommunityStatsProps {
  stats: StatsV2 | null;
}

export function CommunityStats() {
  const { data } = useLoaderData<HomeLoaderData>();
  const { stats } = data;

  return (
    <Suspense fallback={<StatsSummary stats={null} />}>
      <Await resolve={stats} errorElement={<StatsSummary stats={null} />}>
        {(result: StatsV2 | null) => <StatsSummary stats={result} />}
      </Await>
    </Suspense>
  );
}

function StatsSummary({ stats }: CommunityStatsProps) {
  const isWatch = useExperience() === 'WATCH';

  return (
    <section
      aria-label={isWatch ? 'Zoff Watch statistics' : 'Zoff Music statistics'}
      className="mt-6 mb-4 border-theme border-y py-8 sm:mt-10 sm:mb-8 sm:py-10"
    >
      <dl className="grid grid-cols-3 items-start text-center">
        <div className="pr-3 sm:pr-6">
          <dt className="flex min-h-8 items-center justify-center text-theme-muted text-xs sm:min-h-4">
            Rooms
          </dt>
          <dd className="mt-1 font-pixel text-2xl text-theme tabular-nums sm:text-5xl">
            {stats && <AnimatedNumber value={stats.totalRooms} />}
            {!stats && <UnavailableCount />}
          </dd>
        </div>
        <div className="border-theme border-l px-3 sm:px-6">
          <dt className="flex min-h-8 items-center justify-center text-theme-muted text-xs sm:min-h-4">
            {isWatch ? 'Videos in queues' : 'Songs in queues'}
          </dt>
          <dd className="mt-1 font-pixel text-2xl text-theme tabular-nums sm:text-5xl">
            {stats && <AnimatedNumber value={stats.totalPlaylistItems} />}
            {!stats && <UnavailableCount />}
          </dd>
        </div>
        <div className="border-theme border-l pl-3 sm:pl-6">
          <dt className="flex min-h-8 items-center justify-center gap-1.5 text-theme-muted text-xs sm:min-h-4">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-secondary"
            />
            {isWatch ? 'Watchers' : 'Listeners'}
          </dt>
          <dd className="mt-1 font-pixel text-2xl text-theme tabular-nums sm:text-5xl">
            {stats && <AnimatedNumber value={stats.totalListeners} />}
            {!stats && <UnavailableCount />}
          </dd>
        </div>
      </dl>
    </section>
  );
}

function UnavailableCount() {
  return (
    <>
      <span aria-hidden="true">—</span>
      <span className="sr-only">Not available yet</span>
    </>
  );
}
