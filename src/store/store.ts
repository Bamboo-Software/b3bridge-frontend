import { create } from 'zustand';

interface StoreState {
  mousePosition: { x: number; y: number };
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
}

export const useStore = create<StoreState>((set) => ({
  mousePosition: { x: 0, y: 0 },
  isGenerating: false,
  setIsGenerating: (isGenerating) => set({ isGenerating }),
}));