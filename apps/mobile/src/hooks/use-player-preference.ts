import { useMutation } from '@vibes/shared/use-request';
import { useCallback, useEffect, useState } from 'react';
import { useInitialData } from '@/providers/initial-data-provider';
import { updatePlayerPreference } from '@/requests/update-player-preference';

export function usePlayerPreference() {
  const preference = useInitialData().player;
  const [, preferenceFetcherSubmit] = useMutation(updatePlayerPreference);
  const [enabled, setEnabledValue] = useState(true);
  const [warning, setWarning] = useState('');

  useEffect(() => {
    if (preference) setEnabledValue(preference.enabled);
  }, [preference]);

  const setEnabled = useCallback(
    async (nextEnabled: boolean) => {
      const result = await preferenceFetcherSubmit({ enabled: nextEnabled });

      if (!result.data) return;

      setEnabledValue(result.data.enabled);
      setWarning(result.data.warning);
    },
    [preferenceFetcherSubmit],
  );

  return [
    { enabled, loaded: Boolean(preference), warning },
    setEnabled,
  ] as const;
}
