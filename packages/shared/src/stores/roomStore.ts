import { Room } from '@vibes/models';
import { create } from 'zustand';
import { RoomUser } from '../types';

interface RoomState {
  room: Room | null;
  users: RoomUser[];
  userId: string | null;
  isAdmin: boolean;
  nickname: string | null;
  usersCount: number;

  setRoom: (room: Room) => void;
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

  setRoom: (room) => {
    set((state) => {
      const isSameRoom = state.room?.id === room.id;
      const usersCount = room.userCount ?? (isSameRoom ? state.usersCount : 0);

      return {
        room: {
          ...room,
          userId: isSameRoom ? state.room?.userId : room.userId,
        },
        isAdmin: isSameRoom ? state.isAdmin : (room.isAdmin ?? false),
        usersCount,
      };
    });
  },
  setHost: (userId) =>
    set((state) => ({
      room: state.room ? { ...state.room, hostId: userId } : null,
    })),
  setUsers: (users) => set({ users, usersCount: users.length }),
  setUsersCount: (usersCount) => set({ usersCount }),
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
    }),
}));
