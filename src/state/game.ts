import { create } from 'zustand'

export type Phase = 'menu' | 'play'

interface GameState {
  phase: Phase
  fragments: number
  setPhase: (p: Phase) => void
  collectFragment: () => void
}

export const useGame = create<GameState>((set) => ({
  phase: 'menu',
  fragments: 0,
  setPhase: (phase) => set({ phase }),
  collectFragment: () => set((s) => ({ fragments: s.fragments + 1 })),
}))
