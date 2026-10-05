import { create } from 'zustand';
import { PlaylistItem } from '../types';

interface QueueState {
  playlistItems: PlaylistItem[];

  setPlaylistItems: (playlistItems: PlaylistItem[]) => void;
  addPlaylistItem: (playlistItem: PlaylistItem) => void;
  removePlaylistItem: (playlistItemId: string) => void;
  positionPlaylistItem: (playlistItem: PlaylistItem, position: number) => void;
  updatePlaylistItem: (playlistItem: PlaylistItem) => void;
}

export const useQueueStore = create<QueueState>((set) => ({
  playlistItems: [],

  // Preserve the authoritative order supplied by the backend.
  setPlaylistItems: (playlistItems) =>
    set({ playlistItems: [...playlistItems] }),

  addPlaylistItem: (playlistItem) =>
    set((state) => {
      if (state.playlistItems.some((s) => s.id === playlistItem.id)) {
        return state;
      }
      return {
        playlistItems: [...state.playlistItems, playlistItem], // Backend handles sorting
      };
    }),

  removePlaylistItem: (playlistItemId) =>
    set((state) => ({
      playlistItems: state.playlistItems.filter((s) => s.id !== playlistItemId),
    })),

  positionPlaylistItem: (playlistItem, position) =>
    set((state) => {
      const playlistItems = state.playlistItems.filter(
        (item) => item.id !== playlistItem.id,
      );
      const boundedPosition = Math.min(
        Math.max(position, 0),
        playlistItems.length,
      );
      playlistItems.splice(boundedPosition, 0, playlistItem);
      return { playlistItems };
    }),

  updatePlaylistItem: (playlistItem) =>
    set((state) => ({
      playlistItems: state.playlistItems.map((s) =>
        s.id === playlistItem.id ? playlistItem : s,
      ),
    })),
}));
