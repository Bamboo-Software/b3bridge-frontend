/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSendTransaction } from "wagmi";
import { parseEther, type Address, erc20Abi, encodeFunctionData, parseUnits, createPublicClient, http } from "viem";
import { ChainType } from '@/utils/enums/chain';
import { useConfig } from 'wagmi';

export function useChainTransfer() {
  const { sendTransactionAsync } = useSendTransaction();
  const config = useConfig();

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
      const targetChain = chainId ? config.chains.find(chain => chain.id === chainId) : config.chains[0];
      
      if (!targetChain) {
        return { error: `Chain with ID ${chainId} not found in configuration` };
      }

      const publicClient = createPublicClient({ 
        chain: targetChain, 
        transport: http() 
      });

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
        
        const receipt = await publicClient.waitForTransactionReceipt({
          hash: txHash,
          confirmations: 1, // Wait for at least 1 confirmation
          timeout: 300_000, // 5 minutes timeout
        });

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
      return { hash: "", success: false };
    }
    
    return { error: "Unsupported chain type" };
  };

  return { transfer };
}