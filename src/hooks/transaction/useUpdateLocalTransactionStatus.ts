/* eslint-disable @typescript-eslint/no-unused-vars */
import type { ITransaction } from '@/utils/interfaces/transaction';

export function useLocalTransactionStatus(tx: ITransaction, enabled: boolean) {
  return tx.status
}