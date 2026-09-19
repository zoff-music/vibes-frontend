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
    <section aria-labelledby="room-controls-heading" className="py-20 sm:py-28">
      <div className="mb-12 flex flex-col gap-6 sm:mb-16 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
        <div className="min-w-0">
          <p className="font-pixel text-primary text-xs tracking-label">
            ROOM CONTROLS
          </p>
          <h2
            id="room-controls-heading"
            className="mt-4 font-pixel text-4xl normal-case leading-tight tracking-tight sm:text-5xl"
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
          className="inline-flex min-h-11 shrink-0 items-center gap-3 self-start rounded-xl border border-theme bg-theme-surface px-5 py-3 text-sm text-theme hover:border-secondary/60 hover:bg-theme focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary lg:self-end"
        >
          Room settings and embeds{' '}
          <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
        </Link>
      </div>
      <div className="min-w-0">
        <DeferredContent
          fallback={
            <div aria-hidden="true" className="h-260 sm:h-276 lg:h-156" />
          }
        >
          <LazyRoomControlPanel />
        </DeferredContent>
      </div>
    </section>
  );
}
