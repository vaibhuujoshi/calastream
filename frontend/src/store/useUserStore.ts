import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Gender = "Male" | "Female" | "Other";

export interface User {
  id: string;
  username: string;
  gender: Gender;
  channelName: string;
  banner: string | null;
  profilePicture: string | null;
  subscriberCount: number;
  description: string | null;
}

export type ClientUserProfile = Omit<User, "id">;

interface UserState {
  user: ClientUserProfile | null;
  isLoggedIn: boolean;
  isInitializing: boolean; // Added to prevent screen flashes on refresh
  setUser: (user: ClientUserProfile) => void;
  setInitializing: (isInitializing: boolean) => void;
  updateSubscriberCount: (count: number) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      isInitializing: true,
      setUser: (user) => set({ user, isLoggedIn: true, isInitializing: false }),
      setInitializing: (isInitializing) => set({ isInitializing }),
      updateSubscriberCount: (count) =>
        set((state) => ({
          user: state.user ? { ...state.user, subscriberCount: count } : null,
        })),
      logout: () => set({ user: null, isLoggedIn: false, isInitializing: false }),
    }),
    {
      name: "calastream-session-storage",
      partialize: (state) => ({ user: state.user, isLoggedIn: state.isLoggedIn }), // Only persist clean values
    }
  )
);