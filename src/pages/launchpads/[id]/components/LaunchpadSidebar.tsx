/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import type {
  ContributorRow,
  PresaleDetailResponse,
} from '@/utils/interfaces/launchpad';
import { useAccount, useSwitchChain } from 'wagmi';
import { WalletConnectModal } from '@/pages/common/ConnectWalletModal';
import { PresaleStatus } from '@/utils/enums/presale';
import { preSaleAuthApi } from '@/services/pre-sale/pre-sale-auth';
import { preSaleApi } from '@/services/pre-sale/presales';
import {
  useContribute,
  useMultipleCampaignTargetAmount,
  useMultipleCampaignTotalRaised,
  useClaimTokens,
  useMultipleUserHasClaimed,
} from '@/hooks/usePreSaleContract';
import { toast } from 'sonner';
import { formatUnits } from 'viem';
import { ChainProgressBar } from './LaunchpadProgressBar';
import type { LaunchpadSupportedChain } from '@/utils/interfaces/chain';
import { getErrorMessage } from '@/utils/errors';
import { useAuthToken } from '@/hooks/useAuthToken';

interface LaunchpadSideBarProps {
  launchpad: PresaleDetailResponse;
  contributorState: ContributorRow[];
  supportedChains: LaunchpadSupportedChain[];
  refetchContributors: () => Promise<any>;
  refetchLaunchpadDetail: () => Promise<any>;
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
  refetchLaunchpadDetail
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
  const [claimingChains, setClaimingChains] = useState<Set<string>>(
    new Set()
  );
  const [currentTime, setCurrentTime] = useState(new Date().getTime());
  const [countdownCompleted, setCountdownCompleted] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasRefetchedRef = useRef(false);
  const { switchChainAsync } = useSwitchChain();

  const { useGetMeQuery } = preSaleAuthApi;
  const { useFinalizePreSalesMutation, useCancelPreSalesMutation } = preSaleApi;
  const {
    data: userData,
    refetch: refetchGetMe,
  } = useGetMeQuery({});
  const { isConnected, address } = useAccount();

  const [finalizePreSales, { isLoading: isFinalizing }] =
    useFinalizePreSalesMutation();
  const [cancelPreSales, { isLoading: isCancelling }] =
    useCancelPreSalesMutation();
  const { token } = useAuthToken();

