import { isRouteErrorResponse, useRouteError } from '@kasperrt/smolter/preact';
import { PlatformErrorView } from '../components/errors/PlatformErrorView';
import { isStaleRouteError } from '../components/errors/recovery';
import { Background } from '../components/layout/Background';
import { SiteLayout } from '../components/layout/SiteLayout';
import { NotFoundPage } from '../components/not-found/NotFoundPage';

export function ErrorBoundary() {
  const error = useRouteError();
  const requiresReload = error instanceof Error && isStaleRouteError(error);

  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <>
        <Background />
        <SiteLayout>
          <NotFoundPage />
        </SiteLayout>
      </>
    );
  }

  return (
    <SiteLayout>
      <PlatformErrorView
        message={
          requiresReload
            ? 'A connection problem or an update interrupted this page. Reload to try again.'
            : 'Something went wrong. Try again or return home.'
        }
        requiresReload={requiresReload}
        title={
          requiresReload
            ? 'This page could not load'
            : 'Zoff is temporarily unavailable'
        }
      />
    </SiteLayout>
  );
}
