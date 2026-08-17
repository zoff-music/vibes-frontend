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
if (!rootElement) throw new Error('Samsung TV root is unavailable.');
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
