import type { IBridgeParams } from '@/utils/interfaces/bridge';
import { useAccount, useWalletClient } from 'wagmi';
import { type Address } from 'viem';
import { StargateStepName } from '@/utils/enums/bridge';
import { selectedChains } from '@/utils/constants/wagmi';

export const useStargateBridge = (params: IBridgeParams) => {
  const { quote, fromChain } = params;
  const selectedNetwork = selectedChains?.find((chain)=> chain.id === fromChain?.id)
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient({chainId: selectedNetwork?.id});

  const bridge = async () => {
    if (!walletClient) throw new Error('Wallet not connected');
    if (!quote || !quote.steps || !Array.isArray(quote.steps)) {
      throw new Error('Invalid quote steps');
    }

    for (const step of quote.steps) {
      const tx = step.transaction;
      if (!tx) continue;

      if (step.type === StargateStepName.APPROVE) {
        await walletClient.sendTransaction({
          to: tx.to as Address,
          data: tx.data as Address,
          account: address,
          chain: selectedNetwork,
        });
      } else 
      if (step.type === StargateStepName.BRIDGE) {
        const value = BigInt(tx.value || 0);

        await walletClient.sendTransaction({
          to: tx.to as Address,
          data: tx.data as Address,
          value,
          chain: selectedNetwork,
          account: address,
        });
      }
    }
  };

  return bridge;
};