import type { ReactNode } from 'react';
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
  if (isRoomPage) return children;

  return (
    <div className="site-layout relative flex min-h-dvh flex-col">
      {!hasTerminalHeader && <SiteHeader />}
      <div className="min-w-0 flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}

const roomRouteIds = new Set([
  'routes/rooms.$id/route',
  'routes/rooms.alias/route',
]);

const terminalHeaderRouteIds = new Set([
  'routes/_index/route',
  'routes/rooms.create/route',
  'routes/privacy-policy/route',
  'routes/terms-of-service/route',
  'routes/security/route',
]);
