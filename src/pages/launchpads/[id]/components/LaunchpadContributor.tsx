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
                {chains.map((chain) => (
                  <TableCell key={chain.key} className='text-center'>
                    <span className='text-white font-medium'>
                      {contributor[chain.key] || 0}
                    </span>
                  </TableCell>
                ))}
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
