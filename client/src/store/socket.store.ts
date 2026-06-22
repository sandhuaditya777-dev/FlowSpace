import { create } from 'zustand';

export interface OnlineUser {
  userId: string;
  name?: string;
}

interface SocketState {
  connected: boolean;
  // room → list of online userIds
  roomPresence: Record<string, string[]>;

  setConnected: (v: boolean) => void;
  setRoomPresence: (room: string, users: string[]) => void;
  clearPresence: () => void;
}

export const useSocketStore = create<SocketState>((set) => ({
  connected: false,
  roomPresence: {},

  setConnected: (v) => set({ connected: v }),
  setRoomPresence: (room, users) =>
    set((state) => ({
      roomPresence: { ...state.roomPresence, [room]: users },
    })),
  clearPresence: () => set({ roomPresence: {} }),
}));
