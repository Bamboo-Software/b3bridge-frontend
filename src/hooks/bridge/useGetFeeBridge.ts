/* eslint-disable @typescript-eslint/no-explicit-any */
import { useReadContract } from 'wagmi'
import { parseUnits } from 'viem/utils'
import type { Address } from 'viem'
import { useMemo } from 'react'
import { ChainTokenSource } from '@/utils/enums/chain'
import { BridgeActionType } from '@/utils/enums/bridge'
import { getBridgeActionType, getIsOrigin } from '@/utils'
import { blockChainConfig } from '@/utils/constants/chain'
import type { IChainInfo } from '@/utils/interfaces/chain'
import type { ITokenInfo } from '@/utils/interfaces/token'

interface UseGetFeeBridgeProps {
  tokenAddress?: Address
  amount?: string
  fromChain: IChainInfo
  fromToken: ITokenInfo
  toToken: ITokenInfo
  isReady: boolean
}

export function useGetFeeBridge({
  tokenAddress,
  amount,
  fromChain,
  fromToken,
  toToken,
  isReady,
}: UseGetFeeBridgeProps) {
  const actionType = useMemo(() => {
    if (!isReady) return BridgeActionType.Unknown
    const enrichedFrom = { ...fromToken, isOrigin: getIsOrigin(fromToken) }
    const enrichedTo = { ...toToken, isOrigin: getIsOrigin(toToken) }
    return getBridgeActionType(enrichedFrom, enrichedTo)
  }, [fromToken, toToken, isReady])

  const shouldSkip =
    !isReady ||
    !amount ||
    fromChain.source === ChainTokenSource.Stargate

  const parsedAmount = amount ? parseUnits(amount, 18) : 0n

  const isBurnUnlockLocal =
    actionType === BridgeActionType.BurnUnlock &&
    fromChain.source === ChainTokenSource.Local

  const isLockMintLocal =
    actionType === BridgeActionType.LockMint &&
    fromChain.source === ChainTokenSource.Local

  const abi = isBurnUnlockLocal
    ? blockChainConfig.seiBridgeAbi
    : isLockMintLocal
    ? blockChainConfig.ethereumBridgeAbi
    : undefined

  const addressSm = isBurnUnlockLocal
    ? blockChainConfig.seiBridgeAddress
    : isLockMintLocal
    ? blockChainConfig.ethereumBridgeAddress
    : undefined

  const functionName = isBurnUnlockLocal ? 'getFeeEthBridge' : 'getFeeBridge'

  const { data: feeBridge, isLoading } = useReadContract({
    abi,
    address: addressSm,
    functionName,
    args: [tokenAddress as `0x${string}`, parsedAmount],
    query: {
      enabled: !shouldSkip && !!abi && !!addressSm,
    },
    chainId: fromChain?.id,
  })

  return {
    feeBridge,
    isLoading,
  }
}
