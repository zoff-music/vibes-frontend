import { Link } from '@kasperrt/smolter/preact';
import { ArrowRightIcon, DeferredContent } from '@vibes/ui/web';
import { lazy } from 'preact/compat';

const LazyRoomControlPanel = lazy(() =>
  import('./RoomControlPanel').then((module) => ({
    default: module.RoomControlPanel,
  })),
);

export function RoomControlsPreview() {
  return (
    <section
      aria-labelledby="room-controls-heading"
      className="border-theme grid items-center gap-10 border-t py-16 sm:py-24 lg:grid-cols-5 lg:gap-14"
    >
      <div className="min-w-0 lg:order-2 lg:col-span-2">
        <div className="min-w-0">
          <p className="font-pixel tracking-label dark:text-primary text-xs text-pink-800">
            MAKE IT YOURS
          </p>
          <h2
            id="room-controls-heading"
            className="font-pixel mt-4 text-3xl leading-tight tracking-tight normal-case sm:text-5xl"
          >
            Your people.
            <br />
            <span className="dark:text-primary text-pink-800">
              Your house rules.
            </span>
          </h2>
          <p className="text-theme-muted mt-5 max-w-xl leading-relaxed sm:text-lg">
            A few friends or a full house. Choose who adds, who skips, and what
            stays in rotation.
          </p>
        </div>
        <Link
          to="/discovery/rooms"
          prefetch="intent"
          className="focus-visible:ring-secondary dark:text-secondary mt-6 inline-flex min-h-11 items-center gap-3 rounded-lg text-sm text-cyan-800 underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:outline-none"
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
              className="border-theme bg-theme h-166 rounded-3xl border"
            />
          }
        >
          <LazyRoomControlPanel />
        </DeferredContent>
      </div>
    </section>
  );
}
