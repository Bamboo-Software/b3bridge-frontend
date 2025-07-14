import React, { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Copy, CheckIcon, Check } from 'lucide-react';
import Image from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { configLaunchPadsChains } from '@/utils/constants/chain';
import { getChainImage } from '@/utils/blockchain/chain';
import { ChainTokenSource } from '@/utils/enums/chain';
import type { CreateTokenFormValues } from '../CreateTokenFormValidation';

interface TokenInfoDisplayProps {
  formData: CreateTokenFormValues;
  showFees?: boolean;
  showPayButton?: boolean;
  address?: string;
  onPay?: (chainId: string) => void;
  nativeAmount?: string;
  totalSupply?: string
}

const TokenInfoDisplay: React.FC<TokenInfoDisplayProps> = ({ formData, showFees = false, showPayButton = false, address,onPay,nativeAmount,totalSupply }) => {
  const defaultOpen = Object.fromEntries(configLaunchPadsChains.map((c) => [c.id, true]));
  const [copiedAddress, setCopiedAddress] = useState<number | null>(null);
  const [openChains, setOpenChains] = useState<Record<number, boolean>>(defaultOpen);

  const toggleChain = (chainId: number) => {
    setOpenChains((prev) => ({
      ...prev,
      [chainId]: !prev[chainId],
    }));
  };

  const copyAddress = (addr: string, chainId: number) => {
    navigator.clipboard.writeText(addr);
    setCopiedAddress(chainId);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  return (
    <>
      {/* Token Info */}
      <div className="space-y-4 bg-[#1b1e21] p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Name</span>
          <span className="text-[#34D3FF] font-medium">{formData.name || 'Defi'}</span>
        </div>
        <Separator className="bg-[#373B40]" />
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Symbol</span>
          <span className="text-[#34D3FF] font-medium">{formData.symbol || 'Defi Bamboo'}</span>
        </div>
        <Separator className="bg-[#373B40]" />
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Decimals</span>
          <span className="text-[#34D3FF] font-medium">{formData.decimals || 18}</span>
        </div>
      </div>

      {/* Chain Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white">Chain</h3>
        {formData.targetChains.map((chainId) => {
          const chain = configLaunchPadsChains.find((c) => c.id.toString() === chainId.toString());
          if (!chain) return null;

          const feeText = showFees ? `${nativeAmount} ${chain.nativeCurrency.symbol}` : null;

          return (
            <Collapsible key={chain.id} open={openChains[chain.id]} onOpenChange={() => toggleChain(chain.id)}>
              <div className="bg-[#1a1d21] rounded-lg p-4">
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Image
                        objectFit="contain"
                        src={getChainImage({
                          chainId: chain.id,
                          source: ChainTokenSource.Local,
                        })}
                        alt={chain.name}
                        className="w-5 h-5 rounded-full"
                      />
                      <span className="text-white font-medium">{chain.name}</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform ${openChains[chain.id] ? 'rotate-180' : ''}`}
                    />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total supply</span>
                    <span className="text-[#34D3FF] font-medium">
                      {totalSupply}
                    </span>
                  </div>
                  {address && (
                    <>
                      <Separator className="bg-[#373B40]" />
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Address</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[#34D3FF] text-sm">{address}</span>
                          <button
                            type="button"
                            onClick={() => copyAddress(address, chain.id)}
                            className="text-gray-400 hover:text-white"
                          >
                            {copiedAddress === chain.id ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                  {feeText && (
                    <>
                      <Separator className="bg-[#373B40]" />
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">
                          Total fees: <span className="text-[#34D3FF]">{feeText}</span>
                        </span>
                       {showPayButton && (
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              className="bg-[linear-gradient(45deg,_var(--blue-primary),_var(--primary))] shadow-[0_0px_10px_0_var(--blue-primary)] border-none rounded-lg cursor-pointer hover:opacity-90 hover:shadow-[0_0px_16px_0_var(--blue-primary)] text-foreground px-6 py-1 h-8 text-sm"
                              onClick={() => onPay?.(chainId)}
                              disabled={formData.chainFields?.[chainId]?.transactions?.native?.payStatus === 'pending'}
                            >
                              Pay
                            </Button>
                            {formData.chainFields?.[chainId]?.transactions?.native?.payStatus === 'pending' && (
                              <span className="text-yellow-400">Pending...</span>
                            )}
                            {formData.chainFields?.[chainId]?.transactions?.native?.payStatus === 'success' && (
                               <span className='ml-4 px-4 py-1 rounded-full bg-green-900/30 text-green-400 flex items-center gap-1 border border-green-700'>
                                                          Payment successful <CheckIcon className='w-4 h-4' />
                                                        </span>
                            )}
                            {formData.chainFields?.[chainId]?.transactions?.native?.payStatus === 'error' && (
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
        })}
      </div>
    </>
  );
};

export default TokenInfoDisplay;