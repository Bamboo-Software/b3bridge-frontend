import React from 'react';
import Image from '@/components/ui/image';
import { Progress } from '@/components/ui/progress';
import { formatEther } from 'viem';
import { useTokenData } from '@/hooks/useTokenData';
import { ZeroAddress } from 'ethers';
import { formatNumber } from '@/utils';

interface ChainProgressProps {
  chain: {
    id: string;
    chainId: string;
    hardCap: string;
    totalRaised: string;
    paymentTokenAddress?: string;
  };
  getChainLogo: (chainId: string) => string;
}

export const ChainProgress: React.FC<ChainProgressProps> = ({
  chain,
  getChainLogo,
}) => {
  const { tokenData, loading } = useTokenData(
    chain.paymentTokenAddress || ZeroAddress,
    parseInt(chain.chainId)
  );

  const hardCapBigInt = BigInt(chain.hardCap);
  const totalRaisedBigInt = BigInt(chain.totalRaised);
  
  const progress = hardCapBigInt > 0n 
    ? Number((totalRaisedBigInt * 100n) / hardCapBigInt)
    : 0;

  const totalRaisedFormatted = formatNumber(formatEther(totalRaisedBigInt))
  const hardCapFormatted = formatNumber(formatEther(hardCapBigInt))
  
  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between text-sm'>
        <div className='flex items-center gap-2'>
          <Image
            src={getChainLogo(chain.chainId)}
            fallbackSrc='/images/default-coin-logo.jpg'
            alt={`Chain ${chain.chainId}`}
            className='w-4 h-4 rounded-full'
          />
          <span className='text-primary'>
            {totalRaisedFormatted} / {hardCapFormatted} {loading ? '...' : tokenData.symbol}
          </span>
        </div>
        <span className='text-muted-foreground'>
          Progress ({formatNumber(progress, 0, 0)}%)
        </span>
      </div>
      
      <Progress value={progress} className='h-2' />
      
      <div className='flex justify-between text-xs text-muted-foreground'>
        <span>
          {totalRaisedFormatted} {loading ? '...' : tokenData.symbol}
        </span>
        <span>
          {hardCapFormatted} {loading ? '...' : tokenData.symbol}
        </span>
      </div>
    </div>
  );
};