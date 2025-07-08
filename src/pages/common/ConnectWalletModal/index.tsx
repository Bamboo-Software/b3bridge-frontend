import { useEffect, useState } from 'react';
import { WalletIcon } from 'lucide-react';
import { cn } from '@/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ChainType } from '@/utils/enums/chain';
import ConnectWalletByChainTypeModal from './components/ConnectWalletByChainTypeModal';
import Image from '@/components/ui/image';
import { getWalletByKey, walletConfig } from '@/utils/constants/wallet';

interface WalletConnectModalProps {
  open: boolean;
  onClose: () => void;
}

export function WalletConnectModal({ open, onClose }: WalletConnectModalProps) {
  const [selectedWallet, setSelectedWallet] = useState<ReturnType<
    typeof getWalletByKey
  > | null>(null);

  const supportedWallets = walletConfig.filter(
    (w) => w.chainKeys[ChainType.EVM] || w.chainKeys[ChainType.Solana]
  );

  const handleWalletSelect = (walletKey: string) => {
    const wallet = getWalletByKey(walletKey);
    setSelectedWallet(wallet || null);
  };

  useEffect(()=> {
    if(!open) setSelectedWallet(null)
  }, [open])

  return (
    <>
      {/* Modal chọn ví */}
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className='!max-w-sm w-full'>
          <DialogHeader>
            <DialogTitle className='text-lg font-bold text-center'>
              Connect Wallet
            </DialogTitle>
          </DialogHeader>
          <div className='space-y-3 mt-2'>
            {supportedWallets.map((wallet) => (
              <Button
                key={wallet.name}
                onClick={() =>
                  handleWalletSelect(
                    wallet.chainKeys[ChainType.EVM] ||
                      wallet.chainKeys[ChainType.Solana]!
                  )
                }
                variant='outline'
                className={cn(
                  'w-full flex items-center gap-3 justify-start px-4 py-3 border-primary/20 hover:bg-primary/10 transition cursor-pointer'
                )}
              >
                {wallet.logo ? (
                  <Image
                    src={wallet.logo}
                    alt={wallet.name}
                    className='w-7 h-7 rounded-md'
                  />
                ) : (
                  <WalletIcon className='w-7 h-7' />
                )}
                <span className='font-medium text-base'>{wallet.name}</span>
              </Button>
            ))}
          </div>

          <DialogFooter className='mt-2'>
            <Button
              onClick={onClose}
              variant='ghost'
              className='w-full bg-gradient-to-r from-primary via-cyan-400 to-purple-500 hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer text-black hover:text-black'
              type='button'
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConnectWalletByChainTypeModal
        selectedWalletState={{
          selectedWallet,
          setSelectedWallet,
        }}
      />
    </>
  );
}
