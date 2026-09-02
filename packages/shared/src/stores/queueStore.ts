import { create } from 'zustand';
import { Song } from '../types';

interface QueueState {
  songs: Song[];

  setSongs: (songs: Song[]) => void;
  addSong: (song: Song) => void;
  removeSong: (songId: string) => void;
  positionSong: (song: Song, position: number) => void;
  updateSong: (song: Song) => void;
}

export const useQueueStore = create<QueueState>((set) => ({
  songs: [],

  setSongs: (songs) => set({ songs: [...songs] }), // Songs are already sorted by backend (vote_count DESC, added_at ASC)

  addSong: (song) =>
    set((state) => {
      if (state.songs.some((s) => s.id === song.id)) {
        return state;
      }
      return {
        songs: [...state.songs, song], // Backend handles sorting
      };
    }),

  removeSong: (songId) =>
    set((state) => ({
      songs: state.songs.filter((s) => s.id !== songId),
    })),

  positionSong: (song, position) =>
    set((state) => {
      const songs = state.songs.filter((item) => item.id !== song.id);
      const boundedPosition = Math.min(Math.max(position, 0), songs.length);
      songs.splice(boundedPosition, 0, song);
      return { songs };
    }),

  updateSong: (song) =>
    set((state) => ({
      songs: state.songs.map((s) => (s.id === song.id ? song : s)),
    })),
}));
