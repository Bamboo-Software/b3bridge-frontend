import React, { useState } from 'react';

import { LaunchpadGrid } from './components/LaunchPadGrid';
import { FilterSection } from './components/FilterSection';

export interface LaunchpadData {
  id: string;
  name: string;
  logo: string;
  status: 'upcoming' | 'live' | 'ended' | 'cancelled';
  saleType: 'public' | 'private';
  chains: Array<{
    id: string;
    name: string;
    logo: string;
    raised: string;
    target: string;
    progress: number;
    token: string;
  }>;
  saleTime: {
    start?: string;
    end?: string;
  };
}

const mockLaunchpads: LaunchpadData[] = [
  {
    id: '1',
    name: 'WOW',
    logo: '/images/tokens/wow.png',
    status: 'upcoming',
    saleType: 'public',
    chains: [
      {
        id: 'eth',
        name: 'Ethereum',
        logo: '/images/chains/ethereum.png',
        raised: '0',
        target: '200',
        progress: 0,
        token: 'ETH'
      },
      {
        id: 'avax',
        name: 'Avalanche',
        logo: '/images/chains/avalanche.png',
        raised: '0',
        target: '230',
        progress: 0,
        token: 'AVAX'
      },
      {
        id: 'bsc',
        name: 'BSC',
        logo: '/images/chains/bsc.png',
        raised: '0',
        target: '150',
        progress: 0,
        token: 'BSC'
      }
    ],
    saleTime: {
      start: '00:00:59:37'
    }
  },
  {
    id: '2',
    name: 'President Elon',
    logo: '/images/tokens/president-elon.png',
    status: 'live',
    saleType: 'public',
    chains: [
      {
        id: 'eth',
        name: 'Ethereum',
        logo: '/images/chains/ethereum.png',
        raised: '4',
        target: '200',
        progress: 2,
        token: 'ETH'
      },
      {
        id: 'avax',
        name: 'Avalanche',
        logo: '/images/chains/avalanche.png',
        raised: '138',
        target: '230',
        progress: 60,
        token: 'AVAX'
      },
      {
        id: 'bsc',
        name: 'BSC',
        logo: '/images/chains/bsc.png',
        raised: '75',
        target: '150',
        progress: 50,
        token: 'BSC'
      }
    ],
    saleTime: {
      end: '00:00:59:37'
    }
  },
  {
    id: '3',
    name: 'BULLA',
    logo: '/images/tokens/bulla.png',
    status: 'ended',
    saleType: 'public',
    chains: [
      {
        id: 'eth',
        name: 'Ethereum',
        logo: '/images/chains/ethereum.png',
        raised: '4',
        target: '200',
        progress: 2,
        token: 'ETH'
      },
      {
        id: 'avax',
        name: 'Avalanche',
        logo: '/images/chains/avalanche.png',
        raised: '138',
        target: '230',
        progress: 60,
        token: 'AVAX'
      },
      {
        id: 'bsc',
        name: 'BSC',
        logo: '/images/chains/bsc.png',
        raised: '75',
        target: '150',
        progress: 50,
        token: 'BSC'
      }
    ],
    saleTime: {}
  },
  {
    id: '4',
    name: 'SkillsCoin',
    logo: '/images/tokens/skillscoin.png',
    status: 'cancelled',
    saleType: 'private',
    chains: [
      {
        id: 'eth',
        name: 'Ethereum',
        logo: '/images/chains/ethereum.png',
        raised: '4',
        target: '200',
        progress: 2,
        token: 'ETH'
      },
      {
        id: 'avax',
        name: 'Avalanche',
        logo: '/images/chains/avalanche.png',
        raised: '138',
        target: '230',
        progress: 60,
        token: 'AVAX'
      },
      {
        id: 'bsc',
        name: 'BSC',
        logo: '/images/chains/bsc.png',
        raised: '75',
        target: '150',
        progress: 50,
        token: 'BSC'
      }
    ],
    saleTime: {}
  },
  {
    id: '5',
    name: 'Nova Chain',
    logo: '/images/tokens/nova-chain.png',
    status: 'live',
    saleType: 'public',
    chains: [
      {
        id: 'eth',
        name: 'Ethereum',
        logo: '/images/chains/ethereum.png',
        raised: '4',
        target: '200',
        progress: 2,
        token: 'ETH'
      },
      {
        id: 'bsc',
        name: 'BSC',
        logo: '/images/chains/bsc.png',
        raised: '75',
        target: '150',
        progress: 50,
        token: 'BSC'
      }
    ],
    saleTime: {
      end: '00:00:59:37'
    }
  },
  {
    id: '6',
    name: 'TrumpBSC',
    logo: '/images/tokens/trump-bsc.png',
    status: 'cancelled',
    saleType: 'private',
    chains: [
      {
        id: 'bsc',
        name: 'BSC',
        logo: '/images/chains/bsc.png',
        raised: '4',
        target: '200',
        progress: 2,
        token: 'BSC'
      }
    ],
    saleTime: {}
  }
];


// Custom Tabs component matching the design
const CustomTabs: React.FC<{
  activeTab: string;
  setActiveTab: (tab: string) => void;
}> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="mb-8">
      <div className="flex border-b border-[color:var(--gray-charcoal)]">
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

export default function LaunchpadsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [chainFilter, setChainFilter] = useState('Chain');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [sortBy, setSortBy] = useState('No Sort');

  const getFilteredLaunchpads = (tabValue: string) => {
    return mockLaunchpads.filter(launchpad => {
      const matchesSearch = launchpad.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTab = tabValue === 'all' || 
        (tabValue === 'my-contributions' && launchpad.saleType === 'private');
      const matchesStatus = statusFilter === 'All Status' || 
        launchpad.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesChain = chainFilter === 'Chain' || 
        launchpad.chains.some(chain => chain.name === chainFilter);
      
      return matchesSearch && matchesTab && matchesStatus && matchesChain;
    });
  };

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-2xl font-bold text-foreground">Launchpads List</h1>
      </div>

      {/* Custom Tabs */}
      <CustomTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Filters */}
      <FilterSection
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        chainFilter={chainFilter}
        setChainFilter={setChainFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {/* Content */}
      <LaunchpadGrid launchpads={getFilteredLaunchpads(activeTab)} />
    </div>
  );
}