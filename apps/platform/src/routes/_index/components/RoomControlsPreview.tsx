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
      className="grid items-center gap-10 border-theme border-t py-16 sm:py-24 lg:grid-cols-5 lg:gap-14"
    >
      <div className="min-w-0 lg:order-2 lg:col-span-2">
        <div className="min-w-0">
          <p className="font-pixel text-pink-800 text-xs tracking-label dark:text-primary">
            MAKE IT YOURS
          </p>
          <h2
            id="room-controls-heading"
            className="mt-4 font-pixel text-3xl normal-case leading-tight tracking-tight sm:text-5xl"
          >
            Your people.
            <br />
            <span className="text-pink-800 dark:text-primary">
              Your house rules.
            </span>
          </h2>
          <p className="mt-5 max-w-xl text-theme-muted leading-relaxed sm:text-lg">
            A few friends or a full house. Choose who adds, who skips, and what
            stays in rotation.
          </p>
        </div>
        <Link
          to="/discovery/rooms"
          prefetch="intent"
          className="mt-6 inline-flex min-h-11 items-center gap-3 rounded-lg text-cyan-800 text-sm underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary dark:text-secondary"
        >
          All room settings{' '}
          <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
        </Link>
      </div>
      <div className="min-w-0 lg:order-1 lg:col-span-3">
        <DeferredContent
          fallback={
            <div
              aria-hidden="true"
              className="h-166 rounded-3xl border border-theme bg-theme"
            />
          }
        >
          <LazyRoomControlPanel />
        </DeferredContent>
      </div>
    </section>
  );
}
