// import { useReadContract } from 'wagmi'
// import type { ITransaction } from '@/utils/interfaces/transaction'
// import type { IChainInfo } from '@/utils/interfaces/chain'
// import { LocalStorageKey } from '@/utils/enums/localStorage'
// import { blockChainConfig } from '@/utils/constants/chain'
// import { BlockchainNameEnum } from '@/utils/enums/chain'
// import { useEffect } from 'react'
// import type { CCIPTransactionStatus } from '@/utils/enums/transaction'
// import { useTransactionStore } from '../useTransactionStore'

// interface TransactionLocalMeta {
//   messageId?: `0x${string}`
//   fromChainName?: string
// }

// function getLatestMessageMetaFor(address: string): TransactionLocalMeta {
//   try {
//     const raw = localStorage.getItem(LocalStorageKey.Transaction)
//     if (!raw) return {}

//     const parsed = JSON.parse(raw)
//     const tx = parsed?.state?.allTx?.[address]?.[0]
//     return {
//       messageId: tx?.messageId,
//       fromChainName: tx?.fromChain?.name,
//     }
//   } catch (err) {
//     console.error('Failed to parse localStorage:', err)
//     return {}
//   }
// }

// export function useLocalTransactionStatus(
//   tx: ITransaction,
//   enabled: boolean,
//   fromChain?: IChainInfo
// ) {
//   const { updateTransactionStatus } = useTransactionStore()
//   const { messageId: fallbackMessageId, fromChainName: fallbackChainName } =
//     getLatestMessageMetaFor(tx.userAddress)

//   const messageId = tx.messageId || fallbackMessageId
//   const fromChainName = fromChain?.name || fallbackChainName || ''
//   console.log("🚀 ~ fromChainName:", fromChainName)

//   let routerAddress: `0x${string}` | undefined

//   switch (fromChainName) {
//     case BlockchainNameEnum.ethereum:
//       routerAddress = blockChainConfig.ethereumRouterAddress
//       break
//     case BlockchainNameEnum.sei:
//       routerAddress = blockChainConfig.seiRouterAddress
//       break
//     default:
//       console.warn(`Unknown chain name: ${fromChainName}`)
//       break
//   }

//   console.log(`🚀 ~ {
//     address: routerAddress!,
//     abi: blockChainConfig.routerCCIPAbi,
//     functionName: 'getMessageStatus',
//     args: messageId ? [messageId] : undefined,
//     query: {
//       enabled: Boolean(enabled && messageId && routerAddress),
//       staleTime: 5000,
//     },
//   }:`, {
//     address: routerAddress!,
//     abi: blockChainConfig.routerCCIPAbi,
//     functionName: 'getMessageStatus',
//     args: messageId ? [messageId] : undefined,
//     query: {
//       enabled: Boolean(enabled && messageId && routerAddress),
//       staleTime: 5000,
//     },
//   })
//   console.log("🚀 ~ fromChain?.id:", fromChain?.id)
//   const status = useReadContract({
//     address: routerAddress!,
//     abi: blockChainConfig.routerCCIPAbi,
//     functionName: 'getMessageStatus',
//     args: messageId ? [messageId] : undefined,
//     query: {
//       enabled: Boolean(enabled && messageId && routerAddress),
//       staleTime: 5000,
//     },
//     chainId: fromChain?.id,
//   })
//   console.log("🚀 ~ status:", status.data)
//   console.log("🚀 ~ status:", status.fetchStatus)
//   console.log("🚀 ~ status:", status)
// useEffect(() => {
//     if (status.status && messageId) {
//       updateTransactionStatus(tx.userAddress, messageId, status.data as CCIPTransactionStatus)
//     }
//   }, [status.data, messageId])
//   return {
//     ...status,
//     chainName: fromChainName || 'Unknown',
//   }
// }
import { useEffect, useState } from 'react'
import { useTransactionStore } from '@/hooks/useTransactionStore'
import type { ITransaction } from '@/utils/interfaces/transaction'

export function useLocalTransactionStatus(
  tx: ITransaction,
  enabled: boolean = true
) {
  const { updateTransactionCreatedAt } = useTransactionStore()
  const [elapsed, setElapsed] = useState('')

  useEffect(() => {
    if (enabled && !tx.createdAt) {
      updateTransactionCreatedAt(tx.userAddress, tx.txHash, Date.now())
    }
  }, [enabled, tx.createdAt, tx.userAddress, tx.txHash, updateTransactionCreatedAt])

  useEffect(() => {
    if (!enabled) return
    const createdAt = tx.createdAt ?? Date.now()

    const update = () => {
      const diff = Date.now() - createdAt
      const seconds = Math.floor(diff / 1000)
      const minutes = Math.floor(seconds / 60)
      const hours = Math.floor(minutes / 60)

      if (hours > 0) setElapsed(`${hours}h ${minutes % 60}m ago`)
      else if (minutes > 0) setElapsed(`${minutes}m ${seconds % 60}s ago`)
      else setElapsed(`${seconds}s ago`)
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [enabled, tx.createdAt])

  return elapsed
}
