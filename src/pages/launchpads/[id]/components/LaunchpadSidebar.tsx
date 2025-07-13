/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import type {
  ContributorRow,
  PresaleDetailResponse,
} from '@/utils/interfaces/launchpad';
import { useAccount } from 'wagmi';
import { WalletConnectModal } from '@/pages/common/ConnectWalletModal';
import { PresaleStatus } from '@/utils/enums/presale';
import { preSaleAuthApi } from '@/services/pre-sale/pre-sale-auth';
import { preSaleApi } from '@/services/pre-sale/presales';
import {
  useContribute,
  useMultipleCampaignTargetAmount,
  useMultipleCampaignTotalRaised,
} from '@/hooks/usePreSaleContract';
import { toast } from 'sonner';
import { formatUnits } from 'viem';
import { ChainProgressBar } from './LaunchpadProgressBar';
import type { LaunchpadSupportedChain } from '@/utils/interfaces/chain';
import { getErrorMessage } from '@/utils/errors';

interface LaunchpadSideBarProps {
  launchpad: PresaleDetailResponse;
  contributorState: ContributorRow[];
  supportedChains: LaunchpadSupportedChain[];
  refetchContributors: () => void;
}

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function LaunchpadSideBar({
  launchpad,
  contributorState,
  supportedChains,
  refetchContributors,
}: LaunchpadSideBarProps) {
  const [amounts, setAmounts] = useState<{ [key: string]: string }>({});
  const [countdown, setCountdown] = useState<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [contributingChains, setContributingChains] = useState<Set<string>>(
    new Set()
  );
  const [currentTime, setCurrentTime] = useState(new Date().getTime());

  const { useGetMeQuery } = preSaleAuthApi;
  const { useFinalizePreSalesMutation, useCancelPreSalesMutation } = preSaleApi;
  const {
    data: userData,
    isLoading: userLoading,
    isError: userError,
  } = useGetMeQuery({});
  const { isConnected, address } = useAccount();

  const [finalizePreSales, { isLoading: isFinalizing }] =
    useFinalizePreSalesMutation();
  const [cancelPreSales, { isLoading: isCancelling }] =
    useCancelPreSalesMutation();

  const contracts = useMemo(
    () =>
      launchpad.presaleChains.map((chain) => ({
        contractAddress: chain.contractAddress as `0x${string}`,
        abi: chain.contractAbi, 
        chainId: Number(chain.chainId),
      })),
    [launchpad.presaleChains]
  );

  const {
    data: targetAmounts,
    loading: targetLoading,
    error: targetError,
    refetch: refetchTargetAmounts,
  } = useMultipleCampaignTargetAmount(contracts);
  const {
    data: totalRaisedAmounts,
    loading: raisedLoading,
    error: raisedError,
    refetch: refetchTotalRaised,
  } = useMultipleCampaignTotalRaised(contracts);

  const isCreator =
    userData?.data?.id &&
    launchpad.userId &&
    userData?.data?.id === launchpad.userId;

  // Real-time calculation with currentTime dependency
  const hasStarted = useMemo(() => {
    if (!launchpad.startTime) return false;
    const startTime = new Date(launchpad.startTime).getTime();
    return currentTime >= startTime;
  }, [launchpad.startTime, currentTime]);

  const hasEnded = useMemo(() => {
    if (!launchpad.endTime) return false;
    const endTime = new Date(launchpad.endTime).getTime();
    return currentTime >= endTime;
  }, [launchpad.endTime, currentTime]);

  // Check which chains user has contributed to
  const contributedChains = useMemo(() => {
    if (!address) return new Set<string>();

    const userContribution = contributorState.find(
      (row) => row.address?.toLowerCase() === address.toLowerCase()
    );

    if (!userContribution) return new Set<string>();

    const contributed = new Set<string>();
    launchpad.presaleChains.forEach((chain) => {
      const chainContribution = userContribution[chain.chainId];
      if (chainContribution && Number(chainContribution) > 0) {
        contributed.add(chain.id);
      }
    });

    return contributed;
  }, [contributorState, address, launchpad.presaleChains]);

  const handleAmountChange = (chainId: string, value: string) => {
    setAmounts((prev) => ({
      ...prev,
      [chainId]: value,
    }));
  };

  const handleMaxClick = (chainId: string, maxAmount: string) => {
    setAmounts((prev) => ({
      ...prev,
      [chainId]: maxAmount,
    }));
  };

  const getStatusDisplay = () => {
    // Check if presale has ended based on time
    if (launchpad.status === PresaleStatus.ACTIVE && hasEnded) {
      return {
        title: 'Presale Ended',
        countdown: false,
        showInputs: false,
        showChainButtons: false,
        showMainButton: isCreator,
        buttonText: isCreator ? 'Finalize' : null,
        buttonEnabled: isCreator ? !isFinalizing && !isCancelling : false,
        action: isCreator ? 'finalize' : null,
      };
    }

    switch (launchpad.status) {
      case PresaleStatus.ACTIVE:
        if (!isConnected) {
          return {
            title: hasStarted ? 'Presale Ends In' : 'Presale Starts In',
            countdown: true,
            showInputs: hasStarted,
            showChainButtons: hasStarted,
            showMainButton: true,
            buttonText: hasStarted ? 'Connect Wallet' : 'Coming Soon',
            buttonEnabled: hasStarted,
            action: hasStarted ? 'connect' : null,
          };
        } else if (isCreator) {
          return {
            title: hasStarted ? 'Presale Ends In' : 'Presale Starts In',
            countdown: true,
            showInputs: false,
            showChainButtons: false,
            showMainButton: true,
            buttonText: hasStarted ? 'Cancel' : 'Coming Soon',
            buttonEnabled: hasStarted && !isCancelling && !isFinalizing,
            action: hasStarted ? 'cancel' : null,
          };
        } else {
          return {
            title: hasStarted ? 'Presale Ends In' : 'Presale Starts In',
            countdown: true,
            showInputs: hasStarted,
            showChainButtons: hasStarted,
            showMainButton: !hasStarted,
            buttonText: hasStarted ? null : 'Coming Soon',
            buttonEnabled: false,
            action: null,
          };
        }
      case PresaleStatus.CANCELLED:
        return {
          title: 'Presale Cancelled',
          countdown: false,
          showInputs: false,
          showChainButtons: false,
          showMainButton: false,
          buttonText: null,
          buttonEnabled: false,
          action: null,
        };
      case PresaleStatus.FINALIZED:
        return {
          title: 'Presale Finalized',
          countdown: false,
          showInputs: false,
          showChainButtons: false,
          showMainButton: false,
          buttonText: null,
          buttonEnabled: false,
          action: null,
        };
      case PresaleStatus.PENDING:
        return {
          title: 'Presale Starts In',
          countdown: true,
          showInputs: false,
          showChainButtons: false,
          showMainButton: true,
          buttonText: 'Coming Soon',
          buttonEnabled: false,
          action: null,
        };
      default:
        return {
          title: 'Presale',
          countdown: false,
          showInputs: false,
          showChainButtons: false,
          showMainButton: true,
          buttonText: 'Connect Wallet',
          buttonEnabled: true,
          action: 'connect',
        };
    }
  };

  const getTargetDate = () => {
    if (launchpad.status === PresaleStatus.PENDING) {
      return launchpad.startTime;
    } else if (launchpad.status === PresaleStatus.ACTIVE) {
      return hasStarted ? launchpad.endTime : launchpad.startTime;
    }
    return null;
  };

  const calculateCountdown = () => {
    const now = new Date().getTime();
    setCurrentTime(now); // Update current time every second

    const targetDate = getTargetDate();
    if (!targetDate) return;

    const target = new Date(targetDate).getTime();
    const difference = target - now;

    if (difference > 0) {
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
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
      case 'cancel':
        handleCancel();
        break;
      case 'claim':
        handleClaim();
        break;
      default:
        break;
    }
  };

  const contribute = useContribute();

  const handleChainContribute = async (chain: any) => {
    const chainId = chain.id;
    const amount = amounts[chainId];

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter amount to contribute');
      return;
    }

    // Validate amount against min/max
    const amountNum = parseFloat(amount);
    const minContrib = Number(chain.minContribution);
    const maxContrib = Number(chain.maxContribution);

    if (amountNum < minContrib) {
      toast.error(
        `Amount must be at least ${minContrib} ${chain.paymentTokenSymbol}`
      );
      return;
    }

    if (amountNum > maxContrib) {
      toast.error(
        `Amount cannot exceed ${maxContrib} ${chain.paymentTokenSymbol}`
      );
      return;
    }

    try {
      setContributingChains((prev) => new Set(prev).add(chainId));

      // Convert amount to BigInt (assuming 18 decimals for now)
      const amountBigInt = BigInt(Math.floor(parseFloat(amount) * 10 ** 18));
      const chainData = launchpad.presaleChains.find(
        (c) => c.chainId === chain.chainId
      );
      
      if (!chainData?.contractAbi) {
        throw new Error('Contract ABI not found for this chain');
      }
      await contribute(
        chain.contractAddress as `0x${string}`,
        chainData.contractAbi,
        amountBigInt,
        Number(chain.chainId),
      );

      toast.success(
        `Successfully contributed ${amount} ${chain.paymentTokenSymbol}`
      );

      // Reset amount for this chain
      setAmounts((prev) => ({
        ...prev,
        [chainId]: '',
      }));

      // Reload data after successful contribution
      await Promise.all([
        refetchTargetAmounts(),
        refetchTotalRaised(),
        refetchContributors(),
      ]);
    } catch (error: any) {
      console.error('Contribution error:', error);
      toast.error(error.message || 'Failed to contribute');
    } finally {
      setContributingChains((prev) => {
        const newSet = new Set(prev);
        newSet.delete(chainId);
        return newSet;
      });
    }
  };

  const handleFinalize = async () => {
    try {
      const result = await finalizePreSales({
        presaleId: launchpad.id,
      }).unwrap();
      console.log(result, 'Presale finalized successfully');
      toast.success('Presale finalized successfully!');
    } catch (error: any) {
      console.error('Finalize error:', error);
      const errorMessage = getErrorMessage(error, 'Failed to finalize presale');
      toast.error(errorMessage);
    }
  };

  const handleCancel = async () => {
    try {
      const result = await cancelPreSales({
        presaleId: launchpad.id,
        reason: 'Insufficient interest',
      }).unwrap();
      console.log(result, 'Presale cancelled successfully');
      toast.success('Presale cancelled successfully!');
    } catch (error: any) {
      console.error('Cancel error:', error);
      const errorMessage = getErrorMessage(error, 'Failed to cancel presale');
      toast.error(errorMessage);
    }
  };

  const handleClaim = () => {
    toast.info('Claim functionality coming soon!');
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
      <div className='flex items-start justify-start min-h-[200px]'>
        <span className='text-white'>Loading user info...</span>
      </div>
    );
  }

  if (userError) {
    return (
      <div className='flex items-start justify-start min-h-[200px]'>
        <span className='text-red-500'>Failed to load user info.</span>
      </div>
    );
  }

  // Error loading contract data
  if (targetError || raisedError) {
    return (
      <div className='flex items-start justify-start min-h-[200px]'>
        <span className='text-red-500'>
          Failed to load campaign data from blockchain.
        </span>
      </div>
    );
  }

  // Loading contract data
  if (targetLoading || raisedLoading) {
    return (
      <div className='flex items-start justify-start min-h-[200px]'>
        <div className='flex items-center gap-2'>
          <RefreshCw className='w-4 h-4 animate-spin text-white' />
          <span className='text-white'>Loading campaign data...</span>
        </div>
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
              {launchpad.presaleChains.map((chain, index) => {
                const totalRaised = totalRaisedAmounts[index]
                  ? Number(formatUnits(totalRaisedAmounts[index]!, 18))
                  : 0;
                const targetAmount = targetAmounts[index]
                  ? Number(formatUnits(targetAmounts[index]!, 18))
                  : 0;

                const isContributing = contributingChains.has(chain.id);
                const hasContributed = contributedChains.has(chain.id);

                return (
                  <div key={chain.id}>
                    <ChainProgressBar
                      supportedChains={supportedChains}
                      chain={chain}
                      totalRaised={totalRaised}
                      targetAmount={targetAmount}
                      amounts={amounts}
                      isContributing={isContributing}
                      showInputs={statusConfig.showInputs}
                      onAmountChange={handleAmountChange}
                      onMaxClick={handleMaxClick}
                    />

                    {/* Individual Chain Contribute Button */}
                    {statusConfig.showChainButtons && (
                      <div className='mt-2'>
                        <Button
                          disabled={
                            hasContributed ||
                            isContributing ||
                            !amounts[chain.id] ||
                            parseFloat(amounts[chain.id]) <= 0
                          }
                          onClick={() => handleChainContribute(chain)}
                          className={`w-full py-2 rounded-lg font-semibold transition-all text-sm ${
                            !hasContributed &&
                            !isContributing &&
                            amounts[chain.id] &&
                            parseFloat(amounts[chain.id]) > 0
                              ? `bg-[linear-gradient(45deg,_var(--blue-primary),_var(--primary))]
                        shadow-[0_0px_5px_0_var(--blue-primary)]
                        border-none
                        rounded-lg
                        cursor-pointer
                        hover:opacity-90
                        hover:shadow-[0_0px_8px_0_var(--blue-primary)] text-foreground`
                              : '!bg-[var(--gray-light)] !opacity-100 !text-[var(--gray-neutral)] !cursor-not-allowed'
                          }`}
                        >
                          {hasContributed ? (
                            'Already Contributed'
                          ) : isContributing ? (
                            <div className='flex items-center gap-2'>
                              <RefreshCw className='w-3 h-3 animate-spin' />
                              Contributing...
                            </div>
                          ) : (
                            `Contribute`
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Main Action Button */}
            {statusConfig.showMainButton && statusConfig.buttonText && (
              <Button
                disabled={
                  !statusConfig.buttonEnabled || isFinalizing || isCancelling
                }
                onClick={handleButtonClick}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  statusConfig.buttonEnabled && !isFinalizing && !isCancelling
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
                {isFinalizing ? (
                  <div className='flex items-center gap-2'>
                    <RefreshCw className='w-4 h-4 animate-spin' />
                    Finalizing...
                  </div>
                ) : isCancelling ? (
                  <div className='flex items-center gap-2'>
                    <RefreshCw className='w-4 h-4 animate-spin' />
                    Cancelling...
                  </div>
                ) : (
                  statusConfig.buttonText
                )}
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