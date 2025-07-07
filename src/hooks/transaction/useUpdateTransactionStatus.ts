import { ChainTokenSource } from '@/utils/enums/chain'
import type { ITransaction } from '@/utils/interfaces/transaction'
import { useStargateTransaction } from './useUpdateStargateTransactionStatus'
// import { useLocalTransactionStatus } from './useUpdateLocalTransactionStatus'


export function useUpdateTransaction(tx: ITransaction, enabled = true) {
  const stargateData = useStargateTransaction(tx, enabled && tx.source === ChainTokenSource.Stargate)
  // const localStatus = useLocalTransactionStatus(tx)

  return tx.source === ChainTokenSource.Stargate ? stargateData : null
}
