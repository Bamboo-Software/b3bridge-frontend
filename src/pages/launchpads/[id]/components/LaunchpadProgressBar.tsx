import { formatNumber, parseFormattedNumber } from '@/utils';
import Image from '@/components/ui/image';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
  hasContributed?: boolean;
  userContributionAmount?: number;
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
  supportedChains,
  hasContributed = false,
  userContributionAmount = 0,
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
    <TooltipProvider>
      <div key={chain.id} className='space-y-2'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
              <div className='flex items-center gap-2 cursor-pointer'>
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
          </div>
          <span className='text-blue-400 font-medium'>
            {formatNumber(targetAmount)} {tokenSymbol}
          </span>
        </div>

        {/* Enhanced Progress Bar with User Contribution Indicator */}
        <div className='relative'>
          <Progress
            value={
              targetAmount > 0
                ? (totalRaised / targetAmount) * 100
                : 0
            }
            className='h-2 bg-[#2a3441]'
          />
          
          {/* User contribution indicator on progress bar */}
          {hasContributed && userContributionAmount > 0 && targetAmount > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className='absolute top-0 h-2 bg-green-500 opacity-70 cursor-pointer rounded-3xl'
                  style={{
                    left: `${Math.min(0, ((totalRaised - userContributionAmount) / targetAmount) * 100)}%`,
                    width: `${Math.min(100, (userContributionAmount / targetAmount) * 100)}%`,
                  }}
                />
              </TooltipTrigger>
              <TooltipContent side="top"
                className='!bg-background [&_svg]:!fill-background [&_svg]:!bg-background border border-border shadow-md rounded-md p-3 w-64 text-xs text-foreground'
              >
                <p>Your contribution: {formatNumber(userContributionAmount)} {tokenSymbol}</p>
                <p className='text-xs text-gray-300'>
                  {((userContributionAmount / targetAmount) * 100).toFixed(2)}% of target
                </p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* User Contribution Status */}
        {hasContributed && userContributionAmount > 0 && (
          <div className='flex items-center justify-between text-xs'>
            <span className='text-green-400'>
              You contributed {formatNumber(userContributionAmount)} {tokenSymbol}
            </span>
            <span className='text-gray-400'>
              {((userContributionAmount / targetAmount) * 100).toFixed(2)}% of target
            </span>
          </div>
        )}

        {/* Amount Input */}
        {showInputs && (
          <div className='mt-3'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-white text-sm'>Amount</span>
              {hasContributed && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className='text-green-400 text-xs cursor-help'>
                      Already contributed
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-gray-800 text-white border-gray-600">
                    <p>You have already contributed {formatNumber(userContributionAmount)} {tokenSymbol}</p>
                    <p className='text-xs text-gray-300'>Additional contributions are not allowed</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <div className='relative'>
              <Input
                type='number'
                placeholder='0'
                value={amounts[chain.id] || ''}
                onChange={(e) => onAmountChange(chain.id, e.target.value)}
                className='bg-[#2a3441] border-[#3a4451] text-white pr-16'
                disabled={isContributing || hasContributed}
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => onMaxClick(chain.id, parseFormattedNumber(chain.maxContribution).toString())}
                    className='absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white h-6 px-2'
                    disabled={isContributing || hasContributed}
                  >
                    MAX
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-gray-800 text-white border-gray-600">
                  <p>Set maximum contribution: {formatNumber(chain.maxContribution)} {tokenSymbol}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        )}

        <div className='flex justify-between text-xs text-gray-400 mt-1'>
          <span>Min Buy: {formatNumber(chain.minContribution)} {tokenSymbol}</span>
          <span>Max Buy: {formatNumber(chain.maxContribution)} {tokenSymbol}</span>
        </div>
      </div>
    </TooltipProvider>
  );
}