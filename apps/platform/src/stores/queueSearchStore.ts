import type { PlaybackRestriction, SourceType } from '@vibes/models';
import { create } from 'zustand';

export interface QueueSearchItem {
  id: string;
  title: string;
  publisher: string;
  thumbnailUrl: string;
  duration?: string;
  providerUrl?: string;
  source: SourceType;
  playbackRestriction?: PlaybackRestriction;
}

interface QueueSearch {
  roomId: string;
  query: string;
  provider: SourceType;
  results: QueueSearchItem[];
  expiresAt: number;
}

interface QueueSearchState {
  search: QueueSearch | null;
  setSearch: (search: QueueSearch) => void;
}

// Keep only the latest successful search in memory, never in browser storage.
export const useQueueSearchStore = create<QueueSearchState>((set) => ({
  search: null,
  setSearch: (search) => set({ search }),
}));
