import { create } from 'zustand'

interface RefreshState {
  nonce: number
  bump: () => void
}

/** Global “refresh all polling hooks” tick for home freshness control. */
export const useRefreshStore = create<RefreshState>((set) => ({
  nonce: 0,
  bump: () => set((state) => ({ nonce: state.nonce + 1 })),
}))
