import { StargateTransactionStatus } from '@/utils/enums/transaction'
import type { ITransaction } from '@/utils/interfaces/transaction'
import type { ITokenInfo } from '@/utils/interfaces/token'
import type { IQuoteFee } from '@/utils/interfaces/quote'
import { formatTokenAmount } from '@/utils'
import { useUpdateTransactionStatus } from './useUpdateTransactionStatus'
import { getStatusColor, getStatusProgress } from '@/utils/transaction'


function findFeeToken(fee: IQuoteFee, tokenList: ITokenInfo[] = []): ITokenInfo | undefined {
  if (fee.token) {
    return tokenList.find(t => t.address?.toLowerCase() === fee.token?.toLowerCase())
  }
  return undefined
}

export function useTransactionInfo(tx: ITransaction, tokenList: ITokenInfo[] = []) {
  const liveStatus = useUpdateTransactionStatus(tx)

  const statusColor = getStatusColor(liveStatus)
  const { percent, label, icon } = getStatusProgress(liveStatus)

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
    fromAmountFormatted: formatTokenAmount(tx.fromAmount ?? '', fromToken),
    toAmountFormatted: formatTokenAmount(tx.toAmount ?? '', toToken),
    fees,
    isDelivered: liveStatus === StargateTransactionStatus.DELIVERED,
    status: liveStatus,
  }
}
