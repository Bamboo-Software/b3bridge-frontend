/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAccount, useDisconnect } from 'wagmi';
import { WalletConnectModal } from './ConnectWalletModal';
import { useAuthToken } from '@/hooks/useAuthToken';
import { useWallet } from '@solana/wallet-adapter-react';
import { getWalletByKey } from '@/utils/constants/wallet';
import { ChainType } from '@/utils/enums/chain';
import { preSaleAuthApi, useGetMetamaskNonceMutation } from '@/services/pre-sale/pre-sale-auth';
import { wagmiConfig } from '@/utils/constants/wallet/wagmi';
import { signMessage } from 'wagmi/actions';

interface WalletConnectionRequiredProps {
  title?: string;
  description?: string;
  showConnectButton?: boolean;
}

export const WalletConnectionRequired: React.FC<
  WalletConnectionRequiredProps
> = ({
  title = 'Wallet Connection Required',
  description = 'Please connect your wallet to access this feature.',
  showConnectButton = true,
}) => {
  const [showConnectModal, setShowConnectModal] = useState(false);
  const { address: evmAddress, isConnected, connector, chainId } = useAccount();
  const { setToken } = useAuthToken();
  const { connected, wallet: solanaWallet } = useWallet();
  const { disconnect } = useDisconnect();
  const { useLoginMetamaskMutation } = preSaleAuthApi;
  
  const [getMetamaskNonce] = useGetMetamaskNonceMutation();
  const [loginMetamask] = useLoginMetamaskMutation();
  // Close modal when wallet is connected
  const handleAfterConnectEvm = async () => {
    try {
      if (!evmAddress || !isConnected) return;

      const wallet = getWalletByKey(connector?.id || '');

      if (!wallet) return;
      const nonceRes = await getMetamaskNonce({
        walletAddress: evmAddress,
        chainType: ChainType.EVM,
        chainId,
      });
      const message = nonceRes?.data?.data?.message || '';

      if (!message) throw new Error('Failed to get nonce message');
      const signature = await signMessage(wagmiConfig, {
        connector,
        account: evmAddress,
        message,
      });
      const { data: response } = await loginMetamask({
        walletAddress: evmAddress,
        signature,
        chainType: ChainType.EVM,
        chainId,
        message,
      });
      if (!response?.data?.token) throw new Error('Login failed');
      setToken(response?.data?.token);
      setShowConnectModal(false);
    } catch (e) {
      disconnect();
    }
  };

  const handleAfterConnectSolana = async () => {};

  useEffect(() => {
    if (showConnectModal) {
      if (isConnected) {
        handleAfterConnectEvm();
      } else if (connected) {
        handleAfterConnectSolana();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, connected, showConnectModal, connector, solanaWallet]);

  const handleConnectClick = () => {
    setShowConnectModal(true);
  };

  return (
    <>
      <div className='flex flex-col items-center justify-center py-16 px-6'>
        <div className='bg-[color:var(--gray-night)] border border-[color:var(--gray-charcoal)] rounded-2xl p-8 max-w-md w-full text-center'>
          <div className='mb-6'>
            <div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4'>
              <Wallet className='w-8 h-8 text-primary' />
            </div>
            <h3 className='text-xl font-semibold text-foreground mb-2'>
              {title}
            </h3>
            <p className='text-muted-foreground text-sm'>{description}</p>
          </div>

          {showConnectButton && (
            <Button
              onClick={handleConnectClick}
              className='bg-[linear-gradient(45deg,_var(--blue-primary),_var(--primary))]
                shadow-[0_0px_10px_0_var(--blue-primary)]
                border-none
                rounded-lg
                cursor-pointer
                hover:opacity-90
                hover:shadow-[0_0px_16px_0_var(--blue-primary)]
                w-full'
            >
              Connect Wallet
            </Button>
          )}
        </div>
      </div>

      {/* Connect Wallet Modal */}
      <WalletConnectModal
        open={showConnectModal}
        onClose={() => setShowConnectModal(false)}
      />
    </>
  );
};
