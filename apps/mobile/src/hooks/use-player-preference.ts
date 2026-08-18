import { useFetcher, useRouteLoaderData } from '@vibes/native-router';
import { useCallback, useEffect, useState } from 'react';
import type { PlayerPreferenceActionData } from '@/routes/preferences.player/action';
import type { PlayerPreferenceData } from '@/routes/preferences.player/loader';

export function usePlayerPreference() {
  const preference =
    useRouteLoaderData<PlayerPreferenceData>('preferences.player');
  const [, preferenceFetcher] = useFetcher<PlayerPreferenceActionData>({
    routeId: 'preferences.player',
  });
  const [enabled, setEnabledValue] = useState(true);
  const [warning, setWarning] = useState('');

  useEffect(() => {
    if (preference) setEnabledValue(preference.enabled);
  }, [preference]);

  const setEnabled = useCallback(
    async (nextEnabled: boolean) => {
      const result = await preferenceFetcher.submit({ enabled: nextEnabled });
      if (!result.data) return;
      setEnabledValue(result.data.enabled);
      setWarning(result.data.warning);
    },
    [preferenceFetcher.submit],
  );

  return [
    { enabled, loaded: Boolean(preference), warning },
    setEnabled,
  ] as const;
}
