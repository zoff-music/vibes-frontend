import { SiteLayout as SharedSiteLayout } from '@vibes/ui/web';
import { memo, type ReactNode } from 'react';
import { useMatches } from 'react-router';
import { useKonamiMode } from '../konami/KonamiModeContext';
import { SiteFooter } from '../legal/SiteFooter';
import { SiteHeader } from '../seo/SiteHeader';

interface SiteLayoutProps {
  children: ReactNode;
}

export function SiteLayout({ children }: SiteLayoutProps) {
  const matches = useMatches();
  const terminalMode = useKonamiMode();
  const isRoomPage = matches.some((match) => roomRouteIds.has(match.id));
  const hasTerminalHeader =
    terminalMode &&
    matches.some((match) => terminalHeaderRouteIds.has(match.id));
  return (
    <SiteLayoutContent
      isRoomPage={isRoomPage}
      hasTerminalHeader={hasTerminalHeader}
    >
      {children}
    </SiteLayoutContent>
  );
}

interface SiteLayoutContentProps extends SiteLayoutProps {
  isRoomPage: boolean;
  hasTerminalHeader: boolean;
}

const SiteLayoutContent = memo(function SiteLayoutContent({
  children,
  isRoomPage,
  hasTerminalHeader,
}: SiteLayoutContentProps) {
  if (isRoomPage) return children;

  return (
    <SharedSiteLayout
      header={!hasTerminalHeader && <SiteHeader />}
      footer={<SiteFooter />}
    >
      {children}
    </SharedSiteLayout>
  );
});

const roomRouteIds = new Set([
  'routes/rooms.$id/route',
  'routes/rooms.alias/route',
]);

const terminalHeaderRouteIds = new Set([
  'routes/_index/route',
  'routes/features/route',
  'routes/rooms.create/route',
  'routes/privacy-policy/route',
  'routes/terms-of-service/route',
  'routes/security/route',
]);
