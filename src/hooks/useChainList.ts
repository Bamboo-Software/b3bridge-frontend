import { selectedChains as wagmiChains } from '@/utils/constants/wagmi'
import { ChainTokenSource, ChainType } from '@/utils/enums/chain'
import type { IChainInfo, IStargateChain } from '@/utils/interfaces/chain'
import { stargateApi } from '@/services/stargate'
import {getChainImage } from '@/utils/blockchain/chain'
import { useEffect, useState } from 'react'

interface UseChainListResult {
  data: IChainInfo[] | null
  loading: boolean
  error: Error | null
}

export const useChainList = (): UseChainListResult => {
  const [data, setData] = useState<IChainInfo[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const { useGetChainListQuery } = stargateApi
  const { data: apiChains, isLoading: apiLoading, error: apiError } = useGetChainListQuery({})
  useEffect(() => {
    setLoading(true)
    setError(null)

    try {
      const evmLocalChains: IChainInfo[] = wagmiChains
        .filter(chain => chain.id !== undefined && chain.name !== undefined)
        .map(chain => ({
          id: chain.id,
          chainKey: chain.name || '',
          name: chain.name || '',
          logo: getChainImage({chainId: chain.id, source: ChainTokenSource.Local}),
          chainType: ChainType.EVM,
          rpcUrls: {
            default: {
              http: chain.rpcUrls?.default?.http?.slice() || [],
            },
          },
          nativeCurrency: chain.nativeCurrency,
          blockExplorers: {
            default: {
              name: chain.blockExplorers?.default?.name || '',
              url: chain.blockExplorers?.default?.url || '',
              apiUrl: chain.blockExplorers?.default?.apiUrl,
            },
          },
          source: ChainTokenSource.Local
        }))

      let remoteChains: IChainInfo[] = []
      if (Array.isArray(apiChains?.chains)) {
        remoteChains = apiChains.chains.map((chain: IStargateChain) => {
          return {
            id: chain.chainId,
            chainKey: chain.chainKey || '',
            name: chain.name || '',
            logo: getChainImage({chainKey: chain.chainKey, source: ChainTokenSource.Stargate}),
            nativeCurrency: chain.nativeCurrency,
            source: ChainTokenSource.Stargate,
          }
        })
      }

      const chainMap = new Map<number, IChainInfo>()
      for (const chain of evmLocalChains) {
        chainMap.set(chain.id, chain)
      }
      for (const chain of remoteChains) {
        chainMap.set(chain.id, chain)
      }
      setData(Array.from(chainMap.values()))
    } catch (err) {
      setError(err as Error)
      setData(null)
    } finally {
      setLoading(apiLoading)
    }
  }, [apiChains, apiLoading])

  useEffect(() => {
    if (apiError) setError(apiError as Error)
  }, [apiError])

  return {
    data,
    loading,
    error,
  }
}