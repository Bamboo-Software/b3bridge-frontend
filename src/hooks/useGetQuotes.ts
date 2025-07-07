/* eslint-disable @typescript-eslint/no-explicit-any */
import { stargateApi } from '@/services/stargate-bridge';
import { ChainTokenSource } from '@/utils/enums/chain';
import type { IChainInfo } from '@/utils/interfaces/chain';
import type { ITokenInfo } from '@/utils/interfaces/token';
import type { IQuote } from '@/utils/interfaces/quote';
import { useMemo } from 'react';
import { getStargateRouteNameFromUrl } from '@/utils/constants/stargate/route';
import { StargateRouteName } from '@/utils/enums/bridge';

export function useGetQuotes({
  srcToken,
  desToken,
  srcAddress,
  destAddress,
  srcChain,
  destChain,
  srcAmount,
  destAmount,
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

  const isValid = useMemo(
    () =>
      srcToken &&
      desToken &&
      srcAddress &&
      destAddress &&
      srcChain &&
      destChain &&
      srcAmount &&
      destAmount &&
      srcChain.source === ChainTokenSource.Stargate,
    [srcToken, desToken, srcAddress, destAddress, srcChain, destChain, srcAmount, destAmount]
  );

  const amount = Number(srcAmount) || 0;
  const decimals = desToken?.decimals || 0;

  const dstAmountMin = Math.floor(amount * 0.9 * 10 ** decimals);

  const queryParams = useMemo(
    () =>
      isValid
        ? {
            srcToken: srcToken?.address,
            dstToken: desToken?.address,
            srcAddress,
            dstAddress: destAddress,
            srcChainKey: srcChain?.chainKey,
            dstChainKey: destChain?.chainKey,
            srcAmount: (Number(srcAmount) || 0) * 10 ** (srcToken?.decimals || 0),
            dstAmountMin
          }
        : null,
    [isValid, srcToken, desToken, srcAddress, destAddress, srcChain, destChain, srcAmount]
  );

  const { data, isLoading: loading, error } = useGetQuotesQuery(
    queryParams || { skip: true }
  );

  if (!isValid || !queryParams) {
    return {
      quotes: [] as IQuote[],
      loading: false,
      error: null,
    };
  }

  return {
    quotes: !error
      ? ((data?.quotes as IQuote[]) || []).map((quote) => ({
          ...quote,
          routeName: getStargateRouteNameFromUrl(quote.route) || StargateRouteName.Taxi,
        }))
      : [],
    loading,
    error: error ? (error as any).message || 'Unknown error' : null,
  };
}