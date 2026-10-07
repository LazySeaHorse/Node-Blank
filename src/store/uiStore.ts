import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { NodeKind } from '@/model/types';

export type Theme = 'light' | 'dark';
export type AiTab = 'connect' | 'activity';

interface UiState {
  /** Node kind created by double-clicking the canvas. */
  tool: NodeKind;
  theme: Theme;
  searchOpen: boolean;
  searchQuery: string;
  aiPanelOpen: boolean;
  aiTab: AiTab;
  setTool: (tool: NodeKind) => void;
  toggleTheme: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  setSearchQuery: (query: string) => void;
  toggleAiPanel: () => void;
  /** Opens the AI panel, optionally on a given tab. */
  openAiPanel: (tab?: AiTab) => void;
  setAiTab: (tab: AiTab) => void;
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
      aiPanelOpen: false,
      aiTab: 'connect',
      setTool: (tool) => set({ tool }),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      openSearch: () => set({ searchOpen: true }),
      closeSearch: () => set({ searchOpen: false, searchQuery: '' }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      toggleAiPanel: () => set((s) => ({ aiPanelOpen: !s.aiPanelOpen })),
      openAiPanel: (tab) => set((s) => ({ aiPanelOpen: true, aiTab: tab ?? s.aiTab })),
      setAiTab: (aiTab) => set({ aiTab }),
    }),
    { name: 'node-blank-ui', partialize: ({ tool, theme }) => ({ tool, theme }) },
  ),
);
