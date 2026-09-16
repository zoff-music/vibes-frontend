import type { ReactNode } from 'react';
import { useMatches } from 'react-router';
import { SiteFooter } from '../legal/SiteFooter';

interface SiteLayoutProps {
  children: ReactNode;
}

export function SiteLayout({ children }: SiteLayoutProps) {
  const matches = useMatches();
  const isRoomPage = matches.some((match) => roomRouteIds.has(match.id));
  if (isRoomPage) return children;

  return (
    <div className="site-layout relative flex min-h-dvh flex-col">
      <div className="min-w-0 flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}

const roomRouteIds = new Set([
  'routes/rooms.$id/route',
  'routes/rooms.alias/route',
]);
