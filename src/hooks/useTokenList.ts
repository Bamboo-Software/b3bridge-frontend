import { useEffect, useState, useMemo } from 'react'
import { getTokenData, getTokenImage } from '../utils/blockchain/token'
import { getTokenAddressByChainIdAndTokenName } from '../utils/blockchain/chain'
import type { Address } from 'viem'
import { ChainTokenSource, type ChainId } from '@/utils/enums/chain'
import type { ITokenInfo, ITokenStargateInfo } from '@/utils/interfaces/token'
import type { IChainInfo } from '@/utils/interfaces/chain'
import { SUPPORTED_TOKENS_BY_CHAIN, tokenMetaByChainAndSymbol } from '@/utils/constants/token'
import { stargateApi } from '@/services/stargate'
export function useTokenList(chain?: IChainInfo, sourceChainKey?:string, sourceTokenAddress?: Address) {
  const [tokenDataList, setTokenDataList] = useState<ITokenInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { useGetTokenListQuery } = stargateApi
  const {
    data: stargateTokens,
    isLoading: stargateTokenLoading,
    error: stargateTokenError,
  } = useGetTokenListQuery({
    ...(sourceChainKey && sourceTokenAddress && {
      srcChainKey:sourceChainKey, 
      srcToken: sourceTokenAddress
    })
  })
  

  const type = chain?.source


  const stargateMappedTokens = useMemo(() => {
    if (!Array.isArray(stargateTokens?.tokens) || !chain?.id) return []
    const filtered = stargateTokens.tokens.filter(
      (token: ITokenStargateInfo) => token.chainKey === chain.chainKey && token.isBridgeable
    )
    return filtered.map((token: ITokenStargateInfo) => ({
      symbol: token.symbol,
      address: token.address as Address,
      chainId: chain.id as ChainId,
      decimals: token.decimals,
      chainKey: token.chainKey,
      logo: getTokenImage({
        source: ChainTokenSource.Stargate,
        symbol: token.symbol,
        chainId: chain.id as ChainId,
        tokenAddress: token.address as Address,
      }) || '',
      priceUsd: token.price.usd
    })) as ITokenInfo[]
  }, [stargateTokens, chain?.id])

  useEffect(() => {
    let cancelled = false

    const fetchLocal = async () => {
  setError(null);
  if (!chain?.id || isNaN(Number(chain.id))) {
    setTokenDataList([]);
    return;
  }

  const selectedChainId = Number(chain.id) as ChainId;
  const symbols = SUPPORTED_TOKENS_BY_CHAIN[selectedChainId] ?? [];

  setLoading(true);
  try {
    const results = await Promise.all(
      symbols.map(async (symbol) => {
        const tokenAddress = getTokenAddressByChainIdAndTokenName(selectedChainId, symbol);
        if (!tokenAddress) return null;

        const data = await getTokenData(selectedChainId, tokenAddress as Address);

        // Lấy meta từ cấu hình sẵn
        const meta = tokenMetaByChainAndSymbol[selectedChainId]?.[symbol];

        return {
          ...data,
          symbol,
          address: tokenAddress as Address,
          chainId: selectedChainId,
          isOrigin: meta?.isOrigin ?? false,
          // isNative: meta?.isNative ?? false,
        } as ITokenInfo & { isOrigin: boolean; isNative: boolean };
      })
    );

    if (!cancelled) setTokenDataList(results.filter(Boolean) as ITokenInfo[]);
  } catch (err) {
    if (!cancelled) {
      setError(err as Error);
      setTokenDataList([]);
    }
  } finally {
    if (!cancelled) setLoading(false);
  }
};

    if (!chain) {
      setTokenDataList([])
      setLoading(false)
      return
    }

    if (type === ChainTokenSource.Stargate) {
      setTokenDataList(stargateMappedTokens)
      setLoading(stargateTokenLoading)
      setError(stargateTokenError as Error || null)
    } else {
      fetchLocal()
    }

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chain?.id, chain?.chainKey, type, stargateMappedTokens, stargateTokenLoading, stargateTokenError])

  return {
    data: tokenDataList,
    loading,
    error,
  }
}