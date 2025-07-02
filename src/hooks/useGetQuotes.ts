/* eslint-disable @typescript-eslint/no-explicit-any */
import { stargateApi } from '@/services/stargate';
import { ChainTokenSource } from '@/utils/enums/chain';
import type { IChainInfo } from '@/utils/interfaces/chain';
import type { ITokenInfo } from '@/utils/interfaces/token';
import type { IQuote } from '@/utils/interfaces/quote';

export function useGetQuotes({
  srcToken,
  desToken,
  srcAddress,
  destAddress,
  srcChain,
  destChain,
  srcAmount,
  destAmount
}: {
  srcToken?: ITokenInfo;
  desToken?: ITokenInfo;
  srcAddress?: string;
  destAddress?: string;
  srcChain?: IChainInfo;
  destChain?: IChainInfo;
  srcAmount?: string;
  destAmount?: string;
}) {
  const { useGetQuotesQuery } = stargateApi;

  const isValid =
    srcToken &&
    desToken &&
    srcAddress &&
    destAddress &&
    srcChain &&
    destChain &&
    srcAmount &&
    destAmount &&
    srcChain.source === ChainTokenSource.Stargate;

  const { data, isLoading: loading, error } = useGetQuotesQuery(
    isValid
      ? {
          srcToken: srcToken?.address,
          dstToken: desToken?.address,
          srcAddress,
          dstAddress: destAddress,
          srcChainKey: srcChain?.chainKey,
          dstChainKey: destChain?.chainKey,
          srcAmount: (Number(srcAmount) || 0) * 10 ** (srcToken?.decimals || 0),
          dstAmountMin: (Number(srcAmount) || 0) * 10 ** (desToken?.decimals || 0),
        }
      : { skip: true }
  );

  if (!isValid) {
    return {
      quotes: [] as IQuote[],
      loading: false,
      error: null,
    };
  }

  return {
    quotes: !error ? (data?.quotes as IQuote[]) || [] : [],
    loading,
    error: error ? (error as any).message || "Unknown error" : null,
  };
}