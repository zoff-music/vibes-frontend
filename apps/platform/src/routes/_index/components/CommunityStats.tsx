import { Await, useFetcher, useLoaderData } from '@kasperrt/smolter/preact';
import type { StatsV2 } from '@vibes/models';
import { AnimatedNumber } from '@vibes/ui/web';
import { useEffect } from 'preact/compat';
import { useExperience } from '../../../hooks/useExperience';
import type { clientLoader } from '../../resources.statistics/clientLoader';
import type { HomeLoaderData } from '../loader';

interface CommunityStatsProps {
  stats: StatsV2 | null;
}

export function CommunityStats() {
  const { data } = useLoaderData<HomeLoaderData>();
  const { stats } = data;
  const roomType = useExperience();
  const fetcher = useFetcher<typeof clientLoader>();
  const load = fetcher.load;

  useEffect(() => {
    if (stats !== null) return;

    void load(`/resources/statistics?type=${roomType.toLowerCase()}`);
  }, [stats, roomType, load]);

  const resolved =
    stats ?? (fetcher.data?.roomType === roomType ? fetcher.data.stats : null);

  return (
    <Await
      resolve={resolved}
      fallback={<StatsSummary stats={null} />}
      errorElement={<StatsSummary stats={null} />}
    >
      {(result: StatsV2 | null) => <StatsSummary stats={result} />}
    </Await>
  );
}

function StatsSummary({ stats }: CommunityStatsProps) {
  const isWatch = useExperience() === 'WATCH';

  return (
    <section
      aria-label={isWatch ? 'Zoff Watch statistics' : 'Zoff Music statistics'}
      className="border-theme mt-6 mb-4 border-y py-8 sm:mt-10 sm:mb-8 sm:py-10"
    >
      <dl className="grid grid-cols-3 items-start text-center">
        <div className="pr-3 sm:pr-6">
          <dt className="text-theme-muted flex min-h-8 items-center justify-center text-xs sm:min-h-4">
            Rooms
          </dt>
          <dd className="font-pixel text-theme mt-1 text-2xl tabular-nums sm:text-5xl">
            {stats && <AnimatedNumber value={stats.totalRooms} />}
            {!stats && <UnavailableCount />}
          </dd>
        </div>
        <div className="border-theme border-l px-3 sm:px-6">
          <dt className="text-theme-muted flex min-h-8 items-center justify-center text-xs sm:min-h-4">
            {isWatch ? 'Videos in queues' : 'Songs in queues'}
          </dt>
          <dd className="font-pixel text-theme mt-1 text-2xl tabular-nums sm:text-5xl">
            {stats && <AnimatedNumber value={stats.totalPlaylistItems} />}
            {!stats && <UnavailableCount />}
          </dd>
        </div>
        <div className="border-theme border-l pl-3 sm:pl-6">
          <dt className="text-theme-muted flex min-h-8 items-center justify-center gap-1.5 text-xs sm:min-h-4">
            <span
              aria-hidden="true"
              className="bg-secondary h-1.5 w-1.5 rounded-full"
            />
            {isWatch ? 'Watchers' : 'Listeners'}
          </dt>
          <dd className="font-pixel text-theme mt-1 text-2xl tabular-nums sm:text-5xl">
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
