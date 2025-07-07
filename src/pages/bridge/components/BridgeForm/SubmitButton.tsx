import { Button } from '@/components/ui/button';
import { useTransactionStore } from '@/hooks/useTransactionStore';
import { ChainTokenSource } from '@/utils/enums/chain';
import { CCIPTransactionStatus } from '@/utils/enums/transaction';
import type { IChainInfo } from '@/utils/interfaces/chain';
import type { ITokenInfo } from '@/utils/interfaces/token';
import type { FormState } from 'react-hook-form';
import { useAccount } from 'wagmi';


interface SubmitButtonProps {
  isConnected: boolean;
  isBridgeEnabled: boolean;
  isDestinationTokenValid: boolean;
  formState: FormState<{
    fromWalletAddress: string;
    toWalletAddress: string;
    amount: string;
    fromChain?: IChainInfo;
    toChain?: IChainInfo;
    token?: ITokenInfo;
  }>;
  isFullField?: boolean;
  userDesBalance?: string;
  isSufficientBalance?: boolean;
  handleOpenConnectModal: () => void;
}

function SubmitButton({
  isConnected,
  isBridgeEnabled,
  // isDestinationTokenValid,
  formState,
  userDesBalance,
  handleOpenConnectModal,
  isFullField,
  isSufficientBalance,
}: SubmitButtonProps) {
  const { address } = useAccount();
const allTx = useTransactionStore((state) => state.allTx);
const userTxs = address ? allTx?.[address] || [] : [];
const MAX_PENDING_DURATION_MS = 1 * 60 * 1000;
const now = Date.now();
const currentPendingLocalTx = userTxs.find(
  (tx) =>
    tx.source === ChainTokenSource.Local &&
    tx.status !== CCIPTransactionStatus.TARGET &&
    now - (tx.createdAt ?? 0) < MAX_PENDING_DURATION_MS
);
  return (
    <div className='pt-4'>
      {!isConnected ? (
        <Button
          type='button'
          className='w-full bg-gradient-to-r from-primary via-cyan-400 to-purple-500 hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg text-white py-2 rounded-lg'
          onClick={handleOpenConnectModal}
        >
          Connect Wallet
        </Button>
      ) : (
        <Button
          type='submit'
          className='w-full bg-gradient-to-r from-primary via-cyan-400 to-purple-500 hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg text-white py-2 rounded-lg'
          disabled={
            !isBridgeEnabled ||
            !isFullField ||
            !userDesBalance ||
            !isSufficientBalance || !!currentPendingLocalTx
          }
        >
          {formState.isSubmitting || currentPendingLocalTx  ? (
            <span className='flex items-center justify-center gap-2'>
              <svg
                className='animate-spin h-4 w-4'
                viewBox='0 0 24 24'
                fill='none'
              >
                <circle
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='white'
                  strokeWidth='4'
                  className='opacity-25'
                />
                <path
                  fill='white'
                  className='opacity-75'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'
                />
              </svg>
              Processing...
            </span>
          ) : !isFullField ? (
            'Bridge'
              )
                :
                !userDesBalance ? (
            'No valid destination balance'
                )
                  :
                   !isSufficientBalance ? (
            'Insufficient balance'
                )
                  :
                  (
            'Bridge'
          )}
        </Button>
      )}
    </div>
  );
}

export default SubmitButton;
