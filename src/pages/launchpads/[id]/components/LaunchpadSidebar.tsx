import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import Image from '@/components/ui/image';
import type { LaunchpadDetailData } from '..';
import { useAccount } from 'wagmi';
import { WalletConnectModal } from '@/pages/common/ConnectWalletModal';

interface LaunchpadSideBarProps {
  launchpad: LaunchpadDetailData;
}

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function LaunchpadSideBar({ launchpad }: LaunchpadSideBarProps) {
  const [amounts, setAmounts] = useState<{ [key: string]: string }>({});
  const [countdown, setCountdown] = useState<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const { isConnected, address } = useAccount();

  // Mock creator address - thay thế bằng thực tế từ API
  const creatorAddress = '0x7b6...Fe5';
  const isCreator = address === creatorAddress;

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

  const getStatusDisplay = () => {
    switch (launchpad.status) {
      case 'live':
        if (!isConnected) {
          return {
            title: 'Presale Ends In',
            countdown: true,
            showInputs: true,
            buttonText: 'Connect Wallet',
            buttonEnabled: true
          };
        } else if (isCreator) {
          return {
            title: 'Presale Ends In',
            countdown: true,
            showInputs: false,
            buttonText: 'Finalize',
            buttonEnabled: true
          };
        } else {
          return {
            title: 'Presale Ends In',
            countdown: true,
            showInputs: true,
            buttonText: 'Claim',
            buttonEnabled: false
          };
        }
      case 'cancelled':
        return {
          title: 'Presale Cancelled',
          countdown: true,
          showInputs: false,
          buttonText: null,
          buttonEnabled: false
        };
      case 'ended':
        return {
          title: 'Presale Ended',
          countdown: false,
          showInputs: false,
          buttonText: 'Claim',
          buttonEnabled: true
        };
      case 'upcoming':
        return {
          title: 'Presale Starts In',
          countdown: true,
          showInputs: false,
          buttonText: 'Coming Soon',
          buttonEnabled: false
        };
      default:
        return {
          title: 'Presale',
          countdown: false,
          showInputs: false,
          buttonText: 'Connect Wallet',
          buttonEnabled: true
        };
    }
  };

  const getTargetDate = () => {
    if (launchpad.status === 'upcoming') {
      return launchpad.timeline.find(t => t.phase === 'Start time')?.date;
    } else if (launchpad.status === 'live') {
      return launchpad.timeline.find(t => t.phase === 'End time')?.date;
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
    switch (launchpad.status) {
      case 'live':
        if (!isConnected) {
          // Mở modal connect wallet
          setIsWalletModalOpen(true);
        } else if (isCreator) {
          // Finalize presale
          handleFinalize();
        } else {
          // Claim tokens (disabled in live status)
        }
        break;
      
      case 'ended':
        if (!isConnected) {
          // Cần connect trước khi claim
          setIsWalletModalOpen(true);
        } else {
          // Claim tokens
          handleClaim();
        }
        break;
      
      case 'upcoming':
        // Coming soon - no action
        break;
      
      case 'cancelled':
        // No action for cancelled presale
        break;
      
      default:
        if (!isConnected) {
          setIsWalletModalOpen(true);
        }
        break;
    }
  };

  const handleFinalize = () => {
    // Logic để finalize presale
    // TODO: Implement finalize logic
    // - Call smart contract finalize function
    // - Show success/error message
    // - Update presale status
  };

  const handleClaim = () => {
    // Logic để claim tokens
    // TODO: Implement claim logic
    // - Check if user has allocation
    // - Call smart contract claim function
    // - Show success/error message
    // - Update user balance
  };

  const handleWalletModalClose = () => {
    setIsWalletModalOpen(false);
  };

  useEffect(() => {
    if (launchpad.status === 'cancelled') {
      setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);

    return () => clearInterval(interval);
  }, [launchpad.status, launchpad.timeline]);

  useEffect(()=> {
    if(isConnected) setIsWalletModalOpen(false)
  }, [isConnected])

  const statusConfig = getStatusDisplay();

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
              {launchpad.chains.map((chain) => (
                <div key={chain.id} className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <Image
                        src={chain.logo}
                        alt={chain.name}
                        className='w-6 h-6 rounded-full'
                      />
                      <span className='text-blue-400 font-medium'>
                        {chain.raised} {chain.token}
                      </span>
                    </div>
                    <span className='text-blue-400 font-medium'>
                      {chain.target} {chain.token}
                    </span>
                  </div>
                  <Progress 
                    value={chain.progress} 
                    className='h-2 bg-[#2a3441]'
                  />

                  {/* Amount Input (only for live status and connected non-creator) */}
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
                        <span>Min Buy: 1 {chain.token}</span>
                        <span>Max Buy: 3 {chain.token}</span>
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