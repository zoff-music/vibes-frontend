import { isRouteErrorResponse, useRouter } from '@kasperrt/smolter/preact';
import { SiteLayout as SharedSiteLayout } from '@vibes/ui/web';
import { memo, type ReactNode, useSyncExternalStore } from 'preact/compat';
import { SiteFooter } from '../legal/SiteFooter';
import { SiteHeader } from '../seo/SiteHeader';

interface SiteLayoutProps {
  children: ReactNode;
}

export function SiteLayout({ children }: SiteLayoutProps) {
  const router = useRouter();
  const { path = '', error } = useSyncExternalStore(
    router.subscribe,
    router.getSnapshot,
    router.getSnapshot,
  );
  const isNotFound = isRouteErrorResponse(error) && error.status === 404;
  const isRoomPage = roomPaths.has(path) && !isNotFound;
  const isPolicyPage = policyPaths.has(path);

  return (
    <SiteLayoutContent isRoomPage={isRoomPage} isPolicyPage={isPolicyPage}>
      {children}
    </SiteLayoutContent>
  );
}

interface SiteLayoutContentProps extends SiteLayoutProps {
  isRoomPage: boolean;
  isPolicyPage: boolean;
}

const SiteLayoutContent = memo(function SiteLayoutContent({
  children,
  isRoomPage,
  isPolicyPage,
}: SiteLayoutContentProps) {
  if (isRoomPage) return children;

  return (
    <SharedSiteLayout
      header={<SiteHeader showExperienceSwitch={!isPolicyPage} />}
      footer={<SiteFooter />}
    >
      {children}
    </SharedSiteLayout>
  );
});

const roomPaths = new Set(['/:id/*', '/rooms/:id']);
const policyPaths = new Set([
  '/security',
  '/privacy-policy',
  '/terms-of-service',
]);
