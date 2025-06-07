import { create } from "zustand";

type ModalState = {
  isOpen: boolean;
  openWalletModal: () => void;
  closeWalletModal: () => void;
};

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  openWalletModal: () => set({ isOpen: true }),
  closeWalletModal: () => set({ isOpen: false }),
}));