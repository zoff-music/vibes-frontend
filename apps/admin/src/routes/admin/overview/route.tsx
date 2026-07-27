import { ListenerUsageChart, SearchUsageChart } from '@vibes/ui';
import { useLoaderData } from 'react-router';
import type { AdminOverviewLoaderData } from './loader';
import { loader } from './loader';

export { loader };

export default function AdminOverview() {
  const { listenerUsage, searchUsage } =
    useLoaderData<AdminOverviewLoaderData>();

  return (
    <main className="space-y-8">
      <header>
        <h1 className="font-black text-3xl tracking-tight">Overview</h1>
        <p className="text-ink/60 text-sm dark:text-gray-400">
          Search and listener activity across Zoff.
        </p>
      </header>

      <section>
        <div className="mb-4">
          <h2 className="font-black text-2xl tracking-tight">Listener Usage</h2>
          <p className="text-ink/60 text-sm dark:text-gray-400">
            Concurrent active listeners sampled once per minute.
          </p>
          {listenerUsage.generatedAt && (
            <p className="mt-1 text-ink/50 text-xs dark:text-gray-500">
              Updated{' '}
              {usageDateFormatter.format(new Date(listenerUsage.generatedAt))}{' '}
              UTC
            </p>
          )}
        </div>
        <ListenerUsageChart
          generatedAt={listenerUsage.generatedAt}
          points={listenerUsage.points}
        />
      </section>

      <section>
        <div className="mb-4">
          <h2 className="font-black text-2xl tracking-tight">Search Usage</h2>
          <p className="text-ink/60 text-sm dark:text-gray-400">
            Provider searches, including AI playlist fallback searches. Direct
            track links use metadata lookup and are not counted.
          </p>
          {searchUsage.generatedAt && (
            <p className="mt-1 text-ink/50 text-xs dark:text-gray-500">
              Updated{' '}
              {usageDateFormatter.format(new Date(searchUsage.generatedAt))} UTC
            </p>
          )}
        </div>
        <SearchUsageChart summaries={searchUsage.summaries} />
      </section>
    </main>
  );
}

const usageDateFormatter = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'medium',
  timeZone: 'UTC',
});
