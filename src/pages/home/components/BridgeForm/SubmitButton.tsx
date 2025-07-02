import { Button } from '@/components/ui/button';
import type { IChainInfo } from '@/utils/interfaces/chain';
import type { ITokenInfo } from '@/utils/interfaces/token';
import type { FormState } from 'react-hook-form';

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
  handleOpenConnectModal: () => void;
}

function SubmitButton({
  isConnected,
  isBridgeEnabled,
  isDestinationTokenValid,
  formState,
  handleOpenConnectModal,
}: SubmitButtonProps) {
  return (
    <div className='pt-4'>
      {!isConnected ? (
        <button
          type='button'
          className='w-full bg-gradient-to-r from-primary via-cyan-400 to-purple-500 hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg text-white py-2 rounded-lg cursor-pointer'
          onClick={handleOpenConnectModal}
        >
          Connect Wallet
        </button>
      ) : (
        <Button
          type='submit'
          className='w-full bg-gradient-to-r from-primary via-cyan-400 to-purple-500 hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg text-white py-2 rounded-lg'
          disabled={!isBridgeEnabled}
        >
          {formState.isSubmitting ? (
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
          ) : !isDestinationTokenValid ? (
            "Destination token not available"
          ) : (
            'Bridge'
          )}
        </Button>
      )}
    </div>
  );
}

export default SubmitButton;