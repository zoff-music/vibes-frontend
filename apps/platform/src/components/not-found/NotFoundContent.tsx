import { NotFoundView } from '@vibes/ui/web';
import { lazy, Suspense } from 'preact/compat';

const LazyBeatGame = lazy(() =>
  import('./BeatGame').then((module) => ({ default: module.BeatGame })),
);

export function NotFoundContent() {
  return (
    <NotFoundView>
      <Suspense
        fallback={
          <div
            aria-hidden="true"
            className="mx-auto h-92 w-full max-w-sm rounded-3xl border border-theme bg-theme-surface sm:h-102"
          />
        }
      >
        <LazyBeatGame />
      </Suspense>
    </NotFoundView>
  );
}
