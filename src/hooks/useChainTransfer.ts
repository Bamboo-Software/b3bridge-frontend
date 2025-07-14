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
      if (!publicClient) return { error: "Public client not available" };
      
      try {
        let txHash;
        
        if (tokenAddress) {
          const data = encodeFunctionData({
            abi: erc20Abi,
            functionName: "transfer",
            args: [to, parseUnits(amount, decimals)],
          });
          txHash = await sendTransactionAsync({
            to: tokenAddress,
            data,
            chainId,
          });
        } else {
          txHash = await sendTransactionAsync({
            to,
            value: parseEther(amount),
            chainId,
          });
        }

        if (!txHash) {
          return { error: "Transaction failed" };
        }
        console.log(txHash,'txHash')
        // Wait for transaction confirmation synchronously
        const receipt = await publicClient.waitForTransactionReceipt({
          hash: txHash,
          confirmations: 1, // Wait for at least 1 confirmation
        });
        console.log(receipt,'receipt')


        if (receipt.status === 'reverted') {
          return { error: "Transaction reverted" };
        }

        return { 
          hash: txHash,
          receipt,
          success: receipt.status === 'success'
        };

      } catch (err: any) {
        console.error('Transfer error:', err);
        return { error: err.message || "Transaction failed" };
      }
    } else if (chainType === ChainType.Solana) {
      // TODO: Implement Solana transfer with confirmation
      return { hash: "", success: false };
    }
    
    return { error: "Unsupported chain type" };
  };

  return { transfer };
}