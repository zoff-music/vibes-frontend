import { useFetcher, useRouteLoaderData } from '@vibes/native-router';
import { useCallback, useEffect, useState } from 'react';
import type { PlayerPreferenceData } from '@/routes/preferences.player/loader';

export function usePlayerPreference() {
  const preference =
    useRouteLoaderData<PlayerPreferenceData>('preferences.player');
  const preferenceFetcher = useFetcher<boolean>({
    routeId: 'preferences.player',
  });
  const [enabled, setEnabledValue] = useState(true);

  useEffect(() => {
    if (preference) setEnabledValue(preference.enabled);
  }, [preference]);

  const setEnabled = useCallback(
    async (nextEnabled: boolean) => {
      const result = await preferenceFetcher.submit({ enabled: nextEnabled });
      if (result.data !== null) setEnabledValue(result.data);
    },
    [preferenceFetcher.submit],
  );

  return [{ enabled, loaded: Boolean(preference) }, setEnabled] as const;
}
