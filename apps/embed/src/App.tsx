import { ToastViewport } from '@vibes/ui';
import { Outlet } from 'react-router';

export function App() {
  return (
    <>
      <ToastViewport />
      <Outlet />
    </>
  );
}
