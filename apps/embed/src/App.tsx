import { Outlet } from '@kasperrt/smolter/preact';
import { ToastViewport } from '@vibes/ui/web';

export function App() {
  return (
    <>
      <ToastViewport />
      <Outlet />
    </>
  );
}
