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
      // Shared settings broadcasts have no requester identity. Authenticated
      // snapshots and login responses do, and must refresh permissions.
      const isPersonalized = Boolean(room.userId);
      const userId = isPersonalized
        ? room.userId
        : isSameRoom
          ? state.room?.userId
          : undefined;
      let isAdmin = isSameRoom ? state.isAdmin : false;

      if (isPersonalized) isAdmin = room.isAdmin ?? false;
      if (!room.hasPassword) isAdmin = false;

      // Snapshots can finish after a newer presence event, including on reconnect.
      const hasLiveUsersCount = isSameRoom && state.hasLiveUsersCount;
      const usersCount = hasLiveUsersCount
        ? state.usersCount
        : (room.userCount ?? (isSameRoom ? state.usersCount : 0));

      return {
        room: {
          ...room,
          userCount: usersCount,
          userId,
          isAdmin,
        },
        userId: userId ?? null,
        isAdmin,
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
    set((state) => ({
      userId,
      isAdmin,
      nickname: nickname || null,
      room: state.room ? { ...state.room, userId, isAdmin } : null,
    })),
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
