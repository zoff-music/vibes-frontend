import { createRoomDiscoveryRequests } from '@vibes/api';
import type { Providers } from '@vibes/models';
import { useEffect, useState } from 'react';
import { getRequestErrorMessage, mobileApi } from '@/lib/api';

const discoveryRequests = createRoomDiscoveryRequests(mobileApi);

export function useProviders(setError: (message: string) => void): Providers {
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
  }, [setError]);

  return providers;
}
