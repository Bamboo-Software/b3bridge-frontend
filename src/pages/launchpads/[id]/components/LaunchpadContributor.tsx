import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CheckIcon } from 'lucide-react';
import Image from '@/components/ui/image';
import CopyIcon from '@/assets/icons/copy-icon.svg';
import type {
  ContributorRow,
  PresaleDetailResponse,
} from '@/utils/interfaces/launchpad';
import type { LaunchpadSupportedChain } from '@/utils/interfaces/chain';
import { useMultipleUserHasClaimed } from '@/hooks/usePreSaleContract';
import { formatNumber } from '@/utils';
import type { Abi } from 'viem';

// Separate component to handle claim status for a single contributor
interface ContributorClaimStatusProps {
  contributor: ContributorRow;
  chains: Array<{
    key: string;
    label: string;
    contractAddress: string;
    chainId: number;
  }>;
  contracts: Array<{
    contractAddress: `0x${string}`;
    abi: Abi;
    chainId: number;
  }>;
}

function ContributorClaimStatus({ contributor, chains, contracts }: ContributorClaimStatusProps) {
  // Hook can be used safely here at component level
  const { data: claimStatuses, loading } = useMultipleUserHasClaimed(
    contracts, 
    contributor.address as `0x${string}`
  );

  // Check if user has contributed to a specific chain
  const hasContributedToChain = (chainKey: string) => {
    const contribution = contributor[chainKey];
    return contribution && Number(contribution) > 0;
  };

  // Get claim status badge
  const getClaimStatusBadge = (chainIndex: number, hasContributed: boolean) => {
    if (!hasContributed) return null;
    
    if (loading) {
      return (
        <span className='text-xs text-gray-400 ml-1'>
          Loading...
        </span>
      );
    }

    const hasClaimed = claimStatuses?.[chainIndex] || false;
    
    if (hasClaimed) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className='text-xs text-green-400 ml-1 cursor-help'>
                ✓ Claimed
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <span>User has claimed tokens from this chain</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className='text-xs text-yellow-400 ml-1 cursor-help'>
              ⏳ Pending
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <span>User has not claimed tokens yet</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <>
      {chains.map((chain, chainIndex) => {
        const contributionAmount = contributor[chain.key];
        const hasContributed = hasContributedToChain(chain.key);
        
        return (
          <TableCell key={chain.key} className='text-center'>
            <div className='flex flex-col items-center gap-1'>
              <span className='text-white font-medium'>
                {contributionAmount ? formatNumber(Number(contributionAmount)) : '0'}
              </span>
              {getClaimStatusBadge(chainIndex, !!hasContributed)}
            </div>
          </TableCell>
        );
      })}
    </>
  );
}

export function LaunchpadContributor({
  launchpad,
  supportedChains,
  mergedContributors,
}: {
  launchpad: PresaleDetailResponse;
  supportedChains: LaunchpadSupportedChain[];
  mergedContributors: ContributorRow[];
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [copied, setCopied] = useState<{ [key: string]: boolean }>({});
  const itemsPerPage = 10;
  
  const getChainInfo = (chainId: string) => {
    return supportedChains.find((c) => c.chainId === chainId);
  };
  
  const chains = launchpad.presaleChains.map((chain) => ({
    key: chain.chainId,
    label: getChainInfo(chain.chainId)?.name || chain.chainId,
    contractAddress: chain.contractAddress,
    chainId: Number(chain.chainId),
  }));

  // Prepare contracts for hook
  const contracts = launchpad.presaleChains.map((chain) => ({
    contractAddress: chain.contractAddress as `0x${string}`,
    abi: chain.contractAbi,
    chainId: Number(chain.chainId),
  }));

  const totalContributors = mergedContributors.length;
  const totalPages = Math.ceil(totalContributors / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentContributors = mergedContributors.slice(startIndex, endIndex);

  const shortenAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleCopy = (index: number, address: string) => {
    navigator.clipboard.writeText(address);
    setCopied((prev) => ({ ...prev, [index]: true }));
    setTimeout(() => {
      setCopied((prev) => ({ ...prev, [index]: false }));
    }, 2000);
  };

  const handlePageChange = (page: number) => setCurrentPage(page);

  return (
    <Card className='bg-[var(--gray-night)] border-[var(--gray-charcoal)] rounded-xl'>
      <CardHeader className='pb-4 '>
        <CardTitle className='text-xl font-semibold text-white'>
          Contributors ({totalContributors})
        </CardTitle>
      </CardHeader>
      <CardContent className='py-0 px-6'>
        <Table containerClassName='rounded-2xl border-[var(--gray-charcoal)] border'>
          <TableHeader className='!bg-[var(--dark-navy)] rounded-t-xl'>
            <TableRow className='border-[var(--gray-charcoal)] hover:bg-[var(--dark-navy)]'>
              <TableHead className='text-foreground font-semibold pl-6'>
                Address
              </TableHead>
              {chains.map((chain) => (
                <TableHead
                  key={chain.key}
                  className='text-foreground font-semibold text-center'
                >
                  {chain.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentContributors.map((contributor, index) => (
              <TableRow
                key={contributor.address}
                className='border-[var(--gray-charcoal)] hover:bg-[#242937] transition-colors'
              >
                <TableCell className='pl-6'>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span
                          className='flex items-center gap-2 font-semibold text-primary cursor-pointer truncate max-w-[220px]'
                          onClick={() => handleCopy(index, contributor.address)}
                        >
                          <span>{shortenAddress(contributor.address)}</span>
                          {copied[index] ? (
                            <CheckIcon className='text-green-500 w-[20px] h-[20px]' />
                          ) : (
                            <Image
                              src={CopyIcon}
                              alt='copy'
                              className='w-[20px] h-[20px]'
                            />
                          )}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <span>{contributor.address}</span>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                
                {/* Use separate component for claim status */}
                <ContributorClaimStatus 
                  contributor={contributor}
                  chains={chains}
                  contracts={contracts}
                />
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {/* Pagination */}
        <div className='p-4 border-t '>
          <Pagination className='justify-end'>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  className={`text-gray-400 hover:text-white hover:bg-[#2a3441] ${
                    currentPage === 1 ? 'pointer-events-none opacity-50' : ''
                  }`}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => handlePageChange(page)}
                      isActive={currentPage === page}
                      className={`text-gray-400 hover:text-white hover:bg-[#2a3441] ${
                        currentPage === page ? 'bg-[#2a3441] text-white' : ''
                      }`}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    handlePageChange(Math.min(totalPages, currentPage + 1))
                  }
                  className={`text-gray-400 hover:text-white hover:bg-[#2a3441] ${
                    currentPage === totalPages
                      ? 'pointer-events-none opacity-50'
                      : ''
                  }`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </CardContent>
    </Card>
  );
}