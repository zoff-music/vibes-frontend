import { useFetcher, useRouteLoaderData } from '@vibes/native-router';
import type { PropsWithChildren } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { KonamiModeActionData } from '@/routes/preferences.konami/action';

interface KonamiModeState {
  booting: boolean;
  enabled: boolean;
  warning: string;
}

interface KonamiModeContextValue extends KonamiModeState {
  completeBoot: () => void;
  toggle: () => Promise<void>;
}

const KonamiModeContext = createContext<KonamiModeContextValue | null>(null);

export function KonamiModeProvider({ children }: PropsWithChildren) {
  const [, preferenceFetcher] = useFetcher<KonamiModeActionData>({
    routeId: 'preferences.konami',
  });
  const loadedEnabled =
    useRouteLoaderData<boolean>('preferences.konami') ?? false;
  const [enabled, setEnabled] = useState(loadedEnabled);
  const [booting, setBooting] = useState(false);
  const [warning, setWarning] = useState('');

  useEffect(() => {
    if (typeof loadedEnabled !== 'boolean') return;
    setEnabled(loadedEnabled);
  }, [loadedEnabled]);

  const completeBoot = useCallback(() => {
    setBooting(false);
  }, []);

  const toggle = useCallback(async () => {
    const nextEnabled = !enabled;
    const result = await preferenceFetcher.submit(nextEnabled);
    if (!result.data) return;
    setEnabled(result.data.enabled);
    setWarning(result.data.warning);
    setBooting(result.data.enabled);
  }, [enabled, preferenceFetcher.submit]);

  const value = useMemo<KonamiModeContextValue>(
    () => ({ booting, completeBoot, enabled, toggle, warning }),
    [booting, completeBoot, enabled, toggle, warning],
  );

  return (
    <KonamiModeContext.Provider value={value}>
      {children}
    </KonamiModeContext.Provider>
  );
}

export function useKonamiMode() {
  const context = useContext(KonamiModeContext);
  if (!context) {
    throw new Error('useKonamiMode must be used inside KonamiModeProvider');
  }
  return context;
}
