import { StargateTransactionStatus } from '@/utils/enums/transaction'
import type { ITransaction } from '@/utils/interfaces/transaction'
import type { ITokenInfo } from '@/utils/interfaces/token'
import type { IQuoteFee } from '@/utils/interfaces/quote'
import { formatTokenAmount } from '@/utils'
import { getStatusColor, getStatusProgress } from '@/utils/transaction'
import { useUpdateTransaction } from './useUpdateTransactionStatus'


function findFeeToken(fee: IQuoteFee, tokenList: ITokenInfo[] = []): ITokenInfo | undefined {
  if (fee.token) {
    return tokenList.find(t => t.address?.toLowerCase() === fee.token?.toLowerCase())
  }
  return undefined
}

export function useTransactionInfo(tx: ITransaction, tokenList: ITokenInfo[] = []) {
  const liveData = useUpdateTransaction(tx) as Partial<ITransaction>

  const statusColor = getStatusColor(liveData?.status || tx?.status)
  const { percent, label, icon } = getStatusProgress(liveData?.status || tx?.status)

  const fromToken = tx.fromToken
  const toToken = tx.toToken

  const fees = (tx.quote?.fees ?? []).map((fee) => {
    const token = findFeeToken(fee, tokenList)
    return {
      ...fee,
      token,
      amountFormatted: formatTokenAmount(fee.amount, token),
      symbol: token?.symbol || fee.token,
      logo: token?.logo || '',
    }
  })

  return {
    statusColor,
    progress: { percent, label, icon },
    fromToken,
    toToken,
    fromAmountFormatted: tx.fromAmount ?? '',
    toAmountFormatted: tx.toAmount ?? '',
    fees,
    isDelivered: liveData?.status || tx.status === StargateTransactionStatus.DELIVERED,
    status: liveData?.status || tx.status,
    ...liveData
  }
}
