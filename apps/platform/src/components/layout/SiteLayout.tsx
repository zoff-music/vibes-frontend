import { useMatches } from '@kasperrt/smolter/preact';
import { SiteLayout as SharedSiteLayout } from '@vibes/ui/web';
import { memo, type ReactNode } from 'preact/compat';
import { SiteFooter } from '../legal/SiteFooter';
import { SiteHeader } from '../seo/SiteHeader';

interface SiteLayoutProps {
  children: ReactNode;
}

export function SiteLayout({ children }: SiteLayoutProps) {
  const matches = useMatches();
  const isRoomPage = matches.some((match) => roomRouteIds.has(match.id));

  return (
    <SiteLayoutContent isRoomPage={isRoomPage}>{children}</SiteLayoutContent>
  );
}

interface SiteLayoutContentProps extends SiteLayoutProps {
  isRoomPage: boolean;
}

const SiteLayoutContent = memo(function SiteLayoutContent({
  children,
  isRoomPage,
}: SiteLayoutContentProps) {
  if (isRoomPage) return children;

  return (
    <SharedSiteLayout header={<SiteHeader />} footer={<SiteFooter />}>
      {children}
    </SharedSiteLayout>
  );
});

const roomRouteIds = new Set(['routes/$id/route', 'routes/rooms.$id/route']);
