import { useCallback, useEffect, useState } from 'react';
import { api } from '../index';

let cachedProviders: string[] | null = null;
let providersPromise: Promise<string[]> | null = null;
const listeners = new Set<(providers: string[]) => void>();

function notifyProviders(providers: string[]) {
  listeners.forEach((listener) => {
    listener(providers);
  });
}

export function useAuthCache() {
  const [providers, setProviders] = useState<string[] | null>(cachedProviders);

  useEffect(() => {
    listeners.add(setProviders);
    return () => {
      listeners.delete(setProviders);
    };
  }, []);

  const fetchProviders = useCallback(async () => {
    if (cachedProviders) return cachedProviders;
    if (providersPromise) return providersPromise;

    providersPromise = (async () => {
      const [err, data] = await api.get('/providers', null);
      providersPromise = null;
      if (err || !data) {
        cachedProviders = [];
        notifyProviders(cachedProviders);
        return cachedProviders;
      }

      cachedProviders = data;
      notifyProviders(cachedProviders);
      return cachedProviders;
    })();

    return providersPromise;
  }, []);

  return { providers, fetchProviders };
}
