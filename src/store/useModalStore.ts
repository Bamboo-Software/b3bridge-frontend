import { create } from "zustand";
import { persist } from "zustand/middleware";
type ModalState = {
  isOpen: boolean;
  fromChainIdStore?: number;
  openWalletModal: () => void;
  closeWalletModal: () => void;
  setFromChainIdStore: (id: number | undefined) => void;
};

export const useModalStore = create<ModalState>()(
  persist(
    (set) => ({
      isOpen: false,
      fromChainIdStore: undefined,
      openWalletModal: () => set({ isOpen: true }),
      closeWalletModal: () => set({ isOpen: false }),
      setFromChainIdStore: (id) => set({ fromChainIdStore: id }),
    }),
    {
      name: "modal-store",
      partialize: (state) => ({
        fromChainIdStore: state.fromChainIdStore,
      }),
    }
  )
);
