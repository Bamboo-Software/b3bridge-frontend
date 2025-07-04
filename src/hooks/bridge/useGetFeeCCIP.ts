/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react';
import { parseUnits } from 'viem';
import { isAddress } from 'viem/utils';
import { readContract } from 'wagmi/actions';
import { blockChainConfig, chainSelectors } from '@/utils/constants/chain';
import { wagmiConfig } from '@/utils/constants/wagmi';
import { useReadContract } from 'wagmi';
import { ethers } from 'ethers';
import { getBridgeActionType, getIsOrigin } from '@/utils';
import type { IBridgeParams } from '@/utils/interfaces/bridge';
import { BridgeActionType } from '@/utils/enums/bridge';

export function useGetFeeCCIP(params: IBridgeParams) {
  const { fromToken, toToken, tokenList, toChain, fromChain, amount, receiver } = params;

  const [seiTokenId, setSeiTokenId] = useState<string | null>(null);
  const [tokenIdError, setTokenIdError] = useState<string | null>(null);
  const [isFetchingTokenId, setIsFetchingTokenId] = useState(false);

  // Check if all required params are present
  const isReady =
    !!fromToken &&
    !!toToken &&
    !!tokenList?.length &&
    !!fromChain?.id &&
    !!toChain?.id &&
    !!amount?.trim() &&
    !!receiver;

  const actionType = useMemo(() => {
  if (!isReady) return BridgeActionType.Unknown;

  const enrichedFrom = { ...fromToken, isOrigin: getIsOrigin(fromToken) };
  const enrichedTo = { ...toToken, isOrigin: getIsOrigin(toToken) };

  return getBridgeActionType(enrichedFrom, enrichedTo);
}, [fromToken, toToken, isReady]);

  const isNative = fromToken?.address === ethers.ZeroAddress;

  const parsedAmount = useMemo(() => {
    if (!amount || !fromToken?.decimals) return 0n;
    return parseUnits(amount, fromToken.decimals);
  }, [amount, fromToken?.decimals]);

  useEffect(() => {
    if (
      !isReady ||
      actionType !== BridgeActionType.BurnUnlock ||
      isNative ||
      !fromToken ||
      !fromToken.address ||
      !fromChain?.id
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
  }, [isReady,fromToken, actionType, fromToken?.address, fromChain?.id,toToken?.address,toChain?.id, isNative]);

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
    seiTokenId,
    parsedAmount,
    receiver,
    actionType,
    toChain?.id,
    fromToken?.address,
    fromChain?.id,
  ]);

  const shouldRead =
    isReady &&
    !isNative &&
    !!bridgeConfig?.address &&
    !!bridgeConfig?.args &&
    (actionType === BridgeActionType.BurnUnlock || isAddress(receiver)) &&
    !isFetchingTokenId &&
    !tokenIdError;

  const contractOptions = useMemo(() => {
    if (!shouldRead || !bridgeConfig) return undefined;
    return {
      address: bridgeConfig.address,
      abi: bridgeConfig.abi,
      functionName: bridgeConfig.functionName,
      args: bridgeConfig.args,
    };
  }, [shouldRead, bridgeConfig]);
  
  const { data: ccipFee, isLoading } = useReadContract(contractOptions);

  return {
    ccipFee,
    isLoading: isLoading || isFetchingTokenId,
    error: tokenIdError,
  };
}
