import { Search, Filter, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { PresaleStatus } from '@/utils/enums/presale';
import type { LaunchpadSupportedChain } from '@/utils/interfaces/chain';

// Order field type based on API spec
type OrderField = 'createdAt' | 'updatedAt' | 'startTime' | 'totalRaised';
type OrderDirection = 'ASC' | 'DESC';

interface FilterSectionProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  chainFilter: string;
  setChainFilter: (value: string) => void;
  statusFilter: PresaleStatus | 'All Status';
  setStatusFilter: (value: PresaleStatus | 'All Status') => void;
  orderField: OrderField | null;
  setOrderField: (value: OrderField | null) => void;
  orderDirection: OrderDirection;
  setOrderDirection: (value: OrderDirection) => void;
  supportedChains: LaunchpadSupportedChain[];
}

export function FilterSection({
  searchTerm,
  setSearchTerm,
  chainFilter,
  setChainFilter,
  statusFilter,
  setStatusFilter,
  orderField,
  setOrderField,
  orderDirection,
  setOrderDirection,
  supportedChains
}: FilterSectionProps) {
  const formatDisplayValue = (value: string) => {
    if (value === 'All Status' || value === 'All Categories' || value === 'Chain') {
      return value;
    }
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const formatOrderFieldDisplay = (field: OrderField | null) => {
    if (!field) return 'No Sort';
    
    switch (field) {
      case 'createdAt':
        return 'Created Date';
      case 'updatedAt':
        return 'Updated Date';
      case 'startTime':
        return 'Start Time';
      case 'totalRaised':
        return 'Total Raised';
      default:
        return 'No Sort';
    }
  };

  const getSortDisplayText = () => {
    if (!orderField) return 'No Sort';
    const fieldText = formatOrderFieldDisplay(orderField);
    const directionText = orderDirection === 'ASC' ? '↑' : '↓';
    return `${fieldText} ${directionText}`;
  };

  // Get unique chain names from supportedChains
  const getUniqueChains = () => {
    const chainNames = supportedChains
      .map(chain => chain.name)
      .filter((name, index, array) => array.indexOf(name) === index) // Remove duplicates
      .sort(); // Sort alphabetically
    
    return chainNames;
  };

  const uniqueChains = getUniqueChains();

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8">
      {/* Search Input */}
      <div className="relative md:w-150">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Type token symbol, address to find your launchpad"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-[color:var(--gray-night)] border-[color:var(--gray-charcoal)] text-foreground"
        />
      </div>
      
      <div className="flex gap-2 flex-1 justify-end">
        {/* Chain Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-[color:var(--gray-night)] border-[color:var(--gray-charcoal)] text-foreground min-w-32">
              <Filter className="w-4 h-4 mr-2" />
              {chainFilter === 'Chain' ? 'Chain' : chainFilter}
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[color:var(--gray-night)] border-[color:var(--gray-charcoal)]">
            <DropdownMenuItem onClick={() => setChainFilter('Chain')}>
              All Chains
            </DropdownMenuItem>
            {uniqueChains.map((chainName) => (
              <DropdownMenuItem 
                key={chainName}
                onClick={() => setChainFilter(chainName)}
              >
                {chainName}
              </DropdownMenuItem>
            ))}
            {/* Fallback if no chains loaded yet */}
            {uniqueChains.length === 0 && (
              <>
                <DropdownMenuItem onClick={() => setChainFilter('Ethereum')}>Ethereum</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setChainFilter('BSC')}>BSC</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setChainFilter('Polygon')}>Polygon</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setChainFilter('Avalanche')}>Avalanche</DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-[color:var(--gray-night)] border-[color:var(--gray-charcoal)] text-foreground min-w-32">
              {formatDisplayValue(statusFilter)}
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[color:var(--gray-night)] border-[color:var(--gray-charcoal)]">
            <DropdownMenuItem onClick={() => setStatusFilter('All Status')}>All Status</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter(PresaleStatus.ACTIVE)}>Active</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter(PresaleStatus.PENDING)}>Pending</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter(PresaleStatus.ENDED)}>Ended</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter(PresaleStatus.CANCELLED)}>Cancelled</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter(PresaleStatus.FINALIZED)}>Finalized</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter(PresaleStatus.DRAFT)}>Draft</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sort Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-[color:var(--gray-night)] border-[color:var(--gray-charcoal)] text-foreground min-w-40">
              {getSortDisplayText()}
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[color:var(--gray-night)] border-[color:var(--gray-charcoal)]">
            <DropdownMenuItem onClick={() => setOrderField(null)}>No Sort</DropdownMenuItem>
            
            {/* Created Date Options */}
            <DropdownMenuItem onClick={() => { setOrderField('createdAt'); setOrderDirection('DESC'); }}>
              Created Date ↓ (Newest)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setOrderField('createdAt'); setOrderDirection('ASC'); }}>
              Created Date ↑ (Oldest)
            </DropdownMenuItem>

            {/* Updated Date Options */}
            <DropdownMenuItem onClick={() => { setOrderField('updatedAt'); setOrderDirection('DESC'); }}>
              Updated Date ↓ (Latest)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setOrderField('updatedAt'); setOrderDirection('ASC'); }}>
              Updated Date ↑ (Earliest)
            </DropdownMenuItem>

            {/* Start Time Options */}
            <DropdownMenuItem onClick={() => { setOrderField('startTime'); setOrderDirection('ASC'); }}>
              Start Time ↑ (Earliest)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setOrderField('startTime'); setOrderDirection('DESC'); }}>
              Start Time ↓ (Latest)
            </DropdownMenuItem>

            {/* Total Raised Options */}
            <DropdownMenuItem onClick={() => { setOrderField('totalRaised'); setOrderDirection('DESC'); }}>
              Total Raised ↓ (Highest)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setOrderField('totalRaised'); setOrderDirection('ASC'); }}>
              Total Raised ↑ (Lowest)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}