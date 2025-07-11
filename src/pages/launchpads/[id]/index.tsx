/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { LaunchpadMainContent } from './components/LaunchpadMainContent';
import { LaunchpadSideBar } from './components/LaunchpadSidebar';
import type {
  ContributorRow,
  PresaleDetailResponse,
} from '@/utils/interfaces/launchpad';
import { ChainType } from '@/utils/enums/chain';
import { DeploymentStatus, PresaleStatus } from '@/utils/enums/presale';
import { Category } from '@/utils/enums/presale';
import { preSaleGeneralApi } from '@/services/pre-sale/pre-sale-general';
import { preSaleApi } from '@/services/pre-sale/presales';
import { useMultipleCampaignContributors } from '@/hooks/usePreSaleContract';
import type { LaunchpadSupportedChain } from '@/utils/interfaces/chain';
import { WalletConnectionRequired } from '@/pages/common/WalletConnectionRequired';
import { useAccount } from 'wagmi';
import { useAuthToken } from '@/hooks/useAuthToken';

const mockDetailData: PresaleDetailResponse = {
  id: 'presale-1',
  userId: 'user-123',
  title: 'President Elon',
  description:
    'ELON is a meme coin inspired by the idea of Elon Musk becoming our president. $ELON represents the level of support his presidency would have.',
  bannerUrl: '/images/banners/president-elon-banner.jpg',
  softCap: '50000',
  hardCap: '200000',
  presaleRate: '10000',
  listingRate: '12000',
  startTime: '2025-07-01T10:00:00.000Z',
  endTime: '2025-07-15T18:00:00.000Z',
  minContribution: '0.1',
  maxContribution: '5',
  liquidityPercent: 70,
  liquidityLockDays: 365,
  vestingEnabled: false,
  vestingFirstReleasePercent: 0,
  vestingCycleDays: 0,
  vestingEachCyclePercent: 0,
  whitelistEnabled: false,
  publicStartTime: '2025-07-01T10:00:00.000Z',
  fundRecipientAddress: '0x1234567890abcdef1234567890abcdef12345678',
  fundRecipientChainType: ChainType.EVM,
  fundRecipientChainId: '1',
  totalRaised: '105000',
  totalContributors: 802,
  firstCreateTxHash: '0xabc123...',
  firstCreateBlockNumber: '12345678',
  firstCreateGasUsed: '210000',
  firstCreateGasPrice: '10000000000',
  firstCreateCost: '2100000000000000',
  isFinalized: false,
  finalizeTime: '',
  status: PresaleStatus.ACTIVE,
  cancelReason: '',
  tags: ['Meme', 'Elon', 'Community'],
  category: Category.MEME,
  createdAt: '2025-06-20T09:00:00.000Z',
  updatedAt: '2025-07-01T10:00:00.000Z',
  presaleChains: [
    {
      id: 'eth',
      presaleId: 'presale-1',
      oftTokenId: 'token-eth',
      oftToken: {
        id: 'token-eth',
        chainId: '11155111',
        name: 'President Elon',
        description: 'President Elon Token',
        symbol: 'ELON',
        decimals: 18,
        totalSupply: '1000000000',
        logoUrl: '/images/tokens/president-elon.png',
        createdAt: '2025-06-20T09:00:00.000Z',
        updatedAt: '2025-06-20T09:00:00.000Z',
      },
      chainType: ChainType.EVM,
      chainId: '11155111',
      contractAddress: '0x859b4B1faA138Aa77938f37738C97Ad9D3d70c45',
      tokenAddress: '0x2222222222222222222222222222222222222222',
      systemWalletAddress: '0x3333333333333333333333333333333333333333',
      userWalletAddress: '0x4444444444444444444444444444444444444444',
      paymentTokenAddress: '0x0000000000000000000000000000000000000000',
      softCap: '20000',
      hardCap: '80000',
      totalTokens: '400000000',
      presaleRate: '10000',
      listingRate: '12000',
      minContribution: '0.1',
      maxContribution: '5',
      routerAddress: '0x5555555555555555555555555555555555555555',
      pairAddress: '',
      totalRaised: '45000',
      totalContributors: 479,
      createTxHash: '0xabc123...',
      createBlockNumber: '12345678',
      createGasUsed: '210000',
      createGasPrice: '10000000000',
      createCost: '2100000000000000',
      finalizeTxHash: '',
      finalizeBlockNumber: '',
      finalizeGasUsed: '',
      isFinalized: false,
      status: DeploymentStatus.SUCCESS,
      deployError: '',
      notes: '',
      createdAt: '2025-06-20T09:00:00.000Z',
      updatedAt: '2025-07-01T10:00:00.000Z',
    },
    {
      id: 'avax',
      presaleId: 'presale-1',
      oftTokenId: 'token-avax',
      oftToken: {
        id: 'token-avax',
        chainId: '43113',
        name: 'President Elon',
        description: 'President Elon Token',
        symbol: 'ELON',
        decimals: 18,
        totalSupply: '1000000000',
        logoUrl: '/images/tokens/president-elon.png',
        createdAt: '2025-06-20T09:00:00.000Z',
        updatedAt: '2025-06-20T09:00:00.000Z',
      },
      chainType: ChainType.EVM,
      chainId: '43113',
      contractAddress: '0x6666666666666666666666666666666666666666',
      tokenAddress: '0x7777777777777777777777777777777777777777',
      systemWalletAddress: '0x8888888888888888888888888888888888888888',
      userWalletAddress: '0x9999999999999999999999999999999999999999',
      paymentTokenAddress: '0x0000000000000000000000000000000000000000',
      softCap: '15000',
      hardCap: '60000',
      totalTokens: '300000000',
      presaleRate: '10000',
      listingRate: '12000',
      minContribution: '0.1',
      maxContribution: '5',
      routerAddress: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      pairAddress: '',
      totalRaised: '32000',
      totalContributors: 89,
      createTxHash: '0xdef456...',
      createBlockNumber: '22334455',
      createGasUsed: '210000',
      createGasPrice: '10000000000',
      createCost: '2100000000000000',
      finalizeTxHash: '',
      finalizeBlockNumber: '',
      finalizeGasUsed: '',
      isFinalized: false,
      status: DeploymentStatus.SUCCESS,
      deployError: '',
      notes: '',
      createdAt: '2025-06-20T09:00:00.000Z',
      updatedAt: '2025-07-01T10:00:00.000Z',
    },
    {
      id: 'bsc',
      presaleId: 'presale-1',
      oftTokenId: 'token-bsc',
      oftToken: {
        id: 'token-bsc',
        chainId: '97',
        name: 'President Elon',
        description: 'President Elon Token',
        symbol: 'ELON',
        decimals: 18,
        totalSupply: '1000000000',
        logoUrl: '/images/tokens/president-elon.png',
        createdAt: '2025-06-20T09:00:00.000Z',
        updatedAt: '2025-06-20T09:00:00.000Z',
      },
      chainType: ChainType.EVM,
      chainId: '97',
      contractAddress: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      tokenAddress: '0xcccccccccccccccccccccccccccccccccccccccc',
      systemWalletAddress: '0xdddddddddddddddddddddddddddddddddddddddd',
      userWalletAddress: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      paymentTokenAddress: '0x0000000000000000000000000000000000000000',
      softCap: '15000',
      hardCap: '60000',
      totalTokens: '300000000',
      presaleRate: '10000',
      listingRate: '12000',
      minContribution: '0.1',
      maxContribution: '5',
      routerAddress: '0xffffffffffffffffffffffffffffffffffffffff',
      pairAddress: '',
      totalRaised: '28000',
      totalContributors: 234,
      createTxHash: '0xghi789...',
      createBlockNumber: '33445566',
      createGasUsed: '210000',
      createGasPrice: '10000000000',
      createCost: '2100000000000000',
      finalizeTxHash: '',
      finalizeBlockNumber: '',
      finalizeGasUsed: '',
      isFinalized: false,
      status: DeploymentStatus.SUCCESS,
      deployError: '',
      notes: '',
      createdAt: '2025-06-20T09:00:00.000Z',
      updatedAt: '2025-07-01T10:00:00.000Z',
    },
  ],
};

