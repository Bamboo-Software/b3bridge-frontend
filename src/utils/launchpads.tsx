import { Badge } from '@/components/ui/badge';

export const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Pending':
      return (
        <Badge className='text-[color:var(--orange-primary)] bg-[color:var(--wood-dark)] border-none rounded-full px-3 py-1 text-xs font-medium'>
          ● Pending
        </Badge>
      );
    case 'Active':
      return (
        <Badge className='bg-[color:var(--green-deep)] text-[color:var(--green-mint)] border-none rounded-full px-3 py-1 text-xs font-medium'>
          ● Sale live
        </Badge>
      );
    case 'Cancelled':
      return (
        <Badge className='bg-[color:var(--red-deep)] text-[color:var(--red-soft)] border-none rounded-full px-3 py-1 text-xs font-medium'>
          ● Cancelled
        </Badge>
      );
    case 'Finalized':
      return (
        <Badge className='bg-[color:var(--gray-muted)] text-[color:var(--gray-lightyhjmjm)] border-none rounded-full px-3 py-1 text-xs font-medium'>
          ● Finalized
        </Badge>
      );
    default:
      return null;
  }
};
