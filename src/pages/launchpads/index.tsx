import React, { useEffect, useState } from 'react';
import { LaunchpadGrid } from './components/LaunchPadGrid';
import { FilterSection } from './components/FilterSection';
import { PresaleStatus } from '@/utils/enums/presale';
import { preSaleGeneralApi } from '@/services/pre-sale/pre-sale-general';
import { preSaleApi } from '@/services/pre-sale/presales';
import { WalletConnectionRequired } from '@/pages/common/WalletConnectionRequired';
import { useAccount } from 'wagmi';
import { LoadingLaunchpad } from './components/LoadingLaunchpad';
import { useAuthToken } from '@/hooks/useAuthToken';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import CommonPagination from '@/components/Pagination/CommonPagination';
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

type OrderField = 'createdAt' | 'updatedAt' | 'startTime' | 'totalRaised';
type OrderDirection = 'ASC' | 'DESC';

interface FilterState {
  searchTerm: string;
  chainFilter: string;
  statusFilter: PresaleStatus | 'All Status';
  orderField: OrderField | null;
  orderDirection: OrderDirection;
}

export default function LaunchpadsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const limit = 9;
  const [subTab, setSubTab] = useState<'launchpads' | 'contributions'>('launchpads');
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    chainFilter: 'Chain',
    statusFilter: 'All Status',
    orderField: null,
    orderDirection: 'DESC',
  });

  const { isConnected } = useAccount();
  const { token } = useAuthToken();

  const { useGetSupportedChainPreSalesQuery } = preSaleGeneralApi;
  const { useGetPreSalesContributionQuery, useGetPreSalesQuery, useGetPreSalesExploreQuery } = preSaleApi;

  const {
    data: supportedChainData = { data: [] },
    isLoading: isChainsLoading,
  } = useGetSupportedChainPreSalesQuery({});

  const {
    data: presalesExploreApiData = { data: { items: [], total: 0 } },
    isLoading: isPresalesExploreLoading,
    error: presalesExploreError,
    refetch: refetchPresalesExplore,
  } = useGetPreSalesExploreQuery({
    q: filters.searchTerm || undefined,
    chainId: filters.chainFilter !== 'Chain' ? filters.chainFilter : undefined,
    status: filters.statusFilter !== 'All Status' ? filters.statusFilter : undefined,
    orderField: filters.orderField || undefined,
    orderDirection: filters.orderDirection,
    page,
    limit,
  });

  const {
    data: presalesApiData = { data: { items: [], total: 0 } },
    isLoading: isPresalesLoading,
    error: presalesError,
    refetch: refetchPresales,
  } = useGetPreSalesQuery({
    q: filters.searchTerm || undefined,
    chainId: filters.chainFilter !== 'Chain' ? filters.chainFilter : undefined,
    status: filters.statusFilter !== 'All Status' ? filters.statusFilter : undefined,
    orderField: filters.orderField || undefined,
    orderDirection: filters.orderDirection,
    page,
    limit,
  });
  const {
    data: presalesContributionApiData = { data: { items: [], total: 0 } },
    isLoading: isPresalesContributionLoading,
    error: presalesContributionError,
    refetch: refetchPresalesContribution,
  } = useGetPreSalesContributionQuery({
    q: filters.searchTerm || undefined,
    chainId: filters.chainFilter !== 'Chain' ? filters.chainFilter : undefined,
    status: filters.statusFilter !== 'All Status' ? filters.statusFilter : undefined,
    orderField: filters.orderField || undefined,
    orderDirection: filters.orderDirection,
    page,
    limit,
  });

  const presalesExploreData = presalesExploreApiData?.data?.items || [];
  const presalesData = presalesApiData?.data?.items || [];
  const presalesContributionData = presalesContributionApiData?.data?.items || [];

  const totalPresalesExplore = presalesExploreApiData?.data?.total || 0;
  const totalPresales = presalesApiData?.data?.total || 0;
  const totalPresalesContribution = presalesContributionApiData?.data?.total || 0;

  const totalPagesExplore = Math.ceil(totalPresalesExplore / limit);
  const totalPagesPresales = Math.ceil(totalPresales / limit);
  const totalPagesContribution = Math.ceil(totalPresalesContribution / limit);

  useEffect(() => {
    if (token && isConnected) {
      const timer = setTimeout(() => {
        refetchPresalesExplore();
        refetchPresales();
        refetchPresalesContribution();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [token, isConnected, refetchPresalesExplore, refetchPresales, refetchPresalesContribution]);

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
      <CustomTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {(activeTab === 'all' || subTab === "contributions" || subTab === "launchpads") && (
        <FilterSection
          activeTab={activeTab}
          subTab={subTab}
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
      )}

      {activeTab === 'all' && (
        <>
          {(isChainsLoading || isPresalesExploreLoading) && <LoadingLaunchpad count={6} />}
          {presalesExploreError && !isPresalesExploreLoading && (
            <div className='text-center py-8 mb-8'>
              <div className='text-yellow-500 text-sm mb-2'>Failed to load latest data</div>
              <div className='text-muted-foreground text-xs'>
                Showing cached data. Please try refreshing the page.
              </div>
            </div>
          )}
          {!isChainsLoading && !isPresalesExploreLoading && (
            <>
              <LaunchpadGrid
                presales={presalesExploreData}
                supportedChains={supportedChainData.data}
              />
              <CommonPagination
                currentPage={page}
                totalPages={totalPagesExplore}
                onPageChange={setPage}
              />
            </>
          )}
          {!isChainsLoading && !isPresalesExploreLoading && presalesExploreData.length === 0 && (
            <div className='text-center py-12'>
              <div className='text-muted-foreground text-lg mb-2'>No presales found</div>
              <div className='text-muted-foreground text-sm'>
                Try adjusting your filters or search terms
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'my-contributions' && (
        <div>
          <Tabs value={subTab} onValueChange={(value) => setSubTab(value as 'contributions' | 'launchpads')}>
            <TabsList>
              <TabsTrigger value="launchpads">My Launchpads</TabsTrigger>
              <TabsTrigger value="contributions">Contribution</TabsTrigger>
            </TabsList>
            <TabsContent value="launchpads">
              <>
                {(isChainsLoading || isPresalesLoading) && <LoadingLaunchpad count={6} />}
                {presalesError && !isPresalesLoading && (
                  <div className='text-center py-8 mb-8'>
                    <div className='text-yellow-500 text-sm mb-2'>Failed to load latest data</div>
                    <div className='text-muted-foreground text-xs'>
                      Showing cached data. Please try refreshing the page.
                    </div>
                  </div>
                )}
                {!isChainsLoading && !isPresalesLoading && (
                  <>
                    <LaunchpadGrid
                      presales={presalesData}
                      supportedChains={supportedChainData.data}
                    />
                    <CommonPagination
                      currentPage={page}
                      totalPages={totalPagesPresales}
                      onPageChange={setPage}
                    />
                  </>
                )}
                {!isChainsLoading && !isPresalesLoading && presalesData.length === 0 && (
                  <div className='text-center py-12'>
                    <div className='text-muted-foreground text-lg mb-2'>No presales found</div>
                    <div className='text-muted-foreground text-sm'>
                      Try adjusting your filters or search terms
                    </div>
                  </div>
                )}
              </>
            </TabsContent>
            <TabsContent value="contributions">
              <>
                {(isChainsLoading || isPresalesContributionLoading) && <LoadingLaunchpad count={6} />}
                {presalesContributionError && !isPresalesContributionLoading && (
                  <div className='text-center py-8 mb-8'>
                    <div className='text-yellow-500 text-sm mb-2'>Failed to load latest data</div>
                    <div className='text-muted-foreground text-xs'>
                      Showing cached data. Please try refreshing the page.
                    </div>
                  </div>
                )}
                {!isChainsLoading && !isPresalesContributionLoading && (
                  <>
                    <LaunchpadGrid
                      presales={presalesContributionData}
                      supportedChains={supportedChainData.data}
                    />
                    <CommonPagination
                      currentPage={page}
                      totalPages={totalPagesContribution}
                      onPageChange={setPage}
                    />
                  </>
                )}
                {!isChainsLoading && !isPresalesContributionLoading && presalesContributionData.length === 0 && (
                  <div className='text-center py-12'>
                    <div className='text-muted-foreground text-lg mb-2'>No presales found</div>
                    <div className='text-muted-foreground text-sm'>
                      Try adjusting your filters or search terms
                    </div>
                  </div>
                )}
              </>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}