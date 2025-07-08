import { Button } from '@/components/ui/button';
import { DialogFooter, DialogHeader, Dialog,
DialogContent,
DialogTitle, } from '@/components/ui/dialog';
import Image from '@/components/ui/image';
import { ChainType } from '@/utils/enums/chain';
import type { WalletConfig } from '@/utils/interfaces/wallet';
import { useWallet } from '@solana/wallet-adapter-react';
import type { Dispatch, SetStateAction } from 'react';
import { toast } from 'sonner';
import { useConnect } from 'wagmi';
import EVMLogo from "@/assets/icons/ethereum-logo.svg"
import SolanaLogo from "@/assets/icons/solana-logo.svg"
function ConnectWalletByChainTypeModal({
  selectedWalletState,
}: {
  selectedWalletState: {
    selectedWallet?: WalletConfig | null;
    setSelectedWallet: Dispatch<
      SetStateAction<WalletConfig | null | undefined>
    >;
  };
}) {
  const { connect, connectors, isPending } = useConnect();
  const { wallets: solanaWallets, select } = useWallet();

  const handleSolanaConnect = (walletName: string) => {
    const wallet = solanaWallets.find((w) => w.adapter.name === walletName);
    if (wallet) {
      select(wallet.adapter.name)
    } else {
      toast.error('Solana wallet adapter not found');
    }
  };

  const { selectedWallet, setSelectedWallet } = selectedWalletState;

  return (
    <>
      <Dialog
        open={!!selectedWallet}
        onOpenChange={() => setSelectedWallet(null)}
      >
        <DialogContent className='!max-w-xs w-full'>
          <DialogHeader>
            <DialogTitle className='text-lg font-bold text-center'>
              Select Chain
            </DialogTitle>
          </DialogHeader>
          <div className='text-center flex flex-col gap-1 items-center'>
            <Image
              src={selectedWallet?.logo || ''}
              alt={selectedWallet?.name || ''}
              className='w-20 h-20 rounded-md'
            />
            <p>
              Select Chain for {selectedWallet?.name}
            </p>
            <p className='text-xs'>
              Select which chain to connect to your wallet
            </p>
          </div>

          <div className='space-y-3 mt-2'>
            {selectedWallet?.chainKeys[ChainType.EVM] && (
              <>
                {connectors
                  .filter(
                    (c) => c.id === selectedWallet.chainKeys[ChainType.EVM]
                  )
                  .map((connector) => 
                      <Button
                        key={connector.id}
                        onClick={() => {
                          connect({ connector });
                        }}
                        disabled={isPending}
                        variant='outline'
                        className='w-full py-6 flex !justify-between cursor-pointer'
                        size={"lg"}
                        
                      >
                        <Image
                          alt='EVM logo'
                          fallbackSrc='/images/default-coin-logo.jpg'
                          src={ EVMLogo || ''}
                          className='w-9 h-9 rounded-xl'
                        />
                        <span className='me-9'>
                         EVM
                        </span>
                        <span></span>
                      </Button>
                  )}
              </>
            )}

            {selectedWallet?.chainKeys[ChainType.Solana] && (
              <Button
                variant='outline'
                className='w-full py-6 flex !justify-between cursor-pointer'
                size={"lg"}
                disabled
                onClick={() =>
                  handleSolanaConnect(
                    selectedWallet.chainKeys[ChainType.Solana]!
                  )
                }
                
              >
                <Image
                  alt='Solana logo'
                  fallbackSrc='/images/default-coin-logo.jpg'
                  src={ SolanaLogo || ''}
                  className='w-9 h-9 rounded-xl'
                />
                <span className=''>
                  Solana
                </span>
                <span className='text-red-400 text-xs'>Soon</span>
              </Button>
            )}
          </div>

          <DialogFooter className='mt-2'>
            <Button
              onClick={() => setSelectedWallet(null)}
              variant='ghost'
              className='w-full bg-gradient-to-r from-primary via-cyan-400 to-purple-500 hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer text-black hover:text-black'
              type='button'
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ConnectWalletByChainTypeModal;
