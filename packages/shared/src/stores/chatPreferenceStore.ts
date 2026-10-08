import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface ChatPreference {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

export const useChatPreferenceStore = create<ChatPreference>()(
  persist(
    (set) => ({ enabled: true, setEnabled: (enabled) => set({ enabled }) }),
    {
      name: 'zoff-chat-preference',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
