import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface PersistentPlayerPreference {
  enabled: boolean;
  activeRoomId: string | null;
  setActiveRoomId: (activeRoomId: string | null) => void;
  setEnabled: (enabled: boolean) => void;
}

export const usePersistentPlayerStore = create<PersistentPlayerPreference>()(
  persist(
    (set) => ({
      enabled: false,
      activeRoomId: null,
      setActiveRoomId: (activeRoomId) => set({ activeRoomId }),
      setEnabled: (enabled) => set({ enabled }),
    }),
    {
      name: 'zoff-persistent-player',
      storage: createJSONStorage(() => localStorage),
      partialize: ({ enabled }) => ({ enabled }),
    },
  ),
);
