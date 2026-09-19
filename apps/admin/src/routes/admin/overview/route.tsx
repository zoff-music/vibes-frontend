import {
  Button,
  ListenerUsageChart,
  MessageUsageChart,
  SearchUsageChart,
} from '@vibes/ui/web';
import { Form, useLoaderData } from 'react-router';
import type { AdminOverviewLoaderData } from './loader';
import { loader } from './loader';

export { loader };

export default function AdminOverview() {
  const { listenerUsage, searchUsage, stats, messageUsage } =
    useLoaderData<AdminOverviewLoaderData>();

  return (
    <main className="space-y-8">
      <header>
        <h1 className="font-black text-3xl tracking-tight">Overview</h1>
        <p className="text-sm text-theme-muted">
          Chat, search and listener activity across Zoff.
        </p>
      </header>

      <section
        aria-label="Overall statistics"
        className="grid gap-4 sm:grid-cols-3"
      >
        <article className="panel-surface rounded-2xl border border-theme p-5">
          <p className="font-semibold text-sm text-theme-muted">
            Active listeners
          </p>
          <p className="mt-2 font-black text-3xl text-theme">
            {stats.totalListeners.toLocaleString()}
          </p>
        </article>
        <article className="panel-surface rounded-2xl border border-theme p-5">
          <p className="font-semibold text-sm text-theme-muted">Songs</p>
          <p className="mt-2 font-black text-3xl text-theme">
            {stats.totalSongs.toLocaleString()}
          </p>
        </article>
        <article className="panel-surface rounded-2xl border border-theme p-5">
          <p className="font-semibold text-sm text-theme-muted">Rooms</p>
          <p className="mt-2 font-black text-3xl text-theme">
            {stats.totalRooms.toLocaleString()}
          </p>
        </article>
      </section>

      <section aria-labelledby="chat-usage-title">
        <h2
          id="chat-usage-title"
          className="font-black text-2xl tracking-tight"
        >
          Chat messages
        </h2>
        <p className="mt-1 text-sm text-theme-muted">
          Sent messages only. Song and vote activity is excluded.
        </p>
        <Form method="get" className="my-4 flex flex-wrap items-end gap-3">
          <label className="min-w-0 flex-1 text-sm">
            Room ID
            <input
              name="roomId"
              key={messageUsage.roomId}
              defaultValue={messageUsage.roomId}
              placeholder="All rooms"
              maxLength={200}
              className="mt-1 block w-full rounded-xl border border-theme bg-theme-surface px-3 py-2 text-theme focus-visible:outline-2 focus-visible:outline-secondary"
            />
          </label>
          <Button type="submit">Apply</Button>
        </Form>
        <MessageUsageChart usage={messageUsage} />
      </section>

      <section>
        <div className="mb-4">
          <h2 className="font-black text-2xl tracking-tight">Listener Usage</h2>
          <p className="text-sm text-theme-muted">
            Concurrent active listeners sampled once per minute.
          </p>
          {listenerUsage.generatedAt && (
            <p className="mt-1 text-theme-subtle text-xs">
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
          <p className="text-sm text-theme-muted">
            Provider searches, including AI playlist fallback searches. Direct
            track links use metadata lookup and are not counted.
          </p>
          {searchUsage.generatedAt && (
            <p className="mt-1 text-theme-subtle text-xs">
              Updated{' '}
              {usageDateFormatter.format(new Date(searchUsage.generatedAt))} UTC
            </p>
          )}
        </div>
        <SearchUsageChart
          generatedAt={searchUsage.generatedAt}
          points={searchUsage.points}
        />
      </section>
    </main>
  );
}

const usageDateFormatter = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'medium',
  timeZone: 'UTC',
});
