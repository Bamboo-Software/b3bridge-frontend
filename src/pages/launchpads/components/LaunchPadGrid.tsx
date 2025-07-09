import type { LaunchpadData } from '..';
import Image from '@/components/ui/image';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { getStatusBadge } from '@/utils/launchpads';
import { useNavigate } from 'react-router-dom';
import { routesPaths } from '@/utils/constants/routes';

const LaunchpadCard: React.FC<{ launchpad: LaunchpadData }> = ({
  launchpad,
}) => {
  const navigate = useNavigate();

  const handleViewClick = () => {
    navigate(routesPaths.LAUNCHPAD_DETAIL(launchpad.id));
  };

  return (
    <div className='bg-[color:var(--gray-night)] border border-[color:var(--gray-charcoal)] rounded-2xl p-6 hover:border-primary/30 transition-colors h-fit'>
      {/* Header */}
      <div className='flex items-start justify-between mb-6'>
        <div className='flex items-center gap-3'>
          <div className="flex flex-col gap-4">
            <Image
              src={launchpad.logo}
              fallbackSrc='/images/default-coin-logo.jpg'
              alt={launchpad.name}
              className='w-12 h-12 rounded-full'
            />
            <h3 className='text-xl font-semibold text-foreground'>
              {launchpad.name}
            </h3>
          </div>
        </div>
        {getStatusBadge(launchpad.status)}
      </div>

      {/* Chains Progress */}
      <div className='space-y-3 mb-4'>
        {launchpad.chains.map((chain) => (
          <div key={chain.id} className='space-y-2'>
            <div className='flex items-center justify-between text-sm'>
              <div className='flex items-center gap-2'>
                <Image
                  src={chain.logo}
                  fallbackSrc='/images/default-coin-logo.jpg'
                  alt={chain.name}
                  className='w-4 h-4 rounded-full'
                />
                <span className='text-primary'>
                  {chain.raised} - {chain.target} {chain.token}
                </span>
              </div>
              <span className='text-muted-foreground'>
                Progress ({chain.progress}%)
              </span>
            </div>
            <Progress value={chain.progress} className='h-2' />
            <div className='flex justify-between text-xs text-muted-foreground'>
              <span>
                {chain.raised} {chain.token}
              </span>
              <span>
                {chain.target} {chain.token}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className='flex items-center justify-between pt-4 border-t border-[color:var(--gray-charcoal)]'>
        <div className='text-sm'>
          {launchpad.status === 'upcoming' && launchpad.saleTime.start && (
            <span className='text-foreground'>
              Sale Starts in{' '}
              <span className='font-mono'>{launchpad.saleTime.start}</span>
            </span>
          )}
          {launchpad.status === 'live' && launchpad.saleTime.end && (
            <span className='text-foreground'>
              Sale Ends in{' '}
              <span className='font-mono'>{launchpad.saleTime.end}</span>
            </span>
          )}
          {launchpad.status === 'ended' && (
            <span className='text-foreground'>
              Presale <span className='text-red-500'>Ended</span>
            </span>
          )}
          {launchpad.status === 'cancelled' && (
            <span className='text-foreground'>
              Presale <span className='text-gray-500'>Cancelled</span>
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

export const LaunchpadGrid: React.FC<{ launchpads: LaunchpadData[] }> = ({
  launchpads,
}) => {
  if (launchpads.length === 0) {
    return (
      <div className='text-center py-12'>
        <p className='text-muted-foreground'>No launchpads found</p>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start'>
      {launchpads.map((launchpad) => (
        <LaunchpadCard key={launchpad.id} launchpad={launchpad} />
      ))}
    </div>
  );
};