import { formatNumber } from '@/utils';
import Image from '@/components/ui/image';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTokenData } from '@/hooks/useTokenData';
import { useMemo } from 'react';
import type { LaunchpadSupportedChain } from '@/utils/interfaces/chain';
import type { PresaleSupportedChain } from '@/utils/interfaces/launchpad';

interface ChainProgressBarProps {
  chain: PresaleSupportedChain;
  totalRaised: number;
  targetAmount: number;
  amounts: { [key: string]: string };
  isContributing: boolean;
  showInputs: boolean;
  onAmountChange: (chainId: string, value: string) => void;
  onMaxClick: (chainId: string, maxAmount: string) => void;
  supportedChains: LaunchpadSupportedChain[];
}

export function ChainProgressBar({
  chain,
  totalRaised,
  targetAmount,
  amounts,
  isContributing,
  showInputs,
  onAmountChange,
  onMaxClick,
  supportedChains
}: ChainProgressBarProps) {
  // Get native token data
  const { loading, tokenData, error } = useTokenData(
    chain.paymentTokenAddress,
    Number(chain.chainId)
  );

  // Find token logo from supported chains
  const tokenLogo = useMemo(() => {
    const supportedChain = supportedChains.find(sc => sc.chainId === chain.chainId);
    return supportedChain?.icon;
  }, [supportedChains, chain.chainId]);
  const tokenSymbol = tokenData?.symbol

  if (loading) {
    return (
      <div className='space-y-2 animate-pulse'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div className='w-6 h-6 rounded-full bg-gray-300' />
            <div className='h-4 w-20 bg-gray-300 rounded' />
          </div>
          <div className='h-4 w-16 bg-gray-300 rounded' />
        </div>
        <div className='h-2 w-full bg-gray-300 rounded' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='space-y-2'>
        <div className='text-red-500 text-sm'>Failed to load token data</div>
      </div>
    );
  }

  return (
    <div key={chain.id} className='space-y-2'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Image
            src={tokenLogo || ''}
            fallbackSrc='/images/default-coin-logo.jpg'
            alt={tokenSymbol}
            className='w-6 h-6 rounded-full'
          />
          <span className='text-blue-400 font-medium'>
            {formatNumber(totalRaised)} {tokenSymbol}
          </span>
        </div>
        <span className='text-blue-400 font-medium'>
          {formatNumber(targetAmount)} {tokenSymbol}
        </span>
      </div>
      <Progress
        value={
          targetAmount > 0
            ? (totalRaised / targetAmount) * 100
            : 0
        }
        className='h-2 bg-[#2a3441]'
      />

      {/* Amount Input */}
      {showInputs && (
        <div className='mt-3'>
          <div className='text-white text-sm mb-2'>Amount</div>
          <div className='relative'>
            <Input
              type='number'
              placeholder='0'
              value={amounts[chain.id] || ''}
              onChange={(e) => onAmountChange(chain.id, e.target.value)}
              className='bg-[#2a3441] border-[#3a4451] text-white pr-16'
              disabled={isContributing}
            />
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={() => onMaxClick(chain.id, chain.maxContribution.toString())}
              className='absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white h-6 px-2'
              disabled={isContributing}
            >
              MAX
            </Button>
          </div>
          <div className='flex justify-between text-xs text-gray-400 mt-1'>
            <span>Min Buy: {formatNumber(chain.minContribution)} {tokenSymbol}</span>
            <span>Max Buy: {formatNumber(chain.maxContribution)} {tokenSymbol}</span>
          </div>
        </div>
      )}
    </div>
  );
}