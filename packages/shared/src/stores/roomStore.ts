import type { RoomUser, RoomV2 } from '@vibes/models';
import { create } from 'zustand';

interface RoomState {
  room: RoomV2 | null;
  users: RoomUser[];
  userId: string | null;
  isAdmin: boolean;
  nickname: string | null;
  usersCount: number;
  hasLiveUsersCount: boolean;

  setRoom: (room: RoomV2) => void;
  setHost: (userId: string) => void;
  setUsers: (users: RoomUser[]) => void;
  setUsersCount: (count: number) => void;
  setSession: (userId: string, isAdmin: boolean, nickname?: string) => void;
  reset: () => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  room: null,
  users: [],
  userId: null,
  isAdmin: false,
  nickname: null,
  usersCount: 0,
  hasLiveUsersCount: false,

  setRoom: (room) => {
    set((state) => {
      const isSameRoom = state.room?.id === room.id;
      // Snapshots can finish after a newer presence event, including on reconnect.
      const hasLiveUsersCount = isSameRoom && state.hasLiveUsersCount;
      const usersCount = hasLiveUsersCount
        ? state.usersCount
        : (room.userCount ?? (isSameRoom ? state.usersCount : 0));

      return {
        room: {
          ...room,
          userCount: usersCount,
          userId: isSameRoom ? state.room?.userId : room.userId,
        },
        isAdmin: isSameRoom ? state.isAdmin : (room.isAdmin ?? false),
        usersCount,
        hasLiveUsersCount,
      };
    });
  },
  setHost: (userId) =>
    set((state) => ({
      room: state.room ? { ...state.room, hostId: userId } : null,
    })),
  setUsers: (users) =>
    set({ users, usersCount: users.length, hasLiveUsersCount: true }),
  setUsersCount: (usersCount) =>
    set((state) => ({
      usersCount,
      hasLiveUsersCount: true,
      room: state.room ? { ...state.room, userCount: usersCount } : null,
    })),
  setSession: (userId, isAdmin, nickname) =>
    set({
      userId,
      isAdmin,
      nickname: nickname || null,
    }),
  reset: () =>
    set({
      room: null,
      users: [],
      userId: null,
      isAdmin: false,
      nickname: null,
      usersCount: 0,
      hasLiveUsersCount: false,
    }),
}));
