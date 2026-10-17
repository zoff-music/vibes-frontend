import { useRouteError } from '@kasperrt/smolter/preact';
import { SiteBackground } from '@vibes/ui/web';
import { AdminErrorView } from '../components/AdminErrorView';

export function ErrorBoundary() {
  useRouteError();

  return (
    <>
      <SiteBackground variant="landing" showGrid />
      <AdminErrorView message="The admin dashboard could not be loaded. Reload the page or return to sign in." />
    </>
  );
}
