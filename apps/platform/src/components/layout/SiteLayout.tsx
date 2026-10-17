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
  const isPolicyPage = matches.some((match) => policyRouteIds.has(match.id));

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

const roomRouteIds = new Set(['routes/$id/route', 'routes/rooms.$id/route']);
const policyRouteIds = new Set([
  'routes/security/route',
  'routes/privacy-policy/route',
  'routes/terms-of-service/route',
]);
