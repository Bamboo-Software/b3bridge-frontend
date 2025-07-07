// stores/useBridgeStatusStore.ts
import { create } from "zustand";

interface BridgeStatusState {
//   shouldResetForm: boolean;
//     shouldResetTimer: boolean;
    shouldUpdateState: boolean;
    triggerUpdateState: () => void;
    clearUpdateFlag: () => void;
//   triggerReset: () => void;
//   clearResetFlags: () => void;
}

export const useBridgeStatusStore = create<BridgeStatusState>((set) => ({
//   shouldResetForm: false,
//   shouldResetTimer: false,
 shouldUpdateState: false,
//   triggerReset: () => set({
//     shouldResetForm: true,
//     shouldResetTimer: true,
//   }),

//   clearResetFlags: () => set({
//     shouldResetForm: false,
//     shouldResetTimer: false,
//   }),
   triggerUpdateState: () => set({ shouldUpdateState: true }),
  clearUpdateFlag: () => set({ shouldUpdateState: false }),
}));

