import { safeWrapAsync } from '@vibes/shared';
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { LoadingScreen } from '@/components/loading-screen';
import { ErrorBoundary } from '@/components/route-error-boundary';
import { loadChatPreference } from '@/requests/load-chat-preference';
import { loadDiscovery } from '@/requests/load-discovery';
import { loadPlayerPreference } from '@/requests/load-player-preference';
import { loadProfile } from '@/requests/load-profile';
import { loadRemoteSession } from '@/requests/load-remote-session';
import { loadThemePreference } from '@/requests/load-theme-preference';

async function loadInitialData(signal: AbortSignal) {
  const args = { params: {}, signal };
  const [discovery, chat, player, theme, remoteSession, profile] =
    await Promise.all([
      loadDiscovery(args),
      loadChatPreference(),
      loadPlayerPreference(),
      loadThemePreference(),
      loadRemoteSession(),
      loadProfile(args),
    ]);

  if (theme.error || profile.error) {
    throw new Error(theme.error || profile.error);
  }

  return {
    discovery: discovery.data,
    chat: chat.data,
    player: player.data,
    theme: theme.data,
    remoteSession: remoteSession.data,
    profile: profile.data,
  };
}

type InitialData = Awaited<ReturnType<typeof loadInitialData>>;
const Context = createContext<InitialData | null>(null);

export function InitialDataProvider({ children }: PropsWithChildren) {
  const [data, setData] = useState<InitialData | null>(null);
  const [error, setError] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const load = useCallback(() => {
    controller.current?.abort();
    const request = new AbortController();
    controller.current = request;
    setError(false);
    void safeWrapAsync(loadInitialData(request.signal)).then(
      ([failure, result]) => {
        if (request.signal.aborted) return;

        setError(Boolean(failure));
        setData(result);
      },
    );
  }, []);

  useEffect(() => {
    load();

    return () => controller.current?.abort();
  }, [load]);

  if (error) return <ErrorBoundary retry={load} />;
  if (!data) return <LoadingScreen />;

  return <Context.Provider value={data}>{children}</Context.Provider>;
}

export function useInitialData() {
  const data = useContext(Context);

  if (!data) throw new Error('InitialDataProvider is required');

  return data;
}
