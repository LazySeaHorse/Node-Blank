import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { NodeKind } from '@/model/types';

export type Theme = 'light' | 'dark';

interface UiState {
  /** Node kind created by double-clicking the canvas. */
  tool: NodeKind;
  theme: Theme;
  searchOpen: boolean;
  searchQuery: string;
  setTool: (tool: NodeKind) => void;
  toggleTheme: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  setSearchQuery: (query: string) => void;
}

const systemTheme = (): Theme =>
  window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      tool: 'text',
      theme: systemTheme(),
      searchOpen: false,
      searchQuery: '',
      setTool: (tool) => set({ tool }),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      openSearch: () => set({ searchOpen: true }),
      closeSearch: () => set({ searchOpen: false, searchQuery: '' }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
    }),
    { name: 'node-blank-ui', partialize: ({ tool, theme }) => ({ tool, theme }) },
  ),
);
