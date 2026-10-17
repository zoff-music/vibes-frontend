import { isRouteErrorResponse, useRouteError } from '@kasperrt/smolter/preact';
import { NotFoundView } from '@vibes/ui/web';
import { lazy, Suspense } from 'preact/compat';
import { PlatformErrorView } from '../components/errors/PlatformErrorView';
import { isStaleRouteError } from '../components/errors/recovery';
import { Background } from '../components/layout/Background';
import { SiteLayout } from '../components/layout/SiteLayout';

const LazyBeatGame = lazy(() =>
  import('../components/not-found/BeatGame').then((module) => ({
    default: module.BeatGame,
  })),
);

export function ErrorBoundary() {
  const error = useRouteError();
  const requiresReload = error instanceof Error && isStaleRouteError(error);

  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <>
        <Background />
        <SiteLayout>
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
        </SiteLayout>
      </>
    );
  }

  return (
    <SiteLayout>
      <PlatformErrorView
        message={
          requiresReload
            ? 'This page changed while Zoff was open. Load the latest version to continue.'
            : 'Something went wrong. Try again or return home.'
        }
        requiresReload={requiresReload}
        title={
          requiresReload
            ? 'A newer page is available'
            : 'Zoff is temporarily unavailable'
        }
      />
    </SiteLayout>
  );
}
