import React, { useEffect, useState } from 'react';
import { LaunchpadGrid } from './components/LaunchPadGrid';
import { FilterSection } from './components/FilterSection';
import { PresaleStatus, Category } from '@/utils/enums/presale';
import { ChainType } from '@/utils/enums/chain';
import { DeploymentStatus } from '@/utils/enums/presale';
import type { PresaleListItem } from '@/utils/interfaces/launchpad';
import { preSaleGeneralApi } from '@/services/pre-sale/pre-sale-general';
import { preSaleApi } from '@/services/pre-sale/presales';
import { WalletConnectionRequired } from '@/pages/common/WalletConnectionRequired';
import { useAccount } from 'wagmi';
import { LoadingLaunchpad } from './components/LoadingLaunchpad';
import { useAuthToken } from '@/hooks/useAuthToken';

// ...existing code...
const mockPresaleData: PresaleListItem[] = [
  {
    id: '123e4567-e89b-12d3-a456-426614174001',
    title: 'DeFi Token Presale',
    description:
      'A revolutionary DeFi token that will change the way we think about decentralized finance. Built with cutting-edge technology and backed by an experienced team.',
    bannerUrl:
      'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=400&fit=crop',
    softCap: '100000000000000000000', // 100 ETH
    hardCap: '1000000000000000000000', // 1000 ETH
    totalRaised: '750000000000000000000', // 750 ETH
    startTime: '2025-07-15T10:00:00.000Z',
    endTime: '2025-08-15T10:00:00.000Z',
    status: PresaleStatus.ACTIVE,
    category: Category.DEFI,
    tags: ['DeFi', 'Yield Farming', 'Staking'],
    createdAt: '2025-07-01T10:00:00.000Z',
    updatedAt: '2025-07-10T10:00:00.000Z',
    supportedChains: [
      {
        id: 'chain-1',
        presaleId: '123e4567-e89b-12d3-a456-426614174001',
        oftTokenId: 'token-1',
        oftToken: {
          id: 'token-1',
          chainId: '11155111',
          name: 'DeFi Token',
          description: 'Revolutionary DeFi token',
          symbol: 'DFT',
          decimals: 18,
          totalSupply: '1000000000000000000000000',
          logoUrl:
            'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=64&h=64&fit=crop&crop=center',
          createdAt: '2025-07-01T10:00:00.000Z',
          updatedAt: '2025-07-01T10:00:00.000Z',
        },
        chainType: ChainType.EVM,
        chainId: '11155111',
        contractAddress: '0x742d35Cc6731C0532925a3b8D4eB70B3fCa4a4E7',
        tokenAddress: '0x1234567890123456789012345678901234567890',
        systemWalletAddress: '0x742d35Cc6731C0532925a3b8D4eB70B3fCa4a4E7',
        userWalletAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
        paymentTokenAddress: '0x0000000000000000000000000000000000000000',
        softCap: '100000000000000000000',
        hardCap: '1000000000000000000000',
        totalTokens: '500000000000000000000000',
        presaleRate: '1000',
        listingRate: '800',
        minContribution: '100000000000000000',
        maxContribution: '10000000000000000000',
        routerAddress: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
        pairAddress: '',
        totalRaised: '750000000000000000000',
        totalContributors: 150,
        createTxHash: '',
        createBlockNumber: '',
        createGasUsed: '',
        createGasPrice: '',
        createCost: '',
        finalizeTxHash: '',
        finalizeBlockNumber: '',
        finalizeGasUsed: '',
        isFinalized: false,
        status: DeploymentStatus.SUCCESS,
        deployError: '',
        notes: '',
        createdAt: '2025-07-01T10:00:00.000Z',
        updatedAt: '2025-07-10T10:00:00.000Z',
      },
    ],
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174002',
    title: 'Gaming NFT Marketplace',
    description:
      'The ultimate gaming NFT marketplace where players can trade, buy, and sell in-game assets across multiple gaming platforms.',
    bannerUrl:
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=400&fit=crop',
    softCap: '50000000000000000000',
    hardCap: '500000000000000000000',
    totalRaised: '325000000000000000000',
    startTime: '2025-07-20T14:00:00.000Z',
    endTime: '2025-08-20T14:00:00.000Z',
    status: PresaleStatus.PENDING,
    category: Category.GAMING,
    tags: ['Gaming', 'NFT', 'Marketplace'],
    createdAt: '2025-07-05T14:00:00.000Z',
    updatedAt: '2025-07-10T14:00:00.000Z',
    supportedChains: [
      {
        id: 'chain-3',
        presaleId: '123e4567-e89b-12d3-a456-426614174002',
        oftTokenId: 'token-2',
        oftToken: {
          id: 'token-2',
          chainId: '11155111',
          name: 'GameFi Token',
          description: 'Gaming NFT marketplace token',
          symbol: 'GFT',
          decimals: 18,
          totalSupply: '500000000000000000000000',
          logoUrl:
            'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=64&h=64&fit=crop&crop=center',
          createdAt: '2025-07-05T14:00:00.000Z',
          updatedAt: '2025-07-05T14:00:00.000Z',
        },
        chainType: ChainType.EVM,
        chainId: '11155111',
        contractAddress: '',
        tokenAddress: '',
        systemWalletAddress: '0x952d35Cc6731C0532925a3b8D4eB70B3fCa4a4E9',
        userWalletAddress: '0xcdef1234567890abcdef1234567890abcdef1234',
        paymentTokenAddress: '0x0000000000000000000000000000000000000000',
        softCap: '50000000000000000000',
        hardCap: '500000000000000000000',
        totalTokens: '250000000000000000000000',
        presaleRate: '500',
        listingRate: '400',
        minContribution: '1000000000000000000',
        maxContribution: '50000000000000000000',
        routerAddress: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff',
        pairAddress: '',
        totalRaised: '325000000000000000000',
        totalContributors: 76,
        createTxHash: '',
        createBlockNumber: '',
        createGasUsed: '',
        createGasPrice: '',
        createCost: '',
        finalizeTxHash: '',
        finalizeBlockNumber: '',
        finalizeGasUsed: '',
        isFinalized: false,
        status: DeploymentStatus.PENDING,
        deployError: '',
        notes: '',
        createdAt: '2025-07-05T14:00:00.000Z',
        updatedAt: '2025-07-10T14:00:00.000Z',
      },
    ],
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174003',
    title: 'Green Energy DAO',
    description:
      'Decentralized autonomous organization focused on funding and developing sustainable green energy projects worldwide.',
    bannerUrl:
      'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&h=400&fit=crop',
    softCap: '200000000000000000000',
    hardCap: '2000000000000000000000',
    totalRaised: '2000000000000000000000',
    startTime: '2025-06-01T09:00:00.000Z',
    endTime: '2025-07-01T09:00:00.000Z',
    status: PresaleStatus.ENDED,
    category: Category.DAO,
    tags: ['DAO', 'Green Energy', 'Sustainability'],
    createdAt: '2025-05-15T09:00:00.000Z',
    updatedAt: '2025-07-01T09:00:00.000Z',
    supportedChains: [
      {
        id: 'chain-4',
        presaleId: '123e4567-e89b-12d3-a456-426614174003',
        oftTokenId: 'token-3',
        oftToken: {
          id: 'token-3',
          chainId: '11155111',
          name: 'Green DAO Token',
          description: 'Green energy DAO governance token',
          symbol: 'GDT',
          decimals: 18,
          totalSupply: '1000000000000000000000000',
          logoUrl:
            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=64&h=64&fit=crop&crop=center',
          createdAt: '2025-05-15T09:00:00.000Z',
          updatedAt: '2025-05-15T09:00:00.000Z',
        },
        chainType: ChainType.EVM,
        chainId: '11155111',
        contractAddress: '0xa52d35Cc6731C0532925a3b8D4eB70B3fCa4a4Ea',
        tokenAddress: '0x3234567890123456789012345678901234567890',
        systemWalletAddress: '0xa52d35Cc6731C0532925a3b8D4eB70B3fCa4a4Ea',
        userWalletAddress: '0xdef1234567890abcdef1234567890abcdef12345',
        paymentTokenAddress: '0x0000000000000000000000000000000000000000',
        softCap: '200000000000000000000',
        hardCap: '2000000000000000000000',
        totalTokens: '1000000000000000000000000',
        presaleRate: '500',
        listingRate: '400',
        minContribution: '1000000000000000000',
        maxContribution: '100000000000000000000',
        routerAddress: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
        pairAddress: '0x4567890123456789012345678901234567890123',
        totalRaised: '2000000000000000000000',
        totalContributors: 234,
        createTxHash:
          '0x123abc456def789ghi012jkl345mno678pqr901stu234vwx567yza890bcd123efg',
        createBlockNumber: '17890123',
        createGasUsed: '2100000',
        createGasPrice: '20000000000',
        createCost: '42000000000000000',
        finalizeTxHash:
          '0x456def789ghi012jkl345mno678pqr901stu234vwx567yza890bcd123efg456abc',
        finalizeBlockNumber: '17920456',
        finalizeGasUsed: '1800000',
        isFinalized: true,
        status: DeploymentStatus.SUCCESS,
        deployError: '',
        notes: 'Successfully completed and finalized',
        createdAt: '2025-05-15T09:00:00.000Z',
        updatedAt: '2025-07-01T09:00:00.000Z',
      },
      {
        id: 'chain-4',
        presaleId: '123e4567-e89b-12d3-a456-426614174003',
        oftTokenId: 'token-3',
        oftToken: {
          id: 'token-3',
          chainId: '11155111',
          name: 'Green DAO Token',
          description: 'Green energy DAO governance token',
          symbol: 'GDT',
          decimals: 18,
          totalSupply: '1000000000000000000000000',
          logoUrl:
            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=64&h=64&fit=crop&crop=center',
          createdAt: '2025-05-15T09:00:00.000Z',
          updatedAt: '2025-05-15T09:00:00.000Z',
        },
        chainType: ChainType.EVM,
        chainId: '97',
        contractAddress: '0xa52d35Cc6731C0532925a3b8D4eB70B3fCa4a4Ea',
        tokenAddress: '0x3234567890123456789012345678901234567890',
        systemWalletAddress: '0xa52d35Cc6731C0532925a3b8D4eB70B3fCa4a4Ea',
        userWalletAddress: '0xdef1234567890abcdef1234567890abcdef12345',
        paymentTokenAddress: '0x0000000000000000000000000000000000000000',
        softCap: '200000000000000000000',
        hardCap: '2000000000000000000000',
        totalTokens: '1000000000000000000000000',
        presaleRate: '500',
        listingRate: '400',
        minContribution: '1000000000000000000',
        maxContribution: '100000000000000000000',
        routerAddress: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
        pairAddress: '0x4567890123456789012345678901234567890123',
        totalRaised: '2000000000000000000000',
        totalContributors: 234,
        createTxHash:
          '0x123abc456def789ghi012jkl345mno678pqr901stu234vwx567yza890bcd123efg',
        createBlockNumber: '17890123',
        createGasUsed: '2100000',
        createGasPrice: '20000000000',
        createCost: '42000000000000000',
        finalizeTxHash:
          '0x456def789ghi012jkl345mno678pqr901stu234vwx567yza890bcd123efg456abc',
        finalizeBlockNumber: '17920456',
        finalizeGasUsed: '1800000',
        isFinalized: true,
        status: DeploymentStatus.SUCCESS,
        deployError: '',
        notes: 'Successfully completed and finalized',
        createdAt: '2025-05-15T09:00:00.000Z',
        updatedAt: '2025-07-01T09:00:00.000Z',
      },
    ],
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174004',
    title: 'Meme Coin Mania',
    description:
      "The most epic meme coin that will take you to the moon! Join our community of diamond hands and let's make memes great again!",
    bannerUrl:
      'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=400&fit=crop',
    softCap: '10000000000000000000',
    hardCap: '100000000000000000000',
    totalRaised: '0',
    startTime: '2025-08-01T16:00:00.000Z',
    endTime: '2025-08-31T16:00:00.000Z',
    status: PresaleStatus.DRAFT,
    category: Category.MEME,
    tags: [],
    createdAt: '2025-07-10T16:00:00.000Z',
    updatedAt: '2025-07-10T16:00:00.000Z',
    supportedChains: [
      {
        id: 'chain-5',
        presaleId: '123e4567-e89b-12d3-a456-426614174004',
        oftTokenId: 'token-4',
        oftToken: {
          id: 'token-4',
          chainId: '43113',
          name: 'Meme Mania Token',
          description: 'Epic meme coin for the community',
          symbol: 'MMT',
          decimals: 9,
          totalSupply: '1000000000000000000',
          logoUrl:
            'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=64&h=64&fit=crop&crop=center',
          createdAt: '2025-07-10T16:00:00.000Z',
          updatedAt: '2025-07-10T16:00:00.000Z',
        },
        chainType: ChainType.EVM,
        chainId: '43113',
        contractAddress: '',
        tokenAddress: '',
        systemWalletAddress: '0xb52d35Cc6731C0532925a3b8D4eB70B3fCa4a4Eb',
        userWalletAddress: '0xef1234567890abcdef1234567890abcdef123456',
        paymentTokenAddress: '0x0000000000000000000000000000000000000000',
        softCap: '10000000000000000000',
        hardCap: '100000000000000000000',
        totalTokens: '500000000000000000',
        presaleRate: '5000000',
        listingRate: '4000000',
        minContribution: '100000000000000000',
        maxContribution: '5000000000000000000',
        routerAddress: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
        pairAddress: '',
        totalRaised: '0',
        totalContributors: 0,
        createTxHash: '',
        createBlockNumber: '',
        createGasUsed: '',
        createGasPrice: '',
        createCost: '',
        finalizeTxHash: '',
        finalizeBlockNumber: '',
        finalizeGasUsed: '',
        isFinalized: false,
        status: DeploymentStatus.DRAFT,
        deployError: '',
        notes: '',
        createdAt: '2025-07-10T16:00:00.000Z',
        updatedAt: '2025-07-10T16:00:00.000Z',
      },
    ],
  },
];

