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
    <section aria-labelledby="room-controls-heading" className="py-16 sm:py-28">
      <div className="mb-6 grid gap-4 sm:mb-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="min-w-0">
          <p className="font-pixel text-primary text-xs tracking-label">
            ROOM CONTROLS
          </p>
          <h2
            id="room-controls-heading"
            className="mt-4 font-pixel text-3xl normal-case leading-tight tracking-tight sm:text-5xl"
          >
            Set the room your way.
          </h2>
          <p className="mt-5 max-w-xl text-theme-muted leading-relaxed sm:text-lg">
            Let everyone add songs, keep the controls to yourself, or put the
            queue on repeat.
          </p>
        </div>
        <Link
          to="/discovery/rooms"
          className="inline-flex min-h-11 shrink-0 items-center gap-3 justify-self-start rounded-xl border border-theme bg-theme-surface px-5 py-3 text-sm text-theme hover:border-secondary/60 hover:bg-theme focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary lg:justify-self-end"
        >
          All room settings{' '}
          <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
        </Link>
      </div>
      <div className="min-w-0">
        <DeferredContent
          fallback={
            <div
              aria-hidden="true"
              className="h-164 rounded-3xl border border-theme bg-theme lg:h-120"
            />
          }
        >
          <LazyRoomControlPanel />
        </DeferredContent>
      </div>
    </section>
  );
}
