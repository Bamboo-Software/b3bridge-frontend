import React, { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { ChevronDown, Copy, CheckIcon, Check } from 'lucide-react';
import Image from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { configLaunchPadsChains } from '@/utils/constants/chain';
import { getChainImage } from '@/utils/blockchain/chain';
import { ChainTokenSource } from '@/utils/enums/chain';
import type { CreateTokenFormValues } from '../CreateTokenFormValidation';
import { formatNumber } from '@/utils';

interface TokenInfoDisplayProps {
  formData: CreateTokenFormValues;
  chainId: string;
  showFees?: boolean;
  watchedChainFields: CreateTokenFormValues['chainFields'];
  showPayButton?: boolean;
  address?: string;
  onPay?: (chainId: string) => void;
  nativeAmount?: string;
  totalSupply?: string;
}

const TokenInfoDisplay: React.FC<TokenInfoDisplayProps> = ({
  formData,
  chainId,
  showFees = false,
  showPayButton = false,
  address = '',
  onPay,
  nativeAmount = '',
  totalSupply = '',
  watchedChainFields
}) => {
  console.log("🚀 ~ formData:", formData)
  const chain = configLaunchPadsChains.find((c) => c.id.toString() === chainId.toString());
  const [isOpen, setIsOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  if (!chain) return null;

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const feeText = showFees ? `${nativeAmount} ${chain.nativeCurrency.symbol}` : null;
  const payStatus = watchedChainFields?.[chainId]?.transactions?.native?.payStatus;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="bg-[#1a1d21] rounded-lg p-4 space-y-3">
        {/* Trigger */}
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3">
              <Image
                objectFit="contain"
                src={getChainImage({ chainId: chain.id, source: ChainTokenSource.Local })}
                alt={chain.name}
                className="w-5 h-5 rounded-full"
              />
              <span className="text-white font-medium">{chain.name}</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </CollapsibleTrigger>

        {/* Collapsible Content */}
        <CollapsibleContent className="space-y-4 pt-2">
          {/* Token info */}
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Name</span>
            <span className="text-[#34D3FF] font-medium">{formData.name || 'Defi'}</span>
          </div>
          <Separator className="bg-[#373B40]" />
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Symbol</span>
            <span className="text-[#34D3FF] font-medium">{formData.symbol || 'DEFI'}</span>
          </div>
          <Separator className="bg-[#373B40]" />
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Decimals</span>
            <span className="text-[#34D3FF] font-medium">{formData.decimals || 18}</span>
          </div>
          <Separator className="bg-[#373B40]" />
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Total Supply</span>
            <span className="text-[#34D3FF] font-medium">{totalSupply}</span>
          </div>

          {address && (
            <>
              <Separator className="bg-[#373B40]" />
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Address</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#34D3FF] text-sm">{address}</span>
                  <button onClick={copyAddress} className="text-gray-400 hover:text-white">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </>
          )}

          {feeText && (
            <>
              <Separator className="bg-[#373B40]" />
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total fees: <span className="text-[#34D3FF]">{formatNumber(nativeAmount,0,2)} {chain.nativeCurrency.symbol}</span></span>
                {showPayButton && (
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      className="bg-[linear-gradient(45deg,_var(--blue-primary),_var(--primary))] shadow-[0_0px_10px_0_var(--blue-primary)] border-none rounded-lg cursor-pointer hover:opacity-90 hover:shadow-[0_0px_16px_0_var(--blue-primary)] text-foreground px-6 py-1 h-8 text-sm"
                      onClick={() => onPay?.(chainId)}
                      disabled={payStatus === 'pending'}
                    >
                      Pay
                    </Button>
                    {payStatus === 'pending' && (
                      <span className="text-yellow-400">Pending...</span>
                    )}
                    {payStatus === 'success' && (
                      <span className="ml-4 px-4 py-1 rounded-full bg-green-900/30 text-green-400 flex items-center gap-1 border border-green-700">
                        Payment successful <CheckIcon className="w-4 h-4" />
                      </span>
                    )}
                    {payStatus === 'error' && (
                      <span className="text-red-400">Error</span>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default TokenInfoDisplay;
