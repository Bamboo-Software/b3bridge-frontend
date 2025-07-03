import type { IBridgeParams } from '@/utils/interfaces/bridge';
import { useAccount, useWalletClient } from 'wagmi';
import { type Address } from 'viem';
import { StargateStepName } from '@/utils/enums/bridge';
import { selectedChains } from '@/utils/constants/wagmi';
import { toast } from 'sonner';
import { getLayerZeroScanLink } from '@/utils/blockchain/explorer';
import { shortenAddress } from '@/utils';

export const useStargateBridge = (params: IBridgeParams) => {
  const { quote, fromChain } = params;
  const selectedNetwork = selectedChains?.find(
    (chain) => chain.id === fromChain?.id
  );
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient({
    chainId: selectedNetwork?.id,
  });
  const bridge = async () => {
    if (!walletClient) throw new Error('Wallet not connected');
    if (!quote || !quote.steps || !Array.isArray(quote.steps)) {
      throw new Error('Invalid quote steps');
    }

    for (const step of quote.steps) {
      const tx = step.transaction;
      if (!tx) continue;
      console.log(tx, 'tx.data approve');

      if (step.type === StargateStepName.APPROVE) {
        await walletClient.sendTransaction({
          to: tx.to as Address,
          data: tx.data as Address,
          account: address,
          chain: selectedNetwork,
        });
      } else if (step.type === StargateStepName.BRIDGE) {
        const value = BigInt(tx.value || 0);
        const txHash = await walletClient.sendTransaction({
          to: tx.to as Address,
          data: tx.data as Address,
          chain: selectedNetwork,
          value,
          account: address,
        });

        toast.success(
          <div className='flex flex-col gap-1'>
            <span className='font-semibold'>
              Transaction sent! Hash:  {shortenAddress(txHash)}
            </span>
            <a
              href={getLayerZeroScanLink(txHash)}
              target='_blank'
              rel='noopener noreferrer'
              className='text-blue-600 underline text-xs'
            >
              View on LayerZeroScan
            </a>
          </div>,
          {
            duration: Infinity,
            closeButton: true,
          }
        );
      }
    }
  };

  return bridge;
};
