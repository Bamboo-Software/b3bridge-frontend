import { create } from "zustand";

type ModalState = {
  isOpen: boolean;
  fromChainIdStore?: number;
  openWalletModal: () => void;
  closeWalletModal: () => void;
  setFromChainIdStore: (id: number | undefined) => void;
};

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  fromChainIdStore: undefined,
  openWalletModal: () => set({ isOpen: true }),
  closeWalletModal: () => set({ isOpen: false }),
  setFromChainIdStore: (id) => set({ fromChainIdStore: id }),
}));