export default function LaunchpadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [launchpad, setLaunchpad] = useState<PresaleDetailResponse | null>(
    null
  );

  const { isConnected } = useAccount();
  const { token } = useAuthToken();

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
    refetch: refetchLaunchpadDetail,
  } = useGetDetailPreSalesQuery({ presaleId: id });

  useEffect(() => {
    if (id) {
      setLaunchpad(mockDetailData);
    }
  }, [id, launchpadDetail]);

  const getChainInfo = (chainId: string) => {
    return supportedChains.data.find(
      (c: LaunchpadSupportedChain) => c.chainId === chainId
    );
  };

  const chains = useMemo(
    () =>
      launchpad?.presaleChains.map((chain) => ({
        key: chain.chainId,
        label: getChainInfo(chain.chainId)?.name || chain.chainId,
        contractAddress: chain.contractAddress,
        chainId: Number(chain.chainId),
      })) || [],
    [launchpad, supportedChains]
  );

  const { data: contributorsByChain = [], loading: contributorsLoading } =
    useMultipleCampaignContributors(
      chains.map(({ contractAddress, chainId }) => ({
        contractAddress: contractAddress as `0x${string}`,
        chainId,
      }))
    );

  const mergedContributors = useMemo(() => {
    const map: Record<string, ContributorRow> = {};
    chains.forEach((chain, idx) => {
      const contributors = contributorsByChain?.[idx] || [];
      for (const item of contributors) {
        if (!map[item.wallet]) {
          map[item.wallet] = { address: item.wallet };
          chains.forEach((c) => {
            map[item.wallet][c.key] = 0;
          });
        }
        const amount =
          typeof item.amount === 'bigint' ? Number(item.amount) : item.amount;
        map[item.wallet][chain.key] =
          Number(map[item.wallet][chain.key]) + amount;
      }
    });
    return Object.values(map);
  }, [contributorsByChain, chains]);

  const refetchAll = () => {
    refetchSupportedChains();
    refetchLaunchpadDetail();
  };

  useEffect(() => {
    if (token && isConnected) {
      const timer = setTimeout(() => {
        refetchAll();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [token, isConnected]);

  // Check wallet connection first
  if (!isConnected || !token) {
    return (
      <div className='container mx-auto px-6 py-8'>
        <WalletConnectionRequired
          title='Connect Wallet to View Launchpad'
          description='Please connect your wallet to browse and participate in this token presale.'
        />
      </div>
    );
  }

  if (
    !launchpad ||
    isChainsLoading ||
    isLaunchpadLoading ||
    contributorsLoading
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
          />
        </div>
      </div>
    </div>
  );
}
