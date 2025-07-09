import { Search, Filter, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

export const FilterSection: React.FC<{
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  chainFilter: string;
  setChainFilter: (filter: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
}> = ({
  searchTerm,
  setSearchTerm,
  chainFilter,
  setChainFilter,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8">
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-[color:var(--gray-night)] border-[color:var(--gray-charcoal)] text-foreground min-w-32">
              <Filter className="w-4 h-4 mr-2" />
              {chainFilter}
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[color:var(--gray-night)] border-[color:var(--gray-charcoal)]">
            <DropdownMenuItem onClick={() => setChainFilter('Chain')}>All Chains</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setChainFilter('Ethereum')}>Ethereum</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setChainFilter('BSC')}>BSC</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setChainFilter('Avalanche')}>Avalanche</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-[color:var(--gray-night)] border-[color:var(--gray-charcoal)] text-foreground min-w-32">
              {statusFilter}
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[color:var(--gray-night)] border-[color:var(--gray-charcoal)]">
            <DropdownMenuItem onClick={() => setStatusFilter('All Status')}>All Status</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('Live')}>Live</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('Upcoming')}>Upcoming</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('Ended')}>Ended</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('Cancelled')}>Cancelled</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-[color:var(--gray-night)] border-[color:var(--gray-charcoal)] text-foreground min-w-32">
              {sortBy}
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[color:var(--gray-night)] border-[color:var(--gray-charcoal)]">
            <DropdownMenuItem onClick={() => setSortBy('No Sort')}>No Sort</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('Name A-Z')}>Name A-Z</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('Name Z-A')}>Name Z-A</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};