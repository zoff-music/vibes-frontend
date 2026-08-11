import { useState } from 'react';
import { useTvSession } from '@/hooks/use-tv-session';
import { tizenApi } from '@/tizen/api';
import { TizenLanding } from '@/tizen/tizen-landing';
import { TizenRoom } from '@/tizen/tizen-room';
import { useSpatialNavigation } from '@/tizen/use-spatial-navigation';

export function TizenApp() {
  useSpatialNavigation();
  const session = useTvSession(tizenApi);
  const [isAIMode, setIsAIMode] = useState(false);
  let screen = (
    <TizenLanding
      isAIMode={isAIMode}
      session={session}
      onToggleAIMode={() => setIsAIMode((current) => !current)}
    />
  );
  if (session.room && session.roomId) {
    screen = <TizenRoom session={session} />;
  }
  return (
    <main className="relative h-full overflow-hidden bg-tv-background font-heading text-tv-text">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_100%,rgba(255,46,151,0.14),transparent_35%),radial-gradient(circle_at_90%_0%,rgba(0,217,255,0.08),transparent_30%)]" />
      {screen}
    </main>
  );
}
