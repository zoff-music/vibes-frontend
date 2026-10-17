import { useMutation } from '@vibes/shared/use-request';
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useInitialData } from '@/providers/initial-data-provider';
import { updateChatPreference } from '@/requests/update-chat-preference';

interface ChatPreference {
  enabled: boolean;
  loaded: boolean;
  warning: string;
  setEnabled: (enabled: boolean) => Promise<void>;
}
const Context = createContext<ChatPreference | null>(null);

export function ChatPreferenceProvider({ children }: PropsWithChildren) {
  const data = useInitialData().chat;
  const [, fetcherSubmit] = useMutation(updateChatPreference);
  const [enabled, setValue] = useState(false);
  const [warning, setWarning] = useState('');
  useEffect(() => {
    if (data) setValue(data.enabled);
  }, [data]);
  const setEnabled = async (next: boolean) => {
    setValue(next);
    const result = await fetcherSubmit({ enabled: next });
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
