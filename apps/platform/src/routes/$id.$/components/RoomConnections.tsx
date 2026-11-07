import type { Providers, SourceType } from '@vibes/models';

interface RoomConnectionsProps {
  providers: Providers;
  sourceTypes: ReadonlySet<SourceType>;
}

// Warm the providers whose players mount during load: the playing track's and any provider with a
// queued standby track, which stays loaded for seamless switching. A provider with nothing queued
// starts later and connects then; extra preconnects compete for the startup connection budget.
export function RoomConnections({
  providers,
  sourceTypes,
}: RoomConnectionsProps) {
  const uses = (provider: SourceType) =>
    sourceTypes.has(provider) && providers.includes(provider);

  return (
    <>
      {uses('youtube') && (
        <>
          <link rel="preconnect" href="https://www.youtube.com" />
          <link rel="preconnect" href="https://www.youtube-nocookie.com" />
        </>
      )}
      {uses('soundcloud') && (
        <link rel="preconnect" href="https://w.soundcloud.com" />
      )}
    </>
  );
}