   useEffect(() => {
      if (token) {
        const timer = setTimeout(() => {
          refetchGetMe();
        }, 100);
  
        return () => clearTimeout(timer);
      }
    }, [token]);

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
    refetch: refetchTargetAmounts,
  } = useMultipleCampaignTargetAmount(contracts);
  const {
    data: totalRaisedAmounts,
    refetch: refetchTotalRaised,
  } = useMultipleCampaignTotalRaised(contracts);

  // Check claimed status for all chains
  const {
    data: userClaimedStatus,
    refetch: refetchClaimedStatus,
  } = useMultipleUserHasClaimed(contracts, address);

  const contribute = useContribute();
  const { claimTokensAsync, isPending: isClaimingGlobal } = useClaimTokens();

  const isCreator =
    userData?.data?.id &&
    launchpad.userId &&
    userData?.data?.id === launchpad.userId;
  
  // Check if all chains have reached their target
  const allChainsReachedTarget = useMemo(() => {
    if (!targetAmounts || !targetAmounts?.length || !totalRaisedAmounts || !totalRaisedAmounts?.length) return false;
    return targetAmounts.every((target, index) => {
      if (!target || !totalRaisedAmounts[index]) return false;
      return totalRaisedAmounts[index]! >= target;
    });
  }, [targetAmounts, totalRaisedAmounts]);


  // Check if a specific chain has reached its target
  const isChainTargetReached = (chainIndex: number) => {
    if (!targetAmounts || !totalRaisedAmounts) return false;
    const target = targetAmounts[chainIndex];
    const raised = totalRaisedAmounts[chainIndex];
    if (!target || !raised) return false;
    return raised >= target;
  };

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

  // Check if user can claim from a chain
  const canClaimFromChain = (chainId: string, chainIndex: number) => {
    const hasContributed = contributedChains.has(chainId);
    const canClaim = hasEnded || launchpad.status === PresaleStatus.FINALIZED || allChainsReachedTarget;
    const hasNotClaimed = userClaimedStatus && !userClaimedStatus[chainIndex];
    
    return hasContributed && canClaim && isConnected && hasNotClaimed;
  };

  // Check if user has already claimed from a chain
  const hasUserClaimed = (chainId: string, chainIndex: number) => {
    const hasContributed = contributedChains.has(chainId);
    const hasClaimed = userClaimedStatus && userClaimedStatus[chainIndex];
    
    return hasContributed && hasClaimed;
  };

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

  // Handle claim tokens for a specific chain
  const handleClaimTokens = async (chain: any, chainIndex: number) => {
    const chainId = chain.id;

    if (!canClaimFromChain(chainId, chainIndex)) {
      toast.error('You cannot claim from this chain');
      return;
    }

    try {
      setClaimingChains((prev) => new Set(prev).add(chainId));

      const chainData = launchpad.presaleChains.find(
        (c) => c.chainId === chain.chainId
      );
      
      if (!chainData?.contractAbi) {
        throw new Error('Contract ABI not found for this chain');
      }
      await switchChainAsync({
        chainId: Number(chain.chainId),
      })

      await claimTokensAsync(
        chain.contractAddress as `0x${string}`,
        chainData.contractAbi,
        Number(chain.chainId)
      );

      toast.success(
        `Successfully claimed tokens`
      );

      // Reload data after successful claim
      await Promise.all([
        refetchTargetAmounts(),
        refetchTotalRaised(),
        refetchContributors(),
        refetchClaimedStatus(),
      ]);
    } catch (error: any) {
      console.error('Claim tokens error:', error);
      const errorMessage = getErrorMessage(error, 'Failed to claim tokens');
      toast.error(`Failed to claim from ${chain.chainName}: ${errorMessage}`);
    } finally {
      setClaimingChains((prev) => {
        const newSet = new Set(prev);
        newSet.delete(chainId);
        return newSet;
      });
    }
  };

  const getStatusDisplay = () => {
    // Check if all chains reached target - treat as finalized
    if (allChainsReachedTarget && (launchpad.status === PresaleStatus.ACTIVE) ) {
      return {
        title: 'Presale Finalized',
        countdown: false,
        showInputs: false,
        showChainButtons: false,
        showClaimButtons: true,
        showMainButton: isCreator,
        buttonText: isCreator ? 'Finalize' : null,
        buttonEnabled: isCreator ? !isFinalizing && !isCancelling : false,
        action: isCreator ? 'finalize' : null,
      };
    }

    // Check if presale has ended based on time
    if (launchpad.status === PresaleStatus.ACTIVE && hasEnded) {
      return {
        title: 'Presale Ended',
        countdown: false,
        showInputs: false,
        showChainButtons: false,
        showClaimButtons: true,
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
            showClaimButtons: false,
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
            showClaimButtons: false,
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
            showClaimButtons: false,
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
          showClaimButtons: false,
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
          showClaimButtons: true,
          showMainButton: false,
          buttonText: null,
          buttonEnabled: false,
          action: null,
        };
      case PresaleStatus.PENDING:
        // Check if start time hasn't arrived yet
        if (!hasStarted) {
          return {
            title: 'Presale Starts In',
            countdown: true,
            showInputs: false,
            showChainButtons: false,
            showClaimButtons: false,
            showMainButton: true,
            buttonText: 'Coming Soon',
            buttonEnabled: false,
            action: null,
          };
        } else {
          // Start time has arrived but status is still PENDING
          return {
            title: 'Presale Starting...',
            countdown: false,
            showInputs: false,
            showChainButtons: false,
            showClaimButtons: false,
            showMainButton: true,
            buttonText: 'Coming Soon',
            buttonEnabled: false,
            action: null,
          };
        }
      default:
        return {
          title: 'Presale',
          countdown: false,
          showInputs: false,
          showChainButtons: false,
          showClaimButtons: false,
          showMainButton: true,
          buttonText: 'Connect Wallet',
          buttonEnabled: true,
          action: 'connect',
        };
    }
  };

  const getTargetDate = () => {
    if (launchpad.status === PresaleStatus.PENDING || !hasStarted) {
      return launchpad.startTime;
    } else if (launchpad.status === PresaleStatus.ACTIVE && hasStarted) {
      return launchpad.endTime;
    }
    return null;
  };

  const clearCountdownInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const calculateCountdown = () => {
    const now = new Date().getTime();
    setCurrentTime(now);

    const targetDate = getTargetDate();
    if (!targetDate) {
      clearCountdownInterval();
      return;
    }
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
      hasRefetchedRef.current = false;
    } else {
      setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      setCountdownCompleted(true);
      if (!hasRefetchedRef.current && refetchLaunchpadDetail) {
        refetchLaunchpadDetail()
          .then(() => {
            hasRefetchedRef.current = true;
          })
          .catch(() => {
            hasRefetchedRef.current = false; 
          });
      }
      
      clearCountdownInterval();
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
      default:
        break;
    }
  };

  const handleChainContribute = async (chain: any) => {
    const chainId = chain.id;
    const amount = amounts[chainId];

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter amount to contribute');
      return;
    }

    const amountNum = parseFloat(amount);
    const minContrib = Number(chain.minContribution);
    const maxContrib = Number(chain.maxContribution);

    if (amountNum < minContrib) {
      toast.error(
        `Amount must be at least ${minContrib}`
      );
      return;
    }

    if (amountNum > maxContrib) {
      toast.error(
        `Amount cannot exceed ${maxContrib}`
      );
      return;
    }

    try {
      setContributingChains((prev) => new Set(prev).add(chainId));

      const amountBigInt = BigInt(Math.floor(parseFloat(amount) * 10 ** 18));
      const chainData = launchpad.presaleChains.find(
        (c) => c.chainId === chain.chainId
      );
      
      if (!chainData?.contractAbi) {
        throw new Error('Contract ABI not found for this chain');
      }

      await switchChainAsync({
        chainId: Number(chain.chainId),
      })

      await contribute(
        chain.contractAddress as `0x${string}`,
        chainData.contractAbi,
        amountBigInt,
        Number(chain.chainId),
        amountBigInt,
      );

      toast.success(
        `Successfully contributed ${amount}`
      );

      setAmounts((prev) => ({
        ...prev,
        [chainId]: '',
      }));

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
      await finalizePreSales({
        presaleId: launchpad.id,
      }).unwrap();
      toast.success('Presale finalized successfully!');
      refetchLaunchpadDetail();
    } catch (error: any) {
      console.error('Finalize error:', error);
      const errorMessage = getErrorMessage(error, 'Failed to finalize presale');
      toast.error(errorMessage);
    }
  };

  const handleCancel = async () => {
    try {
      await cancelPreSales({
        presaleId: launchpad.id,
        reason: 'Insufficient interest',
      }).unwrap();
      
      toast.success('Presale cancelled successfully!');
      refetchLaunchpadDetail();
    } catch (error: any) {
      console.error('Cancel error:', error);
      const errorMessage = getErrorMessage(error, 'Failed to cancel presale');
      toast.error(errorMessage);
    }
  };

  const handleWalletModalClose = () => {
    setIsWalletModalOpen(false);
  };

  // Main countdown effect - updated to handle PENDING status countdown
   useEffect(() => {
    clearCountdownInterval();
    
    setCountdownCompleted(false);
    hasRefetchedRef.current = false;
    if (launchpad.status === PresaleStatus.CANCELLED || 
        launchpad.status === PresaleStatus.FINALIZED ||
        allChainsReachedTarget) {
      setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    const targetDate = getTargetDate();
    if (!targetDate) return;

    const now = new Date().getTime();
    const target = new Date(targetDate).getTime();

    if (target <= now) {
      setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      setCountdownCompleted(true);
      // Handle Promise with then/catch to check initialization
      if (!hasRefetchedRef.current && refetchLaunchpadDetail) {
        refetchLaunchpadDetail()
          .then(() => {
            hasRefetchedRef.current = true;
          })
          .catch(() => {
            hasRefetchedRef.current = false;
          });
      }
      return;
    }

    calculateCountdown();
    intervalRef.current = setInterval(calculateCountdown, 1000);

    return () => clearCountdownInterval();
  }, [launchpad.status, launchpad.startTime, launchpad.endTime, hasStarted, hasEnded, allChainsReachedTarget, refetchLaunchpadDetail]);

  useEffect(() => {
    if (isConnected) setIsWalletModalOpen(false);
  }, [isConnected]);

  useEffect(() => {
    return () => clearCountdownInterval();
  }, []);

  const statusConfig = getStatusDisplay();

  return (
    <>
      <div className='h-fit bg-[linear-gradient(45deg,_var(--blue-primary),_var(--primary))] border-none rounded-xl  hover:shadow-[0_0px_10px_0_var(--blue-primary)] p-[1px]'>
        <Card className='bg-[var(--gray-night)] border-none rounded-xl h-fit'>
          <CardContent className='p-6'>
            <h2 className='text-xl font-semibold text-white text-center mb-6'>
              {statusConfig.title}
            </h2>

            {/* Countdown */}
            {statusConfig.countdown && !countdownCompleted && !allChainsReachedTarget && (
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
                const isClaiming = claimingChains.has(chain.id);
                const canClaim = canClaimFromChain(chain.id, index);
                const hasClaimed = hasUserClaimed(chain.id, index);
                const chainTargetReached = isChainTargetReached(index);

                return (
                  <div key={chain.id}>
                    <ChainProgressBar
                      supportedChains={supportedChains}
                      chain={chain}
                      totalRaised={totalRaised}
                      targetAmount={targetAmount}
                      amounts={amounts}
                      isContributing={isContributing}
                      showInputs={statusConfig.showInputs && !chainTargetReached}
                      onAmountChange={handleAmountChange}
                      onMaxClick={handleMaxClick}
                    />


                    {/* Individual Chain Contribute Button */}
                    {statusConfig.showChainButtons && !chainTargetReached && (
                      <div className='mt-2'>
                        <Button
                          disabled={
                            hasContributed ||
                            isContributing ||
                            !amounts[chain.id] ||
                            parseFloat(amounts[chain.id]) <= 0 ||
                            chainTargetReached
                          }
                          onClick={() => handleChainContribute(chain)}
                          className={`w-full py-2 rounded-lg font-semibold transition-all text-sm ${
                            !hasContributed &&
                            !isContributing &&
                            amounts[chain.id] &&
                            parseFloat(amounts[chain.id]) > 0 &&
                            !chainTargetReached
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

                    {/* Individual Chain Claim Button */}
                    {statusConfig.showClaimButtons && hasContributed && (
                      <div className='mt-2'>
                        {hasClaimed ? (
                          <Button
                            disabled={true}
                            className='w-full py-2 rounded-lg font-semibold transition-all text-sm !bg-[var(--gray-light)] !opacity-100 !text-[var(--gray-neutral)] !cursor-not-allowed'
                          >
                           Already Claimed
                          </Button>
                        ) : canClaim ? (
                          <Button
                            disabled={isClaiming || isClaimingGlobal}
                            onClick={() => handleClaimTokens(chain, index)}
                            className={`w-full py-2 rounded-lg font-semibold transition-all text-sm ${
                              !isClaiming && !isClaimingGlobal
                                ? `bg-[linear-gradient(45deg,_var(--green-primary),_var(--green-secondary))]
                          shadow-[0_0px_5px_0_var(--green-primary)]
                          border-none
                          rounded-lg
                          cursor-pointer
                          hover:opacity-90
                          hover:shadow-[0_0px_8px_0_var(--green-primary)] text-white`
                                : '!bg-[var(--gray-light)] !opacity-100 !text-[var(--gray-neutral)] !cursor-not-allowed'
                            }`}
                          >
                            {isClaiming ? (
                              <div className='flex items-center gap-2'>
                                <RefreshCw className='w-3 h-3 animate-spin' />
                                Claiming...
                              </div>
                            ) : (
                              `Claim`
                            )}
                          </Button>
                        ) : null}
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