import { createRoot } from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router';
import { action } from '@/tizen/routes/session/action';
import { loader } from '@/tizen/routes/session/loader';
import {
  shouldRevalidate,
  TizenSessionRoute,
} from '@/tizen/routes/session/route';
import {
  TizenErrorBoundary,
  TizenHydrateFallback,
  TizenRecoveryView,
} from '@/tizen/tizen-error-boundary';
import '@/tizen/tizen.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  const fallback = document.createElement('main');
  fallback.className =
    'flex h-full items-center justify-center bg-tv-background p-16 text-center text-tv-text';
  fallback.textContent =
    'The TV screen could not start. Restart Zoff to try again.';
  document.body.replaceChildren(fallback);
}
if (rootElement) {
  const router = createHashRouter([
    {
      action,
      Component: TizenSessionRoute,
      errorElement: <TizenRecoveryView />,
      HydrateFallback: TizenHydrateFallback,
      loader,
      path: '/',
      shouldRevalidate,
    },
  ]);
  createRoot(rootElement).render(
    <TizenErrorBoundary>
      <RouterProvider router={router} />
    </TizenErrorBoundary>,
  );
}
