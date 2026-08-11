import { ToastViewport } from '@vibes/ui/web';
import { Outlet } from 'react-router';

export function App() {
  return (
    <>
      <ToastViewport />
      <Outlet />
    </>
  );
}
