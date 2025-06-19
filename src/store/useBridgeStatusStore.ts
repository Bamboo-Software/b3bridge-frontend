// stores/useBridgeStatusStore.ts
import { create } from "zustand";

interface BridgeStatusState {
  shouldResetForm: boolean;
  shouldResetTimer: boolean;
  triggerReset: () => void;
  clearResetFlags: () => void;
}

export const useBridgeStatusStore = create<BridgeStatusState>((set) => ({
  shouldResetForm: false,
  shouldResetTimer: false,

  triggerReset: () => set({
    shouldResetForm: true,
    shouldResetTimer: true,
  }),

  clearResetFlags: () => set({
    shouldResetForm: false,
    shouldResetTimer: false,
  }),
}));