// Custom Tabs component matching the design
const CustomTabs: React.FC<{
  activeTab: string;
  setActiveTab: (tab: string) => void;
}> = ({ activeTab, setActiveTab }) => {
  return (
    <div className='mb-8'>
      <div className='flex border-b border-[color:var(--gray-charcoal)]'>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-6 py-3 text-sm font-medium transition-colors relative ${
            activeTab === 'all'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveTab('my-contributions')}
          className={`px-6 py-3 text-sm font-medium transition-colors relative ${
            activeTab === 'my-contributions'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          My Contributions
        </button>
      </div>
    </div>
  );
};

// Order field type based on API spec
type OrderField = 'createdAt' | 'updatedAt' | 'startTime' | 'totalRaised';
type OrderDirection = 'ASC' | 'DESC';

// Filter state interface
interface FilterState {
  searchTerm: string;
  chainFilter: string;
  statusFilter: PresaleStatus | 'All Status';
  orderField: OrderField | null;
  orderDirection: OrderDirection;
}

export default function LaunchpadsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    chainFilter: 'Chain',
    statusFilter: 'All Status',
    orderField: null,
    orderDirection: 'DESC',
  });

  // Check wallet connection
  const { isConnected } = useAccount();

  // Use tanstack query hooks
  const { useGetSupportedChainPreSalesQuery } = preSaleGeneralApi;
  const { useGetPreSalesQuery } = preSaleApi;

  const {
    data: supportedChainData = { data: [] },
    isLoading: isChainsLoading,
  } = useGetSupportedChainPreSalesQuery({});

  const {
    data: presalesApiData = [],
    isLoading: isPresalesLoading,
    error: presalesError,
    refetch: refetchPresales,
  } = useGetPreSalesQuery({
    q: filters.searchTerm || undefined,
    chain: filters.chainFilter !== 'Chain' ? filters.chainFilter : undefined,
    status:
      filters.statusFilter !== 'All Status' ? filters.statusFilter : undefined,
    orderField: filters.orderField || undefined,
    orderDirection: filters.orderDirection,
  });

  // Use mock data if API returns empty or has error
  const presalesData =
    presalesApiData.length > 0 ? presalesApiData : mockPresaleData;
  const { token } = useAuthToken();
  useEffect(() => {
    if (token && isConnected) {
      const timer = setTimeout(() => {
        refetchPresales();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [token, isConnected, refetchPresales]);

  // Check wallet connection first
  if (!isConnected || !token) {
    return (
      <div className='container mx-auto px-6 py-8'>
        <WalletConnectionRequired
          title='Connect Wallet to View Launchpads'
          description='Please connect your wallet to browse and participate in token presales.'
        />
      </div>
    );
  }

  return (
    <div className='container mx-auto px-6 py-8'>
      {/* Header */}
      <div className='flex items-center gap-3 mb-8'>
        <h1 className='text-2xl font-bold text-foreground'>Launchpads List</h1>
        <div className='text-sm text-muted-foreground'>
          ({presalesData.length} presale{presalesData.length !== 1 ? 's' : ''})
        </div>
      </div>

      {/* Custom Tabs */}
      <CustomTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Filters */}
      <FilterSection
        searchTerm={filters.searchTerm}
        setSearchTerm={(searchTerm) =>
          setFilters((prev) => ({ ...prev, searchTerm }))
        }
        chainFilter={filters.chainFilter}
        setChainFilter={(chainFilter) =>
          setFilters((prev) => ({ ...prev, chainFilter }))
        }
        statusFilter={filters.statusFilter}
        setStatusFilter={(statusFilter) =>
          setFilters((prev) => ({ ...prev, statusFilter }))
        }
        orderField={filters.orderField}
        setOrderField={(orderField) =>
          setFilters((prev) => ({ ...prev, orderField }))
        }
        orderDirection={filters.orderDirection}
        setOrderDirection={(orderDirection) =>
          setFilters((prev) => ({ ...prev, orderDirection }))
        }
        supportedChains={supportedChainData.data}
      />

      {/* Loading State */}
      {(isChainsLoading || isPresalesLoading) && <LoadingLaunchpad count={6} />}

      {/* Error State */}
      {presalesError && !isPresalesLoading && (
        <div className='text-center py-8 mb-8'>
          <div className='text-yellow-500 text-sm mb-2'>
            Failed to load latest data
          </div>
          <div className='text-muted-foreground text-xs'>
            Showing cached data. Please try refreshing the page.
          </div>
        </div>
      )}

      {/* Content */}
      {!isChainsLoading && !isPresalesLoading && (
        <LaunchpadGrid
          presales={presalesData}
          supportedChains={supportedChainData.data}
        />
      )}

      {/* Empty State */}
      {!isChainsLoading && !isPresalesLoading && presalesData.length === 0 && (
        <div className='text-center py-12'>
          <div className='text-muted-foreground text-lg mb-2'>
            No presales found
          </div>
          <div className='text-muted-foreground text-sm'>
            Try adjusting your filters or search terms
          </div>
        </div>
      )}
    </div>
  );
}
