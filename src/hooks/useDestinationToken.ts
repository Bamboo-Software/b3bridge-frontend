import { useEffect, useState } from 'react'
import { getCrossChainTokenAddress } from '@/utils/blockchain/chain'
import { useTokenList } from '@/hooks/useTokenList'
import type { ITokenInfo } from '@/utils/interfaces/token'
import type { IChainInfo } from '@/utils/interfaces/chain'
import { ChainTokenSource } from '@/utils/enums/chain'
import { getTokenData } from '@/utils/blockchain/token'
import type { Address } from 'viem'

export function useDestinationToken(
  srcToken?: ITokenInfo | null,
  srcChain?: IChainInfo | null,
  destChain?: IChainInfo | null
): ITokenInfo | undefined {
  const [destToken, setDestToken] = useState<ITokenInfo | undefined>(undefined)

  const isReady = !!srcToken && !!srcChain && !!destChain;

  const { data: destTokenList } = useTokenList(
    isReady ? destChain : undefined,
    isReady ? srcChain.chainKey : undefined,
    isReady ? srcToken.address : undefined
  )

  useEffect(() => {
    if (!isReady) {
      setDestToken(undefined)
      return
    }

    let cancelled = false

    async function handleLocalToken() {
      if (
        srcChain?.source === ChainTokenSource.Local &&
        srcToken?.address &&
        srcChain.id &&
        destChain?.id
      ) {
        const destTokenAddress = getCrossChainTokenAddress(
          srcChain.id,
          destChain.id,
          srcToken.address.toLowerCase()
        )
        if (!destTokenAddress) {
          setDestToken(undefined)
          return
        }
        const data = await getTokenData(destChain.id, destTokenAddress as Address)
        if (!cancelled) {
          setDestToken({
            ...data,
            symbol: data.symbol,
            address: destTokenAddress as Address,
            chainId: destChain.id,
          } as ITokenInfo)
        }
      }
    }

    if (srcChain?.source === ChainTokenSource.Local) {
      setDestToken(undefined)
      handleLocalToken()
      return () => {
        cancelled = true
      }
    }

    if (
      srcChain?.source === ChainTokenSource.Stargate &&
      destTokenList &&
      destChain?.chainKey
    ) {
      const found = destTokenList.find(
        token => token.chainKey === destChain.chainKey
      )
      setDestToken(found)
      return
    }

    setDestToken(undefined)
    return () => {
      cancelled = true
    }
  }, [
    isReady,
    srcChain?.source,
    srcChain?.id,
    srcToken?.address,
    destChain?.id,
    destChain?.chainKey,
    destTokenList,
  ])

  return destToken
}