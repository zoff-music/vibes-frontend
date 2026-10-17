import { Outlet } from '@kasperrt/smolter/preact';
import {
  SiteBackground,
  SiteFooter,
  SiteLayout,
  ToastViewport,
} from '@vibes/ui/web';
import { AdminHeader } from './components/AdminHeader';
import AdminLayout from './components/AdminLayout';

export function App() {
  return (
    <>
      <ToastViewport />
      <SiteBackground variant="landing" showGrid />
      <SiteLayout header={<AdminHeader />} footer={<SiteFooter />}>
        <AdminLayout>
          <Outlet />
        </AdminLayout>
      </SiteLayout>
    </>
  );
}
