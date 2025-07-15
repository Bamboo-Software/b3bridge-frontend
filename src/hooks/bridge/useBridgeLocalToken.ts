/* eslint-disable @typescript-eslint/no-explicit-any */
import { getBridgeActionType, getIsOrigin } from '@/utils';
import type {  IBridgeParams } from '@/utils/interfaces/bridge';
import { ethers } from 'ethers';

import { readContract } from '@wagmi/core'
import { erc20Abi, formatUnits, parseUnits } from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';
import { useAccount, useReadContract, useTransaction, useWalletClient, useWriteContract } from 'wagmi';
import { BridgeActionType } from '@/utils/enums/bridge';
import { blockChainConfig, chainSelectors } from '@/utils/constants/chain';
import type { ITokenInfo } from '@/utils/interfaces/token';
import type { IChainInfo } from '@/utils/interfaces/chain';
import { useBridgeStore } from '@/stores/bridge/useBridgeLocalStore';
import { useTransactionStore } from '../useTransactionStore';
import { ChainTokenSource } from '@/utils/enums/chain';
import { CCIPTransactionStatus } from '@/utils/enums/transaction';
import { wagmiConfig } from '@/utils/constants/wallet/wagmi';
// import type { WalletClient } from 'viem';
export const useLocalBridge = () => {
  const {
    isBridging,
    setBridgeState,
    currentTxHash
  } = useBridgeStore();
  const { address } = useAccount();
  const { addTransaction } = useTransactionStore.getState();
  const { data: walletClient } = useWalletClient();
  const { writeContractAsync } = useWriteContract();
const { isLoading: isTxPending } = useTransaction({ hash: currentTxHash });
  const { data: routerAddress } = useReadContract({
    address: blockChainConfig.ethereumBridgeAddress,
    abi: blockChainConfig.ethereumBridgeAbi,
    functionName: "getRouter",
  });

  const { data: isPaused } = useReadContract({
    address: blockChainConfig.ethereumBridgeAddress,
    abi: blockChainConfig.ethereumBridgeAbi,
    functionName: "paused",
  });

  const approveToken = async (
    tokenAddress: `0x${string}`,
    spender: `0x${string}`,
    amountRaw: string,
    decimals: number,
    owner: `0x${string}`,
    walletClient?: any,
    force: boolean = true
  ): Promise<void> => {
    try {
      setBridgeState({ isBridging: true, error: null });
      const amountInUnits = parseUnits(amountRaw, decimals);
      const currentAllowance: bigint = await readContract(wagmiConfig, {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [owner, spender],
      }) as bigint;

      if (force || currentAllowance < amountInUnits) {
        const approveTx = await writeContractAsync({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: "approve",
          args: [spender, amountInUnits],
        });
        await waitForTransactionReceipt(walletClient!, { hash: approveTx });
        setBridgeState({ isBridging: false });
      }
    } catch (err: any) {
      setBridgeState({ isBridging: false, error: err.message || 'Unknown error' });
      if (err.code === 4001 || err.message?.toLowerCase().includes("user rejected")) {
        throw new Error("Transaction rejected by user");
      }
      throw err;
    }
  };


  const handleLockMint = async (
    amount: string,
    toChainSelector: string,
    decimals: number,
    decimalsToken: number,
    tokenAddress: string,
    receiver: string,
    ccipFee: bigint,
    isNative: boolean,
    fromChain: IChainInfo,
    toChain: IChainInfo,
    fromToken: ITokenInfo,
    toToken: ITokenInfo,
  ): Promise<void> => {
    try {
      if (!writeContractAsync) throw new Error("Contract write not available");
      if (isNative) {
        const amountNative = parseUnits(amount, decimals);
        setBridgeState({ isBridging: true, error: null });
        const result = await writeContractAsync({
          address: blockChainConfig.ethereumBridgeAddress as `0x${string}`,
          abi: blockChainConfig.ethereumBridgeAbi,
          functionName: "lockTokenVL",
          args: [tokenAddress, amountNative, blockChainConfig.seiBridgeAddress, receiver],
          value: amountNative,
        });
         await waitForTransactionReceipt(walletClient!, {
          hash: result,
        })
        setBridgeState({ currentTxHash: result, isBridging: false });
        addTransaction(address!, {
          txHash:result,
          userAddress: address!,
          status:CCIPTransactionStatus.VALIDATOR,
          fromChain,
          toChain,
          fromToken,
          toToken,
          fromAmount: amount,
          toAmount: amount,
          source: ChainTokenSource.Local,
          quote: undefined,
          createdAt: Date.now(),
        });
      }
      else {
        const amountTokenERC20 = parseUnits(amount, decimalsToken);
        await approveToken(tokenAddress as `0x${string}`, blockChainConfig.ethereumBridgeAddress, amount, decimalsToken, address as `0x${string}`, walletClient);
        const fee = parseUnits(formatUnits(ccipFee, decimals), decimals);
        const adjustedFee = (fee * 124n) / 100n;
          const result = await writeContractAsync({
            address: blockChainConfig.ethereumBridgeAddress,
            abi: blockChainConfig.ethereumBridgeAbi,
            functionName: 'lockTokenCCIP',
            args: [
              tokenAddress,
              BigInt(toChainSelector),
              blockChainConfig.seiBridgeAddress,
              receiver,
              amountTokenERC20
            ],
            value: adjustedFee,
          });
        const receipt = await waitForTransactionReceipt(walletClient!, {
          hash: result,
        })
        setBridgeState({ currentTxHash: result, isBridging: false });
        addTransaction(address!, {
          txHash:result,
          userAddress: address!,
          status:CCIPTransactionStatus.CCIP,
          messageId:receipt.logs[8].topics[1],
          fromChain,
          toChain,
          fromToken,
          toToken,
          fromAmount: amount,
          toAmount: amount,
          source: ChainTokenSource.Local,
          quote: undefined,
          createdAt: Date.now(),
        });
      }
    } catch (err) {
      setBridgeState({ isBridging: false, error: err instanceof Error ? err.message : 'Bridge failed' });
      throw err;
    }
  }

  const handleBurnUnlockCCIP = async (
    amount: string,
    decimalsToken: number,
    toToken: ITokenInfo,
    toChain: IChainInfo,
    fromToken: ITokenInfo,
    fromChain: IChainInfo,
    tokenAddress: string,
    ccipFee: bigint,
    
  ): Promise<void> => {
    try {
      setBridgeState({ isBridging: true, error: null });
      const amountTokenERC20 = parseUnits(amount, decimalsToken);
      const tokenId = await readContract(wagmiConfig, {
        address: blockChainConfig.ethereumBridgeAddress,
        abi: blockChainConfig.ethereumBridgeAbi,
        functionName: 'tokenAddressToId',
        args: [toToken.address],
        chainId: toChain.id,
      });

      await approveToken(tokenAddress as `0x${string}`, blockChainConfig.seiBridgeAddress as `0x${string}`, amount, decimalsToken, address as `0x${string}`,walletClient);
      const result = await writeContractAsync({
        address: blockChainConfig.seiBridgeAddress as `0x${string}`,
        abi: blockChainConfig.seiBridgeAbi,
        functionName: "burnTokenCCIP",
        args: [tokenId, amountTokenERC20],
        value: (ccipFee * 124n) / 100n,
      });
      const receipt= await waitForTransactionReceipt(walletClient!, { hash: result });
      setBridgeState({ currentTxHash: result, isBridging: false });
        addTransaction(address!, {
          txHash:result,
          userAddress: address!,
          status:CCIPTransactionStatus.CCIP,
          messageId:receipt?.logs[12]?.topics[1],
          fromChain,
          toChain,
          fromToken,
          toToken,
          fromAmount: amount,
          toAmount: amount,
          source: ChainTokenSource.Local,
          quote: undefined,
          createdAt: Date.now(),
        });
      setBridgeState({ currentTxHash: result, isBridging: false });
    } catch (err) {
      console.error("❌ ~ handleBurnUnlock error:", err);
       setBridgeState({ isBridging: false, error: err instanceof Error ? err.message : 'Bridge failed' });
      throw err;
    }
  }
  const handleBurnUnlockVL = async (
    amount: string,
    decimals: number,
    tokenAddress: string,
    receiver: string,
      toToken: ITokenInfo,
    toChain: IChainInfo,
    fromToken: ITokenInfo,
    fromChain: IChainInfo,
  ): Promise<void> => {
    try {
      setBridgeState({ isBridging: true, error: null });
      const amountInUnits = parseUnits(amount, decimals || 18);
      const result = await writeContractAsync({
        address: blockChainConfig.seiBridgeAddress as `0x${string}`,
        abi: blockChainConfig.seiBridgeAbi,
        functionName: "burnTokenVL",
        args: [amountInUnits, tokenAddress as `0x${string}`, receiver],
        value: amountInUnits
      });
      await waitForTransactionReceipt(walletClient!, { hash: result });
      setBridgeState({ currentTxHash: result, isBridging: false });
        addTransaction(address!, {
          txHash:result,
          userAddress: address!,
          status:CCIPTransactionStatus.VALIDATOR,
          fromChain,
          toChain,
          fromToken,
          toToken,
          fromAmount: amount,
          toAmount: amount,
          source: ChainTokenSource.Local,
          quote: undefined,
          createdAt: Date.now(),
        });
    } catch (err) {
      console.error("❌ ~ handleBurnUnlock error:", err);
       setBridgeState({ isBridging: false, error: err instanceof Error ? err.message : 'Bridge failed' });
      throw err;
    }

  }
  const handleBridge = async (params: IBridgeParams): Promise<void> => {
    try {
      setBridgeState({ isBridging: true, error: null });
      const { fromToken, toToken, fromChain, amount, receiver, ccipFee, toChain } = params;


      const enrichedFrom = { ...fromToken, isOrigin: getIsOrigin(fromToken) };
      const enrichedTo = { ...toToken, isOrigin: getIsOrigin(toToken) };

      const actionType = getBridgeActionType(enrichedFrom, enrichedTo);

      const isNative = fromToken.address === ethers.ZeroAddress

      const isNativeBurnUnlock = toToken.address === ethers.ZeroAddress

      const toChainSelector = chainSelectors[toChain.id]
      const decimals = fromChain.nativeCurrency?.decimals
      const decimalsToken = fromToken.decimals
      const tokenAddress = fromToken.address;
      if (actionType === BridgeActionType.BurnUnlock && !isNativeBurnUnlock) {
        await handleBurnUnlockCCIP(amount,decimalsToken, toToken, toChain,fromToken,fromChain, tokenAddress, ccipFee!)
      }
      else if (actionType === BridgeActionType.BurnUnlock && isNativeBurnUnlock) {
        await handleBurnUnlockVL(amount, decimals!,tokenAddress, receiver,toToken, toChain,fromToken,fromChain)
      }
      else {
        await handleLockMint(amount, toChainSelector, decimals!, decimalsToken, tokenAddress, receiver, ccipFee!, isNative,fromChain,toChain,fromToken,toToken)
      }
      setBridgeState({ isBridging: false, error: null });
    } catch (err) {
      console.error("~ handleBridge error:", err);
      setBridgeState({ isBridging: false, error: err instanceof Error ? err.message : 'Bridge failed' });
      throw err;
    }

  };

 return {
  isBridging,
 currentTxHash,
  routerAddress,
  isPaused,
 isTxPending,
  handleBridge,
};
}