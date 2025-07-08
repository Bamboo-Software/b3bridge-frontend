/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSendTransaction, usePublicClient } from "wagmi";
import { parseEther, type Address, erc20Abi, encodeFunctionData, parseUnits } from "viem";
import { ChainType } from '@/utils/enums/chain';

export function useChainTransfer() {
  const { sendTransactionAsync } = useSendTransaction();
  const publicClient = usePublicClient();

  
  const transfer = async ({
    chainType,
    to,
    amount,
    chainId,
    tokenAddress,
    decimals = 18,
  }: {
    chainType: ChainType;
    to: Address;
    amount: string;
    chainId?: number;
    tokenAddress?: Address;
    decimals?: number;
  }) => {
    if (chainType === ChainType.EVM) {
      if (!publicClient) return;
      try {
        let tx;
        if (tokenAddress) {
          const data = encodeFunctionData({
            abi: erc20Abi,
            functionName: "transfer",
            args: [to, parseUnits(amount, decimals)],
          });
          tx = await sendTransactionAsync({
            to: tokenAddress,
            data,
            chainId,
          });
        } else {
          tx = await sendTransactionAsync({
            to,
            value: parseEther(amount),
            chainId,
          });
        }
        if (!tx) {
          return { error: "Transaction failed" };
        }
        return { hash: tx };
      } catch (err: any) {
        return { error: err.message || "Transaction failed" };
      }
    } else if (chainType === ChainType.Solana) {
      return { hash: "" };
    }
  };

  return { transfer };
}