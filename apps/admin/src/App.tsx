import {
  SiteBackground,
  SiteFooter,
  SiteLayout,
  ToastViewport,
} from '@vibes/ui/web';
import { Outlet } from 'react-router';
import { AdminHeader } from './components/AdminHeader';

export function App() {
  return (
    <>
      <ToastViewport />
      <SiteBackground variant="landing" showGrid />
      <SiteLayout header={<AdminHeader />} footer={<SiteFooter />}>
        <Outlet />
      </SiteLayout>
    </>
  );
}
