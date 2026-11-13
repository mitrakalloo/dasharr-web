import { create } from 'zustand'

interface SheetState {
  openCount: number
  open: () => void
  close: () => void
}

export const useSheetStore = create<SheetState>((set) => ({
  openCount: 0,
  open: () => set((state) => ({ openCount: state.openCount + 1 })),
  close: () => set((state) => ({ openCount: Math.max(0, state.openCount - 1) })),
}))

export function useSheetOpen(): boolean {
  return useSheetStore((state) => state.openCount > 0)
}
