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
import { ErrorBoundary } from '@/components/route-error-boundary';
import { HydrateFallback } from '@/components/route-fallback';
import { loader as loadIndexRequest } from '@/routes/_index/loader';
import { loader as loadPreferencesChatRequest } from '@/routes/preferences.chat/loader';
import { loader as loadPreferencesPlayerRequest } from '@/routes/preferences.player/loader';
import { loader as loadPreferencesThemeRequest } from '@/routes/preferences.theme/loader';
import { loader as loadRemotesSessionRequest } from '@/routes/remotes.session/loader';
import { loader as loadSessionsProfileRequest } from '@/routes/sessions.profile/loader';

async function loadInitialData(signal: AbortSignal) {
  const args = { params: {}, signal };
  const [discovery, chat, player, theme, remoteSession, profile] =
    await Promise.all([
      loadIndexRequest(args),
      loadPreferencesChatRequest(),
      loadPreferencesPlayerRequest(),
      loadPreferencesThemeRequest(),
      loadRemotesSessionRequest(),
      loadSessionsProfileRequest(args),
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
  if (!data) return <HydrateFallback />;

  return <Context.Provider value={data}>{children}</Context.Provider>;
}

export function useInitialData() {
  const data = useContext(Context);

  if (!data) throw new Error('InitialDataProvider is required');

  return data;
}
