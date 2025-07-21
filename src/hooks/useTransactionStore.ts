import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ITransaction } from '@/utils/interfaces/transaction'
import { LocalStorageKey } from '@/utils/enums/local-storage'

interface TransactionStore {
  allTx: Record<string, ITransaction[]>
  setAllTx: (txs: Record<string, ITransaction[]>) => void
  addTransaction: (address: string, tx: ITransaction) => void
  updateTransactionStatus: (address: string, messageId: string, status: ITransaction['status']) => void
  updateTransactionByTxHash: (address: string, txHash: string, update: Partial<ITransaction>) => void
  clearTransactions: () => void
    _hasHydrated: boolean
  setHasHydrated: (v: boolean) => void
}

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set, get) => ({
      allTx: {},
      setAllTx: (txs) => set({ allTx: txs }),
      addTransaction: (address, tx) => {
        const current = get().allTx;
        set({
          allTx: {
            ...current,
            [address]: [tx, ...(current[address] || [])],
          },
        });
      },
      // updateTransactionCreatedAt: (address, txHash, createdAt) => {
      //   const current = get().allTx;
      //   const userTxs = current[address] || [];
      //   const updatedTxs = userTxs.map((tx) =>
      //     tx.txHash === txHash ? { ...tx, createdAt } : tx
      //   );
      //   set({
      //     allTx: {
      //       ...current,
      //       [address]: updatedTxs,
      //     },
      //   });
      // },
      updateTransactionStatus: (address, messageId, status) => {
        const current = get().allTx;
        const userTxs = current[address] || [];
        const updatedTxs = userTxs.map((tx) =>
          tx.messageId === messageId ? { ...tx, status } : tx
        );
        set({
          allTx: {
            ...current,
            [address]: updatedTxs,
          },
        });
      },
      updateTransactionByTxHash: (address, txHash, update) => {
        const current = get().allTx;
        const userTxs = current[address] || [];
        const updatedTxs = userTxs.map((tx) =>
          tx.txHash === txHash ? { ...tx, ...update } : tx
        );
        set({
          allTx: {
            ...current,
            [address]: updatedTxs,
          },
        });
      },
      clearTransactions: () => set({ allTx: {} }),
      _hasHydrated: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),
    }),
    {
      name: LocalStorageKey.Transaction,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

