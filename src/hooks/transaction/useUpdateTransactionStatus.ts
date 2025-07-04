import { ChainTokenSource } from '@/utils/enums/chain'
import type { ITransaction } from '@/utils/interfaces/transaction'
import { useStargateTransactionStatus } from './useUpdateStargateTransactionStatus'
import { useLocalTransactionStatus } from './useUpdateLocalTransactionStatus'


export function useUpdateTransactionStatus(tx: ITransaction, enabled = true) {
  const stargateStatus = useStargateTransactionStatus(tx, enabled && tx.source === ChainTokenSource.Stargate)
  const localStatus = useLocalTransactionStatus(tx, enabled && tx.source === ChainTokenSource.Local)

  return tx.source === ChainTokenSource.Stargate ? stargateStatus : localStatus
}
