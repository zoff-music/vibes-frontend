import type { HomeLoaderData } from '../loader';

type CommunityStatsProps = Pick<
  HomeLoaderData,
  'totalRooms' | 'totalSongs' | 'totalListeners'
>;

export function CommunityStats({
  totalRooms,
  totalSongs,
  totalListeners,
}: CommunityStatsProps) {
  const format = new Intl.NumberFormat('en');
  return (
    <section
      aria-label="Zoff community statistics"
      className="mt-8 border-theme border-y py-5 sm:mt-12 sm:py-6"
    >
      <dl className="grid grid-cols-3">
        <div className="pr-3 sm:pr-6">
          <dt className="text-theme-muted text-xs">Rooms</dt>
          <dd className="mt-1 font-pixel text-2xl text-theme tabular-nums sm:text-3xl">
            {format.format(totalRooms)}
          </dd>
        </div>
        <div className="border-theme border-l px-3 sm:px-6">
          <dt className="text-theme-muted text-xs">Songs in queues</dt>
          <dd className="mt-1 font-pixel text-2xl text-theme tabular-nums sm:text-3xl">
            {format.format(totalSongs)}
          </dd>
        </div>
        <div className="border-theme border-l pl-3 sm:pl-6">
          <dt className="flex items-center gap-1.5 text-theme-muted text-xs">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-secondary"
            />
            Listening now
          </dt>
          <dd className="mt-1 font-pixel text-2xl text-theme tabular-nums sm:text-3xl">
            {format.format(totalListeners)}
          </dd>
        </div>
      </dl>
    </section>
  );
}
