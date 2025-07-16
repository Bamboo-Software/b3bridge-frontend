/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { LaunchpadMainContent } from './components/LaunchpadMainContent';
import { LaunchpadSideBar } from './components/LaunchpadSidebar';
import { preSaleGeneralApi } from '@/services/pre-sale/pre-sale-general';
import { preSaleApi } from '@/services/pre-sale/presales';
import { useMultipleCampaignContributors } from '@/hooks/usePreSaleContract';
import { useProcessedContributors } from '@/hooks/useProcessedContributors';
import type { LaunchpadSupportedChain } from '@/utils/interfaces/chain';
import { useAuthToken } from '@/hooks/useAuthToken';
import { DeploymentStatus } from '@/utils/enums/presale';
import type { PresaleSupportedChain } from '@/utils/interfaces/launchpad';
import type { Abi } from 'viem';

export default function LaunchpadDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { token } = useAuthToken();

  // API hooks
  const { useGetSupportedChainPreSalesQuery } = preSaleGeneralApi;
  const { useGetDetailPreSalesQuery } = preSaleApi;

  const {
    data: supportedChains = { data: [] },
    isLoading: isChainsLoading,
    refetch: refetchSupportedChains,
  } = useGetSupportedChainPreSalesQuery({});

  const {
    data: launchpadDetail,
    isLoading: isLaunchpadLoading,
    error: launchpadError,
    refetch: refetchLaunchpadDetail,
    isUninitialized
  } = useGetDetailPreSalesQuery({ presaleId: id });

  // Use launchpadDetail.data directly
  const launchpad = launchpadDetail?.data;

  // Helper function to get chain info
  const getChainInfo = (chainId: string) => {
    return supportedChains.data.find(
      (c: LaunchpadSupportedChain) => c.chainId === chainId
    );
  };

  // Create chains array for contract calls
  const chains = useMemo(
    () =>
      launchpad?.presaleChains.map((chain: PresaleSupportedChain) => ({
        key: chain.chainId,
        label: getChainInfo(chain.chainId)?.name || chain.chainId,
        contractAddress: chain.contractAddress,
        chainId: Number(chain.chainId),
        paymentTokenAddress: chain.paymentTokenAddress,
        abi: chain.contractAbi,
      })) || [],
    [launchpad?.presaleChains, supportedChains.data]
  );

  // Get contributors data from blockchain
  const {
    data: contributorsByChain = [],
    refetch: refetchContributors,
  } = useMultipleCampaignContributors(
    chains.map(
      ({
        contractAddress,
        chainId,
        abi,
      }: {
        contractAddress: string;
        chainId: number;
        abi: Abi;
      }) => ({
        contractAddress: contractAddress as `0x${string}`,
        chainId,
        abi,
      })
    )
  )

  const { contributors: mergedContributors, } =
    useProcessedContributors({
      chains,
      contributorsByChain,
      presaleChains: launchpad?.presaleChains || [],
    });

  const safeRefetchLaunchpadDetail = useCallback(() => {
    if (!isUninitialized && refetchLaunchpadDetail) {
      try {
        return refetchLaunchpadDetail();
      } catch (error) {
        return Promise.reject(error);
      }
    } else {
      return Promise.resolve();
    }
  }, [isUninitialized, refetchLaunchpadDetail]);

  const safeRefetchSupportedChains = useCallback(() => {
    if (refetchSupportedChains) {
      try {
        return refetchSupportedChains();
      } catch (error) {
        console.warn('Failed to refetch supported chains:', error);
        return Promise.reject(error);
      }
    } else {
      console.warn('Cannot refetch supported chains: refetch function not available');
      return Promise.resolve();
    }
  }, [refetchSupportedChains]);

  // Refetch all data safely
  const refetchAll = useCallback(() => {
    safeRefetchSupportedChains();
    safeRefetchLaunchpadDetail();
  }, [safeRefetchSupportedChains, safeRefetchLaunchpadDetail]);

  // Auto-refetch when wallet connects with debounce
  useEffect(() => {
    if (token) {
      const timer = setTimeout(() => {
        refetchAll();
      }, 500); // Increased delay to prevent multiple rapid calls

      return () => clearTimeout(timer);
    }
  }, [token, refetchAll]);

  // Check for error or draft status
  if (
    !isLaunchpadLoading &&
    (launchpadError ||
      !launchpad ||
      launchpad?.status === DeploymentStatus.DRAFT)
  ) {
    return (
      <div className='min-h-screen bg-background'>
        <div className='container mx-auto px-6 py-8'>
          <div className='flex flex-col items-center justify-center min-h-[60vh] text-center'>
            <div className='mb-6'>
              <div className='w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center'>
                <svg
                  className='w-12 h-12 text-gray-400'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.5-.769-6.238-2.071'
                  />
                </svg>
              </div>
            </div>
            <h1 className='text-3xl font-bold mb-4'>Launchpad Not Found</h1>
            <p className='text-lg text-gray-600 mb-8 max-w-md'>
              The launchpad you're looking for doesn't exist or is not yet
              available for public viewing.
            </p>
            <button
              onClick={() => window.history.back()}
              className='px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors'
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (
    !launchpad ||
    isChainsLoading ||
    isLaunchpadLoading
  ) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
          <p className='text-muted-foreground'>Loading launchpad details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto px-6 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Main Content */}
          <LaunchpadMainContent
            launchpad={launchpad}
            supportedChains={supportedChains.data}
            contributorState={mergedContributors}
          />

          {/* Sidebar */}
          <LaunchpadSideBar
            launchpad={launchpad}
            contributorState={mergedContributors}
            supportedChains={supportedChains.data}
            refetchContributors={refetchContributors}
            refetchLaunchpadDetail={safeRefetchLaunchpadDetail}
          />
        </div>
      </div>
    </div>
  );
}