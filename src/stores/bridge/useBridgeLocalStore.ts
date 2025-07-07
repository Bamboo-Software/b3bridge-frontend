// store/useBridgeStore.ts
import type { ITransaction } from '@/utils/interfaces/transaction';
import { create } from 'zustand';

interface BridgeLocalState {
  isBridging: boolean;
  error: string | null;
  currentTxHash?: `0x${string}`;
  transaction?: ITransaction;
  messageId?: string;
  setBridgeState: (newState: Partial<BridgeLocalState>) => void;
}

export const useBridgeStore = create<BridgeLocalState>((set) => ({
  isBridging: false,
  error: null,
  nativeLockHash: undefined,
  erc20LockHash: undefined,
  burnWrappedHash: undefined,
  burnHash: undefined,
  messageId:undefined,
  transaction: undefined,
  setBridgeState: (newState) => set((state) => ({ ...state, ...newState })),
}));
