import { useEffect, useState } from 'react';

// Room and machine events arrive separately. Only expose recovery controls
// after the same playback state has remained out of sync through that handoff.
export function usePlaybackDrift(outOfSync: boolean, playbackKey: string) {
  const [confirmedKey, setConfirmedKey] = useState('');

  useEffect(() => {
    setConfirmedKey('');

    if (!outOfSync || !playbackKey) return;

    const timeout = setTimeout(() => setConfirmedKey(playbackKey), 3_000);

    return () => clearTimeout(timeout);
  }, [outOfSync, playbackKey]);

  return outOfSync && Boolean(playbackKey) && confirmedKey === playbackKey;
}
