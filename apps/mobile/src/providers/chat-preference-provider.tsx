import { useFetcher, useRouteLoaderData } from '@vibes/native-router';
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { ChatPreferenceActionData } from '@/routes/preferences.chat/action';
import type { ChatPreferenceData } from '@/routes/preferences.chat/loader';

interface ChatPreference {
  enabled: boolean;
  loaded: boolean;
  warning: string;
  setEnabled: (enabled: boolean) => Promise<void>;
}
const Context = createContext<ChatPreference | null>(null);
export function ChatPreferenceProvider({ children }: PropsWithChildren) {
  const data = useRouteLoaderData<ChatPreferenceData>('preferences.chat');
  const [, fetcher] = useFetcher<ChatPreferenceActionData>({
    routeId: 'preferences.chat',
  });
  const [enabled, setValue] = useState(false);
  const [warning, setWarning] = useState('');
  useEffect(() => {
    if (data) setValue(data.enabled);
  }, [data]);
  const setEnabled = async (next: boolean) => {
    setValue(next);
    const result = await fetcher.submit({ enabled: next });
    setWarning(result.error || result.data?.warning || '');
  };
  return (
    <Context.Provider
      value={{ enabled, loaded: Boolean(data), warning, setEnabled }}
    >
      {children}
    </Context.Provider>
  );
}
export function useChatPreference() {
  const context = useContext(Context);
  if (!context) throw new Error('ChatPreferenceProvider is required');
  return context;
}
