import { useRoomDiscoveryRequests } from '@vibes/api';
import type { Providers } from '@vibes/models';
import { useEffect, useState } from 'react';
import { getRequestErrorMessage, mobileApi } from '@/lib/api';

export function useProviders(setError: (message: string) => void): Providers {
  const discoveryRequests = useRoomDiscoveryRequests(mobileApi);
  const [providers, setProviders] = useState<Providers>([]);

  useEffect(() => {
    const load = async () => {
      const [requestError, nextProviders] =
        await discoveryRequests.fetchProviders();
      if (requestError || !nextProviders) {
        setError(
          await getRequestErrorMessage(
            requestError,
            'Could not load music providers.',
          ),
        );
        return;
      }
      setProviders(nextProviders);
    };
    void load();
  }, [discoveryRequests, setError]);

  return providers;
}
