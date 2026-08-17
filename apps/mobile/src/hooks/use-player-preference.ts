import { useCallback, useEffect, useState } from 'react';
import { getSecureValue, setSecureValue } from '@/lib/secure-storage';

export function usePlayerPreference() {
  const [enabled, setEnabledValue] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [, storedPreference] = await getSecureValue(storageKey);
      if (storedPreference === 'false') {
        setEnabledValue(false);
      }
      setLoaded(true);
    };
    void load();
  }, []);

  const setEnabled = useCallback(async (nextEnabled: boolean) => {
    setEnabledValue(nextEnabled);
    await setSecureValue(storageKey, nextEnabled ? 'true' : 'false');
  }, []);

  return { enabled, loaded, setEnabled };
}

const storageKey = 'zoff.mobile.player-enabled';
