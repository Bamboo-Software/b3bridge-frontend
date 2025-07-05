import { ChainTokenSource } from '@/utils/enums/chain'
import type { ITransaction } from '@/utils/interfaces/transaction'
import { useLocalTransactionStatus } from './useUpdateLocalTransactionStatus'
import { useStargateTransaction } from './useUpdateStargateTransactionStatus'


export function useUpdateTransaction(tx: ITransaction, enabled = true) {
  const stargateData = useStargateTransaction(tx, enabled && tx.source === ChainTokenSource.Stargate)
  const localStatus = useLocalTransactionStatus(tx, enabled && tx.source === ChainTokenSource.Local)

  return tx.source === ChainTokenSource.Stargate ? stargateData : localStatus
}
