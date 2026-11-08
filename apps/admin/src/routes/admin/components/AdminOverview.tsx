import { useLoaderData } from '@kasperrt/smolter/preact';
import {
  ListenerUsageChart,
  MessageUsageChart,
  SearchUsageChart,
} from '@vibes/ui/web';
import type { AdminOverviewLoaderData } from '../loader';

const usageDateFormatter = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'medium',
  timeZone: 'UTC',
});

export function AdminOverview() {
  const { listenerUsage, searchUsage, musicStats, watchStats, messageUsage } =
    useLoaderData<AdminOverviewLoaderData>();

  return (
    <main className="space-y-8">
      <header>
        <h1 className="text-3xl font-black tracking-tight">Overview</h1>
        <p className="text-theme-muted text-sm">
          Music and Watch rooms, with chat, search and audience activity.
        </p>
      </header>

      <section
        aria-label="Overall statistics"
        className="grid gap-4 lg:grid-cols-2"
      >
        {[
          {
            label: 'Music',
            stats: musicStats,
            audience: 'Listeners',
            items: 'Songs',
          },
          {
            label: 'Watch',
            stats: watchStats,
            audience: 'Watchers',
            items: 'Videos',
          },
        ].map((type) => (
          <article
            key={type.label}
            className="panel-surface border-theme rounded-2xl border p-5"
          >
            <h2 className="text-theme text-xl font-bold">{type.label} rooms</h2>
            <dl className="mt-4 grid grid-cols-3 gap-3">
              {[
                { label: 'Rooms', value: type.stats.totalRooms },
                { label: type.items, value: type.stats.totalPlaylistItems },
                { label: type.audience, value: type.stats.totalListeners },
              ].map((metric) => (
                <div key={metric.label}>
                  <dt className="text-theme-muted text-sm">{metric.label}</dt>
                  <dd className="text-theme mt-2 text-2xl font-black">
                    {metric.value.toLocaleString()}
                  </dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </section>

      <section aria-labelledby="chat-usage-title">
        <h2
          id="chat-usage-title"
          className="text-2xl font-black tracking-tight"
        >
          Chat messages
        </h2>
        <p className="text-theme-muted mt-1 text-sm">
          Sent messages only. Playlist and vote activity is excluded.
        </p>
        <MessageUsageChart usage={messageUsage} />
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-2xl font-black tracking-tight">
            Audience activity
          </h2>
          <p className="text-theme-muted text-sm">
            Concurrent listeners and watchers sampled once per minute.
          </p>
          {listenerUsage.generatedAt && (
            <p className="text-theme-subtle mt-1 text-xs">
              Updated{' '}
              {usageDateFormatter.format(new Date(listenerUsage.generatedAt))}{' '}
              UTC
            </p>
          )}
        </div>
        <ListenerUsageChart
          {...(listenerUsage.roomPoints && {
            roomPoints: listenerUsage.roomPoints,
          })}
          generatedAt={listenerUsage.generatedAt}
          points={listenerUsage.points}
        />
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-2xl font-black tracking-tight">Search Usage</h2>
          <p className="text-theme-muted text-sm">
            Provider searches, including AI playlist fallback searches. Direct
            track links use metadata lookup and are not counted.
          </p>
          {searchUsage.generatedAt && (
            <p className="text-theme-subtle mt-1 text-xs">
              Updated{' '}
              {usageDateFormatter.format(new Date(searchUsage.generatedAt))} UTC
            </p>
          )}
        </div>
        <SearchUsageChart
          {...(searchUsage.roomPoints && {
            roomPoints: searchUsage.roomPoints,
          })}
          generatedAt={searchUsage.generatedAt}
          points={searchUsage.points}
        />
      </section>
    </main>
  );
}
