import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AutoRejoinPreference {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

export const useAutoRejoinStore = create<AutoRejoinPreference>()(
  persist(
    (set) => ({ enabled: false, setEnabled: (enabled) => set({ enabled }) }),
    {
      name: 'zoff-auto-rejoin',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
