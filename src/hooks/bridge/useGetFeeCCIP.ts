/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react';
import { parseUnits } from 'viem';
import { isAddress } from 'viem/utils';
import { readContract } from 'wagmi/actions';
import { blockChainConfig, chainSelectors } from '@/utils/constants/chain';
import { useReadContract } from 'wagmi';
import { ethers } from 'ethers';
import { getBridgeActionType, getIsOrigin } from '@/utils';
import type { IBridgeParams } from '@/utils/interfaces/bridge';
import { BridgeActionType } from '@/utils/enums/bridge';
import { wagmiConfig } from '@/utils/constants/wallet/wagmi';

export function useGetFeeCCIP(params: IBridgeParams) {
  const { fromToken, toToken, tokenList, toChain, fromChain, amount, receiver } = params;

  const [seiTokenId, setSeiTokenId] = useState<string | null>(null);
  const [tokenIdError, setTokenIdError] = useState<string | null>(null);
  const [isFetchingTokenId, setIsFetchingTokenId] = useState(false);

  const isReady = !!fromToken && !!toToken && !!tokenList?.length && !!fromChain?.id && !!toChain?.id && !!amount?.trim() && !!receiver;

  const isNative = fromToken?.address === ethers.ZeroAddress;

  const parsedAmount = useMemo(() => {
    if (!amount || !fromToken?.decimals) return BigInt(0);
    return parseUnits(amount, fromToken.decimals);
  }, [amount, fromToken?.decimals]);

  const actionType = useMemo(() => {
    if (!isReady) return BridgeActionType.Unknown;
    const enrichedFrom = { ...fromToken, isOrigin: getIsOrigin(fromToken) };
    const enrichedTo = { ...toToken, isOrigin: getIsOrigin(toToken) };
    return getBridgeActionType(enrichedFrom, enrichedTo);
  }, [fromToken, toToken, isReady]);

  // Fetch tokenId for BurnUnlock
  useEffect(() => {
    if (
      !isReady ||
      isNative ||
      actionType !== BridgeActionType.BurnUnlock ||
      !fromToken?.address ||
      !toToken?.address ||
      !toChain?.id
    ) {
      setSeiTokenId(null);
      setTokenIdError(null);
      return;
    }

    const fetchTokenId = async () => {
      setIsFetchingTokenId(true);
      setTokenIdError(null);
      try {
        const id = await readContract(wagmiConfig, {
          address: blockChainConfig.ethereumBridgeAddress,
          abi: blockChainConfig.ethereumBridgeAbi,
          functionName: 'tokenAddressToId',
          args: [toToken.address],
          chainId: toChain.id,
        });
        setSeiTokenId(id as string);
      } catch (err: any) {
        console.error(`❌ Failed to fetch tokenId for ${fromToken.address}:`, err);
        setTokenIdError(err.message || 'Failed to fetch token ID');
        setSeiTokenId(null);
      } finally {
        setIsFetchingTokenId(false);
      }
    };

    fetchTokenId();
  }, [isReady, isNative, actionType, fromToken?.address, toToken?.address, toChain?.id]);

  const bridgeConfig = useMemo(() => {
    if (!isReady || isNative) return null;

    if (actionType === BridgeActionType.BurnUnlock) {
      if (!seiTokenId) return null;
      return {
        address: blockChainConfig.seiBridgeAddress,
        abi: blockChainConfig.seiBridgeAbi,
        functionName: 'getFeeCCIP',
        args: [parsedAmount, seiTokenId],
      };
    }

    if (actionType === BridgeActionType.LockMint) {
      if (!receiver || !fromChain?.id || !toChain?.id) return null;
      return {
        address: blockChainConfig.ethereumBridgeAddress,
        abi: blockChainConfig.ethereumBridgeAbi,
        functionName: 'getFeeCCIP',
        args: [
          fromToken.address,
          BigInt(chainSelectors[toChain.id]),
          blockChainConfig.seiBridgeAddress,
          receiver,
          parsedAmount,
          0,
        ],
      };
    }

    return null;
  }, [
    isReady,
    isNative,
    actionType,
    parsedAmount,
    seiTokenId,
    receiver,
    toChain?.id,
    fromToken?.address,
    fromChain?.id,
  ]);

  const shouldRead =
    !isNative &&
    isReady &&
    !!bridgeConfig?.address &&
    !!bridgeConfig?.args &&
    !isFetchingTokenId &&
    !tokenIdError &&
    (actionType === BridgeActionType.BurnUnlock || isAddress(receiver));

  const contractOptions = useMemo(() => {
    if (!shouldRead || !bridgeConfig) return undefined;
    return {
      ...bridgeConfig,
      chainId: fromChain?.id,
    };
  }, [shouldRead, bridgeConfig, fromChain?.id]);

  const { data: ccipFee, isLoading } = useReadContract(contractOptions);

  return {
    ccipFee,
    isLoading: isLoading || isFetchingTokenId,
    error: tokenIdError,
  };
}
