// store/portfolioStore.ts
import { create } from 'zustand'
import type { Block, UserProfile } from '@/types'

interface PortfolioStore {
  profile:    UserProfile | null
  blocks:     Block[]
  loading:    boolean

  setProfile: (p: UserProfile)                  => void
  setBlocks:  (b: Block[])                      => void
  addBlock:   (b: Block)                         => void
  updateBlock:(id: string, data: Partial<Block>) => void
  removeBlock:(id: string)                       => void
  reorder:    (blocks: Block[])                  => void
  setLoading: (v: boolean)                       => void
}

export const usePortfolioStore = create<PortfolioStore>((set) => ({
  profile: null,
  blocks:  [],
  loading: false,

  setProfile: (profile) => set({ profile }),
  setBlocks:  (blocks)  => set({ blocks }),
  setLoading: (loading) => set({ loading }),

  addBlock: (block) =>
    set((s) => ({ blocks: [...s.blocks, block] })),

  updateBlock: (id, data) =>
    set((s) => ({
      blocks: s.blocks.map((b) => (b.id === id ? { ...b, ...data } : b)),
    })),

  removeBlock: (id) =>
    set((s) => ({ blocks: s.blocks.filter((b) => b.id !== id) })),

  reorder: (blocks) => set({ blocks }),
}))