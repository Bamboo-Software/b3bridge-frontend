import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ITransaction } from '@/utils/interfaces/transaction'
import { LocalStorageKey } from '@/utils/enums/localStorage'

interface TransactionStore {
  allTx: Record<string, ITransaction[]>
  setAllTx: (txs: Record<string, ITransaction[]>) => void
  addTransaction: (address: string, tx: ITransaction) => void
  clearTransactions: () => void
}

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set, get) => ({
      allTx: {},

      setAllTx: (txs) => {
        set({ allTx: txs })
      },

      addTransaction: (address, tx) => {
        const current = get().allTx
        set({
          allTx: {
            ...current,
            [address]: [tx, ...(current[address] || [])],
          },
        })
      },

      clearTransactions: () => set({ allTx: {} }),
    }),
    {
      name: LocalStorageKey.Transaction,
    }
  )
)
