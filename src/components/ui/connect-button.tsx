import { useState, useCallback, useRef, useEffect } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { Button } from './button';
import {
  WalletIcon,
  Copy,
  Check,
  ChevronDown,
  Unplug,
  ListOrdered,
} from 'lucide-react';
import { cn } from '@/utils';
import { TransactionModal } from '@/pages/common/TransactionModal';
import { WalletConnectModal } from '@/pages/common/ConnectWalletModal';
import { useWallet } from '@solana/wallet-adapter-react';
import { getWalletByKey } from '@/utils/constants/wallet';
import {
  preSaleAuthApi,
  useGetMetamaskNonceMutation,
} from '@/services/pre-sale/pre-sale-auth';
import { ChainType } from '@/utils/enums/chain';
import { signMessage } from '@wagmi/core';
import { wagmiConfig } from '@/utils/constants/wallet/wagmi';
import { useAuthToken } from '@/hooks/useAuthToken';

// Custom hook useCopyToClipboard
type CopiedValue = string | null;
type CopyFn = (text: string) => Promise<boolean>;

function useCopyToClipboard(): [CopiedValue, CopyFn] {
  const [copiedText, setCopiedText] = useState<CopiedValue>(null);

  const copy: CopyFn = useCallback(async (text) => {
    if (!navigator?.clipboard) {
      console.warn('Clipboard not supported');
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => {
        setCopiedText(null);
      }, 2000);
      return true;
    } catch (error) {
      console.warn('Copy failed', error);
      setCopiedText(null);
      return false;
    }
  }, []);

  return [copiedText, copy];
}

export function ConnectButton({ className }: { className?: string }) {
  const { address: evmAddress, isConnected, connector, chainId } = useAccount();
  const {setToken, removeToken} = useAuthToken()
  const {
    publicKey: solanaPubKey,
    connected,
    disconnect: disconnectSolanaWallet,
    wallet: solanaWallet,
  } = useWallet();
  const { disconnect } = useDisconnect();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copiedText, copyToClipboard] = useCopyToClipboard();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const { useLoginMetamaskMutation } = preSaleAuthApi;

  const [getMetamaskNonce] = useGetMetamaskNonceMutation();
  const [loginMetamask] = useLoginMetamaskMutation();

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
      const {data: response} = await loginMetamask({
        walletAddress: evmAddress,
        signature,
        chainType: ChainType.EVM,
        chainId,
        message,
      });
      if(!response?.data?.token) throw new Error('Login failed');
      setToken(response?.data?.token)
      setModalOpen(false);
    } catch (e) {
      disconnect();
      console.error('Error connecting EVM wallet:', e);
    }
  };

  const handleAfterConnectSolana = async () => {};

  useEffect(() => {
    if (modalOpen) {
      if (isConnected) {
        handleAfterConnectEvm();
      } else if (connected) {
        handleAfterConnectSolana();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, connected, modalOpen, connector, solanaWallet]);

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  const handleDisconnect = async () => {
    removeToken()
    disconnect();
    setIsDropdownOpen(false);
    await disconnectSolanaWallet();
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleCopy = async () => {
    if (evmAddress || solanaPubKey) {
      await copyToClipboard(evmAddress || solanaPubKey?.toBase58() || '');
      setTimeout(() => {
        setIsDropdownOpen(false);
      }, 2000);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isCopied = copiedText === (evmAddress || solanaPubKey?.toBase58());

  return (
    <div className='relative' ref={dropdownRef}>
      <WalletConnectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
      {isConnected || connected ? (
        <>
          <Button
            onClick={toggleDropdown}
            variant='outline'
            className={cn(
              'flex items-center gap-2 bg-primary/10 hover:bg-primary/20 border-primary/20',
              className
            )}
          >
            <WalletIcon className='h-4 w-4' />
            <span className='text-sm font-medium'>
              {formatAddress(evmAddress || solanaPubKey?.toBase58() || '')}
            </span>
            <ChevronDown className='h-4 w-4 opacity-50' />
          </Button>

          {isDropdownOpen && (
            <div className='absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-card border border-primary/10 z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 slide-in-from-top-2'>
              <div className='p-1 space-y-1'>
                <Button
                  onClick={handleCopy}
                  variant='ghost'
                  className='w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors flex items-center'
                >
                  {isCopied ? (
                    <Check className='h-4 w-4 text-green-500' />
                  ) : (
                    <Copy className='h-4 w-4' />
                  )}
                  <span>Copy Address</span>
                </Button>
                <Button
                  onClick={handleDisconnect}
                  variant='ghost'
                  className='w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors'
                >
                  <Unplug className='h-4 w-4' />
                  <span>Disconnect</span>
                </Button>
                <Button
                  onClick={() => setTransactionModalOpen(true)}
                  variant='ghost'
                  className='w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors'
                >
                  <ListOrdered className='h-4 w-4' />
                  <span>Your transactions</span>
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <Button
          onClick={() => setModalOpen(true)}
          variant='default'
          className={cn(
            'bg-gradient-to-r from-primary via-cyan-400 to-purple-500 hover:opacity-90 transition-all duration-300',
            className
          )}
        >
          <WalletIcon className='h-4 w-4 mr-2' />
          Connect Wallet
        </Button>
      )}
      <TransactionModal
        open={transactionModalOpen}
        setOpen={setTransactionModalOpen}
      />
    </div>
  );
}
