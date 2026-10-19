import type { Providers } from '@vibes/models';

interface RoomConnectionsProps {
  providers: Providers;
}

export function RoomConnections({ providers }: RoomConnectionsProps) {
  return (
    <>
      {providers.includes('youtube') && (
        <>
          <link rel="preconnect" href="https://www.youtube.com" />
          <link rel="preconnect" href="https://www.youtube-nocookie.com" />
        </>
      )}
      {providers.includes('soundcloud') && (
        <link rel="preconnect" href="https://w.soundcloud.com" />
      )}
    </>
  );
}
