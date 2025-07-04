/* eslint-disable @typescript-eslint/no-explicit-any */
import { getBridgeActionType, getIsOrigin } from '@/utils';
import { wagmiConfig } from '@/utils/constants/wagmi';
import type { BridgeState, IBridgeParams } from '@/utils/interfaces/bridge';
import { ethers } from 'ethers';
import {  useState } from 'react';
import { readContract } from '@wagmi/core'
import { erc20Abi, formatUnits, parseUnits } from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';
import { useAccount, useTransaction, useWalletClient, useWriteContract } from 'wagmi';
import { BridgeActionType } from '@/utils/enums/bridge';
import { blockChainConfig, chainSelectors } from '@/utils/constants/chain';
// import type { WalletClient } from 'viem';
export const useLocalBridge = () => {
  const [state, setState] = useState<BridgeState>({
    isBridging: false,
    error: null,
  });
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { writeContractAsync } = useWriteContract();
  const { isLoading: isNativeLockPending } = useTransaction({ hash: state.nativeLockHash });
  const { isLoading: isERC20LockPending } = useTransaction({ hash: state.erc20LockHash });
  const approveToken = async (
    tokenAddress: `0x${string}`,
    spender: `0x${string}`,
    amountRaw: string,
    decimals: number,
    owner: `0x${string}`,
    force: boolean = true
  ): Promise<void> => {
      try {
      setState((prev) => ({ ...prev, isBridging: true, error: null }));
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
        setState((prev) => ({ ...prev, isBridging: false, error: null }));
      } else {
        setState((prev) => ({ ...prev, isBridging: false }));
      }
      } catch (err: any) {
        setState({ isBridging: false, error: err.message || "Unknown error" });
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
    tokenAddress: string,
    receiver: string,
    ccipFee: bigint,
    isNative:boolean
  ): Promise<void> => {
    try {
      if (!writeContractAsync) throw new Error("Contract write not available");
      if (isNative) {
        const amountBridge = parseUnits(amount, decimals);
        const valueBridge = parseUnits(amount, decimals);
        setState((prev) => ({ ...prev, isBridging: true, error: null }));
        const result = await writeContractAsync({
          address:  blockChainConfig.ethereumBridgeAddress as `0x${string}`,
          abi: blockChainConfig.ethereumBridgeAbi,
          functionName: "lockTokenVL",
          args: [ tokenAddress, amountBridge, blockChainConfig.seiBridgeAddress, receiver],
          value: valueBridge,
        });
        setState((prev) => ({ ...prev, nativeLockHash: result, isBridging: false, error: null }));
      }
        else {
        const amountInUnits = parseUnits(amount, decimals);
        try {
          await approveToken(tokenAddress as `0x${string}`, blockChainConfig.seiBridgeAddress as `0x${string}`, amount,decimals,address as `0x${string}`);
        } catch (err: any) {
          const errorMessage = err.message === "Transaction rejected by user" ? "Giao dịch đã bị hủy bởi người dùng" : "Phê duyệt token thất bại";
          throw new Error(errorMessage);
        }
        setState((prev) => ({ ...prev, isBridging: true, error: null }));
        const formatted = formatUnits(ccipFee, 18);
          const result = await writeContractAsync({
          address: blockChainConfig.ethereumBridgeAddress as `0x${string}`,
          abi: blockChainConfig.ethereumBridgeAbi,
          functionName: "lockTokenCCIP",
          args: [tokenAddress as `0x${string}`, BigInt(toChainSelector), blockChainConfig.seiBridgeAddress as `0x${string}`, receiver, amountInUnits, 0],
          value: parseUnits(formatted, 18),
        });
          setState((prev) => ({ ...prev, erc20LockHash: result, isBridging: false, error: null }))
      }
    } catch (err) {
      console.error("❌ ~ handleLockMint error:", err);
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : "Bridge failed",
        isBridging: false,
        isNativeLockPending: false,
        isERC20LockPending: false,
      }));
      throw err;
    }

  }
  const handleBridge = async (params: IBridgeParams): Promise<void> => {
    try {
       setState((prev) => ({ ...prev, isBridging: true, error: null }));
      const { fromToken, toToken,fromChain,amount,receiver } = params;
       const enrichedFrom = { ...fromToken, isOrigin: getIsOrigin(fromToken) };
        const enrichedTo = { ...toToken, isOrigin: getIsOrigin(toToken) };
        const actionType = getBridgeActionType(enrichedFrom, enrichedTo);
      const isNative = fromToken.address === ethers.ZeroAddress
      const toChainSelector = chainSelectors[fromChain.id]
      const decimals = fromToken.decimals
      const tokenAddress = fromToken.address;
      if (actionType === BridgeActionType.LockMint) {
       await handleLockMint(amount,toChainSelector,decimals,tokenAddress,receiver,BigInt(0),isNative)
      }
      setState((prev) => ({ ...prev, isBridging: false, error: null }));
    } catch (err) {
    console.error("~ handleBridge error:", err);
    setState((prev) => ({
      ...prev,
      error: err instanceof Error ? err.message : "Bridge failed",
      isBridging: false,
      isNativeLockPending: false,
      isERC20LockPending: false,
    }));
    throw err;
  }

  };

  return handleBridge;
};
