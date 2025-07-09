import React, { useState } from 'react';
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

interface ContributorData {
  address: string;
  eth: number;
  avalanche: number;
  bsc: number;
}

export function LaunchpadContributor() {
  const [currentPage, setCurrentPage] = useState(1);
  const [copied, setCopied] = useState<{ [key: string]: boolean }>({});
  const itemsPerPage = 10;

  // Mock data từ contributors - trong thực tế sẽ aggregate từ API
  const mockContributors: ContributorData[] = [
    { address: '0x7qhthA1TVp8f9B2eC3dF4gH5iJ6kL7mN8oP9qR0sT', eth: 5, avalanche: 2, bsc: 3 },
    { address: '0x4QfHY2K8c1nM3bV5cX6dY7eZ8fA9bC0dE1fG2hI3j', eth: 1, avalanche: 6, bsc: 2 },
    { address: '0x7KT4zGDu3K9fL8mN1oP2qR3sT4uV5wX6yZ7aB8cD9', eth: 3, avalanche: 6, bsc: 1 },
    { address: '0xG5q7WtrQ3e6fG8hI9jK0lM1nO2pQ3rS4tU5vW6xY7', eth: 2, avalanche: 7, bsc: 10 },
    { address: '0x8mf4vPhrNK5gH6iJ7kL8mN9oP0qR1sT2uV3wX4yZ5', eth: 2, avalanche: 8, bsc: 7 },
    { address: '0x8R5nurfVHI9jK0lM1nO2pQ3rS4tU5vW6xY7zA8bC9', eth: 12, avalanche: 9, bsc: 9 },
    { address: '0x8mf4vPhrNK3dE4fG5hI6jK7lM8nO9pQ0rS1tU2vW3', eth: 11, avalanche: 4, bsc: 3 },
    { address: '0xGmXpH8Ch9g2fA3bC4dE5fG6hI7jK8lM9nO0pQ1rS2', eth: 13, avalanche: 6, bsc: 6 },
    { address: '0x8mf4vPhrNK7zA8bC9dE0fG1hI2jK3lM4nO5pQ6rS7', eth: 14, avalanche: 7, bsc: 5 },
    { address: '0x3VFvVZ3965tU6vW7xY8zA9bC0dE1fG2hI3jK4lM5n', eth: 15, avalanche: 9, bsc: 2 },
    { address: '0x2KfRtY8Lm4oP5qR6sT7uV8wX9yZ0aB1cD2eF3gH4i', eth: 8, avalanche: 3, bsc: 4 },
    { address: '0x9PxQwE5Bn7jK8lM9nO0pQ1rS2tU3vW4xY5zA6bC7d', eth: 6, avalanche: 5, bsc: 8 },
  ];

  const totalContributors = mockContributors.length;
  const totalPages = Math.ceil(totalContributors / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentContributors = mockContributors.slice(startIndex, endIndex);

  const shortenAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleCopy = (index: number, address: string) => {
    navigator.clipboard.writeText(address);
    setCopied(prev => ({ ...prev, [index]: true }));
    
    setTimeout(() => {
      setCopied(prev => ({ ...prev, [index]: false }));
    }, 2000);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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
              <TableHead className='text-foreground font-semibold pl-6'>Address</TableHead>
              <TableHead className='text-foreground font-semibold text-center'>ETH</TableHead>
              <TableHead className='text-foreground font-semibold text-center'>Avalanche</TableHead>
              <TableHead className='text-foreground font-semibold text-center pr-6'>BSC</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentContributors.map((contributor, index) => (
              <TableRow 
                key={index} 
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
                          <span>
                            {shortenAddress(contributor.address)}
                          </span>
                          {copied[index] ? (
                            <CheckIcon className='text-green-500 w-[20px] h-[20px]' />
                          ) : (
                            <Image src={CopyIcon} alt='copy' className='w-[20px] h-[20px]' />
                          )}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <span>{contributor.address}</span>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell className='text-center'>
                  <span className='text-white font-medium'>{contributor.eth}</span>
                </TableCell>
                <TableCell className='text-center'>
                  <span className='text-white font-medium'>{contributor.avalanche}</span>
                </TableCell>
                <TableCell className='text-center pr-6'>
                  <span className='text-white font-medium'>{contributor.bsc}</span>
                </TableCell>
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
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => handlePageChange(page)}
                    isActive={currentPage === page}
                    className={`text-gray-400 hover:text-white hover:bg-[#2a3441] ${
                      currentPage === page 
                        ? 'bg-[#2a3441] text-white' 
                        : ''
                    }`}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  className={`text-gray-400 hover:text-white hover:bg-[#2a3441] ${
                    currentPage === totalPages ? 'pointer-events-none opacity-50' : ''
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