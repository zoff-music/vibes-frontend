import { ArrowRightIcon, DeferredContent } from '@vibes/ui/web';
import { lazy } from 'react';
import { Link } from 'react-router';

const LazyRoomControlPanel = lazy(() =>
  import('./RoomControlPanel').then((module) => ({
    default: module.RoomControlPanel,
  })),
);

export function RoomControlsPreview() {
  return (
    <section
      aria-labelledby="room-controls-heading"
      className="grid items-center gap-12 py-20 sm:py-28 lg:grid-cols-5 lg:gap-20"
    >
      <div className="lg:order-2 lg:col-span-2">
        <p className="font-pixel text-primary text-xs tracking-label">
          ROOM CONTROLS
        </p>
        <h2
          id="room-controls-heading"
          className="mt-4 font-pixel text-4xl normal-case leading-tight tracking-tight sm:text-5xl"
        >
          Your room.
          <br />
          Your settings.
        </h2>
        <p className="mt-5 max-w-sm text-theme-muted leading-relaxed">
          Choose who can add and skip songs, which sources to use, and what
          stays in the queue. No accounts to manage.
        </p>
        <Link
          to="/discovery/rooms"
          className="mt-6 inline-flex min-h-11 items-center gap-3 rounded-xl border border-theme bg-theme-surface px-5 py-3 text-sm text-theme hover:border-secondary/60 hover:bg-theme focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
        >
          Room settings and embeds{' '}
          <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
        </Link>
      </div>
      <div className="min-w-0 lg:order-1 lg:col-span-3">
        <DeferredContent
          fallback={
            <div
              aria-hidden="true"
              className="h-186 rounded-3xl border border-theme bg-theme-surface sm:h-160"
            />
          }
        >
          <LazyRoomControlPanel />
        </DeferredContent>
      </div>
    </section>
  );
}
