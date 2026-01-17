import { type StateCreator } from 'zustand'
import { User } from '~/zodSchema/auth.schema'

export interface IUserSlice {
  user: User | null
  setUser: (user: User) => void
  clearUser: () => void
}

export const createUserSlice : StateCreator<IUserSlice, [['zustand/devtools', never]], [], IUserSlice> = (set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
})