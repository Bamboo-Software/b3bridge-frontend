import { useState, useCallback, useRef, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from './button';
import { WalletIcon, Copy, Check, ChevronDown, Unplug } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copiedText, copyToClipboard] = useCopyToClipboard();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const handleConnect = () => {
    const connector = connectors.find(c => c.name === 'Injected');
    if (connector) {
      connect({ connector });
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setIsDropdownOpen(false);
    location.reload();
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
          onClick={handleConnect}
          disabled={isPending}
          variant="default"
          className={cn(
            "bg-gradient-to-r from-primary via-cyan-400 to-purple-500 hover:opacity-90 transition-all duration-300",
            className
          )}
        >
          {isPending ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Connecting...
            </>
          ) : (
            <>
              <WalletIcon className="h-4 w-4 mr-2" />
              Connect Wallet
            </>
          )}
        </Button>
      )}
    </div>
  );
}