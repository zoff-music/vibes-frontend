import { ToastViewport } from '@vibes/ui/web';
import { Outlet } from 'react-router';
import { useThemeSync } from './theme';

export function App() {
  useThemeSync();

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-theme text-theme">
      <div className="theme-page-gradient pointer-events-none fixed inset-0 bg-[length:180%_180%]" />
      <div className="theme-page-glow pointer-events-none fixed inset-0 opacity-65" />
      <div className="remote-grid pointer-events-none fixed inset-0" />
      <ToastViewport />
      <Outlet />
    </div>
  );
}
