import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import Image from '@/components/ui/image';
import type { ContributorRow, PresaleDetailResponse } from '@/utils/interfaces/launchpad';
import { useAccount } from 'wagmi';
import { WalletConnectModal } from '@/pages/common/ConnectWalletModal';
import { PresaleStatus } from '@/utils/enums/presale';
import { preSaleAuthApi } from '@/services/pre-sale/pre-sale-auth';

interface LaunchpadSideBarProps {
  launchpad: PresaleDetailResponse;
  contributorState: ContributorRow[];
}

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function LaunchpadSideBar({ launchpad, contributorState }: LaunchpadSideBarProps) {
  const [amounts, setAmounts] = useState<{ [key: string]: string }>({});
  const [countdown, setCountdown] = useState<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const { useGetMeQuery } = preSaleAuthApi;
  const { data: user, isLoading: userLoading, isError: userError } = useGetMeQuery({});
  const { isConnected, address } = useAccount();

  // Check creator bằng userId
  const isCreator = user?.id && launchpad.userId && user.id === launchpad.userId;

  // Check đã contribute chưa (so sánh address với contributorState)
  const hasContributed = useMemo(() => {
    if (!address) return false;
    return contributorState.some((row) => row.address?.toLowerCase() === address.toLowerCase());
  }, [contributorState, address]);

  const handleAmountChange = (chainId: string, value: string) => {
    setAmounts(prev => ({
      ...prev,
      [chainId]: value
    }));
  };

  const handleMaxClick = (chainId: string, maxAmount: string) => {
    setAmounts(prev => ({
      ...prev,
      [chainId]: maxAmount
    }));
  };

  // Status display lấy từ enum
  const getStatusDisplay = () => {
    switch (launchpad.status) {
      case PresaleStatus.ACTIVE:
        if (!isConnected) {
          return {
            title: 'Presale Ends In',
            countdown: true,
            showInputs: true,
            buttonText: 'Connect Wallet',
            buttonEnabled: true,
            action: 'connect',
          };
        } else if (isCreator) {
          return {
            title: 'Presale Ends In',
            countdown: true,
            showInputs: false,
            buttonText: 'Finalize',
            buttonEnabled: true,
            action: 'finalize',
          };
        } else if (hasContributed) {
          return {
            title: 'Presale Ends In',
            countdown: true,
            showInputs: false,
            buttonText: 'Already Contributed',
            buttonEnabled: false,
            action: null,
          };
        } else {
          return {
            title: 'Presale Ends In',
            countdown: true,
            showInputs: true,
            buttonText: 'Contribute',
            buttonEnabled: true,
            action: 'contribute',
          };
        }
      case PresaleStatus.CANCELLED:
        return {
          title: 'Presale Cancelled',
          countdown: false,
          showInputs: false,
          buttonText: null,
          buttonEnabled: false,
          action: null,
        };
      case PresaleStatus.ENDED:
        return {
          title: 'Presale Ended',
          countdown: false,
          showInputs: false,
          buttonText: 'Claim',
          buttonEnabled: true,
          action: 'claim',
        };
      case PresaleStatus.PENDING:
        return {
          title: 'Presale Starts In',
          countdown: true,
          showInputs: false,
          buttonText: 'Coming Soon',
          buttonEnabled: false,
          action: null,
        };
      default:
        return {
          title: 'Presale',
          countdown: false,
          showInputs: false,
          buttonText: 'Connect Wallet',
          buttonEnabled: true,
          action: 'connect',
        };
    }
  };

  // Lấy ngày target cho countdown
  const getTargetDate = () => {
    if (launchpad.status === PresaleStatus.PENDING) {
      return launchpad.startTime;
    } else if (launchpad.status === PresaleStatus.ACTIVE) {
      return launchpad.endTime;
    }
    return null;
  };

  const calculateCountdown = () => {
    const targetDate = getTargetDate();
    if (!targetDate) return;

    const target = new Date(targetDate).getTime();
    const now = new Date().getTime();
    const difference = target - now;

    if (difference > 0) {
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
    } else {
      setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    }
  };

  const handleButtonClick = () => {
    switch (statusConfig.action) {
      case 'connect':
        setIsWalletModalOpen(true);
        break;
      case 'finalize':
        handleFinalize();
        break;
      case 'contribute':
        handleContribute();
        break;
      case 'claim':
        handleClaim();
        break;
      default:
        break;
    }
  };

  const handleContribute = () => {
    // TODO: Implement contribute logic
  };

  const handleFinalize = () => {
    // TODO: Implement finalize logic
  };

  const handleClaim = () => {
    // TODO: Implement claim logic
  };

  const handleWalletModalClose = () => {
    setIsWalletModalOpen(false);
  };

  useEffect(() => {
    if (launchpad.status === PresaleStatus.CANCELLED) {
      setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);

    return () => clearInterval(interval);
  }, [launchpad.status, launchpad.startTime, launchpad.endTime]);

  useEffect(() => {
    if (isConnected) setIsWalletModalOpen(false);
  }, [isConnected]);

  const statusConfig = getStatusDisplay();

  // Loading & error UI
  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <span className="text-white">Loading user info...</span>
      </div>
    );
  }

  if (userError) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <span className="text-red-500">Failed to load user info.</span>
      </div>
    );
  }

  return (
    <>
      <div className='h-fit bg-[linear-gradient(45deg,_var(--blue-primary),_var(--primary))] border-none rounded-xl cursor-pointer  hover:shadow-[0_0px_10px_0_var(--blue-primary)] p-[1px]'>
        <Card className='bg-[var(--gray-night)] border-none rounded-xl h-fit'>
          <CardContent className='p-6'>
            <h2 className='text-xl font-semibold text-white text-center mb-6'>
              {statusConfig.title}
            </h2>

            {/* Countdown */}
            {statusConfig.countdown && (
              <div className='flex justify-center gap-2 mb-6'>
                <div className='bg-[#2a3441] px-3 py-2 rounded text-white font-mono text-sm min-w-[50px] text-center'>
                  {countdown.days.toString().padStart(2, '0')}
                </div>
                <div className='bg-[#2a3441] px-3 py-2 rounded text-white font-mono text-sm min-w-[50px] text-center'>
                  {countdown.hours.toString().padStart(2, '0')}
                </div>
                <div className='bg-[#2a3441] px-3 py-2 rounded text-white font-mono text-sm min-w-[50px] text-center'>
                  {countdown.minutes.toString().padStart(2, '0')}
                </div>
                <div className='bg-[#2a3441] px-3 py-2 rounded text-white font-mono text-sm min-w-[50px] text-center'>
                  {countdown.seconds.toString().padStart(2, '0')}
                </div>
              </div>
            )}

            {/* Chain Progress Bars */}
            <div className='space-y-4 mb-6'>
              {launchpad.supportedChains.map((chain) => (
                <div key={chain.id} className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <Image
                        src={chain.oftToken.logoUrl}
                        alt={chain.oftToken.name}
                        className='w-6 h-6 rounded-full'
                      />
                      <span className='text-blue-400 font-medium'>
                        {chain.totalRaised} {chain.oftToken.symbol}
                      </span>
                    </div>
                    <span className='text-blue-400 font-medium'>
                      {chain.hardCap} {chain.oftToken.symbol}
                    </span>
                  </div>
                  <Progress
                    value={
                      Number(chain.hardCap) > 0
                        ? (Number(chain.totalRaised) / Number(chain.hardCap)) * 100
                        : 0
                    }
                    className='h-2 bg-[#2a3441]'
                  />

                  {/* Amount Input (only for live status and connected non-creator, not contributed) */}
                  {statusConfig.showInputs && (
                    <div className='mt-3'>
                      <div className='text-white text-sm mb-2'>Amount</div>
                      <div className='relative'>
                        <Input
                          type='number'
                          placeholder='0'
                          value={amounts[chain.id] || ''}
                          onChange={(e) => handleAmountChange(chain.id, e.target.value)}
                          className='bg-[#2a3441] border-[#3a4451] text-white pr-16'
                        />
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          onClick={() => handleMaxClick(chain.id, '3')}
                          className='absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white h-6 px-2'
                        >
                          MAX
                        </Button>
                      </div>
                      <div className='flex justify-between text-xs text-gray-400 mt-1'>
                        <span>Min Buy: {chain.minContribution} {chain.oftToken.symbol}</span>
                        <span>Max Buy: {chain.maxContribution} {chain.oftToken.symbol}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Action Button */}
            {statusConfig.buttonText && (
              <Button
                disabled={!statusConfig.buttonEnabled}
                onClick={handleButtonClick}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  statusConfig.buttonEnabled
                    ? `flex-1 bg-[linear-gradient(45deg,_var(--blue-primary),_var(--primary))]
              shadow-[0_0px_10px_0_var(--blue-primary)]
              border-none
              rounded-lg
              cursor-pointer
              hover:opacity-90
              hover:shadow-[0_0px_16px_0_var(--blue-primary)] text-foreground`
                    : '!bg-[var(--gray-light)] !opacity-100 !text-[var(--gray-neutral)] !cursor-not-allowed'
                }`}
              >
                {statusConfig.buttonText}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Wallet Connect Modal */}
      <WalletConnectModal
        open={isWalletModalOpen}
        onClose={handleWalletModalClose}
      />
    </>
  );
}