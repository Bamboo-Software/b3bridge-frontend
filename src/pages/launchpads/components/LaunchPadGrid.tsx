import Image from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { getStatusBadge } from '@/utils/launchpads';
import { useNavigate } from 'react-router-dom';
import { routesPaths } from '@/utils/constants/routes';
import type { PresaleListItem } from '@/utils/interfaces/launchpad';
import type { LaunchpadSupportedChain } from '@/utils/interfaces/chain';
import { PresaleStatus } from '@/utils/enums/presale';
import { ChainProgress } from './LaunchPadProgress';
import { useMemo } from 'react';
import { useCountdown, type CountdownTime } from '@/hooks/useCountdown';

interface LaunchpadCardProps {
  presale: PresaleListItem;
  supportedChains: LaunchpadSupportedChain[];
}

const LaunchpadCard: React.FC<LaunchpadCardProps> = ({
  presale,
  supportedChains,
}) => {
  const navigate = useNavigate();
  
  const handleViewClick = () => {
    navigate(routesPaths.LAUNCHPAD_DETAIL(presale.id));
  };
  
  console.log("🚀 ~ presale:", presale.status)
  // Format time remaining
  const getTimeRemaining = () => {
    const now = new Date();
    const startTime = new Date(presale.startTime);
    const endTime = new Date(presale.endTime);
    
    if (now < startTime) {
      const diff = startTime.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      return `${days}d ${hours}h`;
    } else if (now < endTime) {
      const diff = endTime.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      return `${days}d ${hours}h`;
    }
    return null;
  };
const targetDate = useMemo(() => {
  if (presale.status === PresaleStatus.PENDING) {
    return presale.startTime;
  } else if (presale.status === PresaleStatus.ACTIVE) {
    return presale.endTime;
  }
  return null;
}, [presale.status, presale.startTime, presale.endTime]);
  const countdown = useCountdown(targetDate);
  function formatCountdown(countdown: CountdownTime): string {
  const { days, hours, minutes, seconds } = countdown;
  return `${days}:${hours}:${minutes}:${seconds}`;
}
  const timeRemaining = getTimeRemaining();

  // Get chain logo from supportedChains API data by chainId
  const getChainLogo = (chainId: string) => {
    const chainInfo = supportedChains.find(chain => chain.chainId === chainId);
    console.log("🚀 ~ getChainLogo ~ chainInfo:", chainInfo)
    return chainInfo?.icon || '/images/default-coin-logo.jpg';
  };

  // Get primary token info from first chain
  const primaryChain = presale.presaleChains[0];

  return (
    <div className='bg-[color:var(--gray-night)] border border-[color:var(--gray-charcoal)] rounded-2xl p-6 hover:border-primary/30 transition-colors h-fit'>
      {/* Header */}
      <div className='flex items-start justify-between mb-6'>
        <div className='flex w-full gap-3 items-start justify-between'>
          <div className="flex flex-col gap-2">
            <Image
              src={primaryChain?.oftToken.logoUrl || '/images/default-coin-logo.jpg'}
              fallbackSrc='/images/default-coin-logo.jpg'
              alt={presale.title}
              className='w-12 h-12 rounded-full'
            />
            <h3 className='text-xl font-semibold text-foreground'>
              {presale.title}
            </h3>
          </div>
          <div> {getStatusBadge(presale.status)}</div>
        </div>
        {/* {getStatusBadge(presale.status)} */}
      </div>

      {/* Description */}
      <p className='text-sm text-muted-foreground mb-4 line-clamp-2'>
        {presale.description}
      </p>

      {/* Tags */}
      {presale.tags && presale.tags.length > 0 && (
        <div className='flex flex-wrap gap-2 mb-4'>
          {presale.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className='px-2 py-1 text-xs bg-primary/10 text-primary rounded-full'
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Chains Progress - Sử dụng component ChainProgress */}
      <div className='space-y-3 mb-4'>
        {presale.presaleChains.map((chain) => (
          <ChainProgress
            key={chain.id}
            chain={{
              id: chain.id,
              chainId: chain.chainId,
              hardCap: chain.hardCap,
              softCap: chain.softCap,
              totalRaised: chain.totalRaised,
              paymentTokenAddress: chain.paymentTokenAddress,
            }}
            getChainLogo={getChainLogo}
          />
        ))}
      </div>

      {/* Footer */}
      <div className='flex items-center justify-between pt-4 border-t border-[color:var(--gray-charcoal)]'>
        <div className='text-sm'>
          {presale.status === PresaleStatus.PENDING && targetDate && (
            <span className="text-foreground">
              Sale Starts in{' '}
              <span className="font-mono font-extrabold text-[20px]">{formatCountdown(countdown)}</span>
            </span>
          )}
          {presale.status === PresaleStatus.ACTIVE && timeRemaining && (
            <span className='text-foreground'>
              Sale Ends in{' '}
              <span className='font-mono'>{formatCountdown(countdown)}</span>
            </span>
          )}
          {presale.status === PresaleStatus.ENDED && (
            <span className='text-foreground'>
              Presale <span className='text-red-500'>Ended</span>
            </span>
          )}
          {presale.status === PresaleStatus.CANCELLED && (
            <span className='text-foreground'>
              Presale <span className='text-gray-500'>Cancelled</span>
            </span>
          )}
          {presale.status === PresaleStatus.FINALIZED && (
            <span className='text-foreground'>
              Presale <span className='text-green-500'>Finalized</span>
            </span>
          )}
          {presale.status === PresaleStatus.DRAFT && (
            <span className='text-foreground'>
              Presale <span className='text-yellow-500'>Draft</span>
            </span>
          )}
        </div>
        <Button
          onClick={handleViewClick}
          className=' bg-[linear-gradient(45deg,_var(--blue-primary),_var(--primary))]
        shadow-[0_0px_10px_0_var(--blue-primary)]
        border-none
        rounded-lg
        cursor-pointer
        hover:opacity-90
        hover:shadow-[0_0px_16px_0_var(--blue-primary)] text-foreground'
          size='sm'
        >
          View
        </Button>
      </div>
    </div>
  );
};

interface LaunchpadGridProps {
  presales: PresaleListItem[];
  supportedChains: LaunchpadSupportedChain[];
}

export const LaunchpadGrid: React.FC<LaunchpadGridProps> = ({
  presales,
  supportedChains,
}) => {
  if (presales.length === 0) {
    return (
      <div className='text-center py-12'>
        <p className='text-muted-foreground'>No presales found</p>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start'>
      {presales.map((presale) => (
        <LaunchpadCard 
          key={presale.id} 
          presale={presale} 
          supportedChains={supportedChains}
        />
      ))}
    </div>
  );
};