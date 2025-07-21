import type { IBridgeParams } from '@/utils/interfaces/bridge';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { type Address } from 'viem';
import { StargateStepName } from '@/utils/enums/bridge';
import { toast } from 'sonner';
import { getLayerZeroScanLink } from '@/utils/blockchain/explorer';
import { formatTokenAmount, shortenAddress } from '@/utils';
import type { ITransaction } from '@/utils/interfaces/transaction';
import { ChainTokenSource } from '@/utils/enums/chain';
import { StargateTransactionStatus } from '@/utils/enums/transaction';
import { useTransactionStore } from '../useTransactionStore';
import { selectedChains } from '@/utils/constants/wallet/wagmi';

export const useStargateBridge = (params: IBridgeParams) => {
  const addTransaction = useTransactionStore(state => state.addTransaction);
  const updateTransactionByTxHash = useTransactionStore(state => state.updateTransactionByTxHash);
  const { quote, fromChain, toChain, fromToken, toToken, amount, toAmount } = params;
  const selectedNetwork = selectedChains?.find(
    (chain) => chain.id === fromChain?.id
  );
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient({
    chainId: selectedNetwork?.id,
  });
  
  const publicClient = usePublicClient({ chainId: selectedNetwork?.id });
  const bridge = async () => {
    if (!walletClient) throw new Error('Wallet not connected');
    if (!publicClient) throw new Error('Public client not available');
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
      } else if (step.type === StargateStepName.BRIDGE) {
        const value = BigInt(tx.value || 0);
        const txHash = await walletClient.sendTransaction({
          to: tx.to as Address,
          data: tx.data as Address,
          chain: selectedNetwork,
          value,
          account: address,
        });

        // Wait for transaction confirmation using publicClient
        await publicClient.waitForTransactionReceipt({ hash: txHash });

        const userAddr = address as string;
        const newTx: ITransaction = {
          userAddress: userAddr,
          txHash: txHash,
          status: StargateTransactionStatus.CREATED,
          fromChain: fromChain,
          toChain: toChain,
          fromToken: fromToken,
          toToken: toToken,
          source: ChainTokenSource.Stargate,
          quote,
          fromAmount: amount,
          toAmount: formatTokenAmount(toAmount, toToken),
        };
        addTransaction(userAddr, newTx);
        updateTransactionByTxHash(userAddr, txHash, { status: StargateTransactionStatus.CREATED });

        toast.success(
          <div className='flex flex-col gap-1'>
            <span className='font-semibold'>
              Transaction confirmed! Hash:  {shortenAddress(txHash)}
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
