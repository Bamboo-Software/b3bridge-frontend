import { useState, useCallback, useRef, useEffect } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { Button } from './button';
import { WalletIcon, Copy, Check, ChevronDown, Unplug } from 'lucide-react';
import { cn } from '@/utils';
import { WalletConnectModal } from '@/pages/common/ConnectWalletModal';

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
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copiedText, copyToClipboard] = useCopyToClipboard();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (modalOpen && isConnected) {
      setModalOpen(false);
    }
  }, [isConnected, modalOpen]);

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const handleDisconnect = () => {
    disconnect();
    setIsDropdownOpen(false);
    // location.reload();
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleCopy = async () => {
    if (address) {
      await copyToClipboard(address);
      setTimeout(() => {
        setIsDropdownOpen(false);
      }, 2000);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isCopied = copiedText === address;

  return (
    <div className="relative" ref={dropdownRef}>
      <WalletConnectModal open={modalOpen} onClose={() => setModalOpen(false)} />
      {isConnected ? (
        <>
          <Button
            onClick={toggleDropdown}
            variant="outline"
            className={cn(
              "flex items-center gap-2 bg-primary/10 hover:bg-primary/20 border-primary/20",
              className
            )}
          >
            <WalletIcon className="h-4 w-4" />
            <span className="text-sm font-medium">{formatAddress(address || '')}</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
          
          {isDropdownOpen && (
            <div 
              className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-card border border-primary/10 z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 slide-in-from-top-2"
            >
              <div className="p-1 space-y-1">
                <Button
                  onClick={handleCopy}
                  variant="ghost"
                  className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors flex items-center"
                >
                  {isCopied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                <span>Copy Address</span>

                </Button>
                <Button
                  onClick={handleDisconnect}
                  variant="ghost"
                  className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                    <Unplug className="h-4 w-4"/>
                  <span>Disconnect</span> 
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <Button
          onClick={() => setModalOpen(true)}
          variant="default"
          className={cn(
            "bg-gradient-to-r from-primary via-cyan-400 to-purple-500 hover:opacity-90 transition-all duration-300",
            className
          )}
        >
          <WalletIcon className="h-4 w-4 mr-2" />
          Connect Wallet
        </Button>
      )}
    </div>
  );
}