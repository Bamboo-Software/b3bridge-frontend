import { Badge } from '@/components/ui/badge';

export const getStatusBadge = (status: string) => {
  switch (status) {
    case 'upcoming':
      return (
        <Badge className='text-[color:var(--orange-primary)] bg-[color:var(--wood-dark)] border-none rounded-full px-3 py-1 text-xs font-medium'>
          ● Upcoming
        </Badge>
      );
    case 'live':
      return (
        <Badge className='bg-[color:var(--green-deep)] text-[color:var(--green-mint)] border-none rounded-full px-3 py-1 text-xs font-medium'>
          ● Sale live
        </Badge>
      );
    case 'ended':
      return (
        <Badge className='bg-[color:var(--red-deep)] text-[color:var(--red-soft)] border-none rounded-full px-3 py-1 text-xs font-medium'>
          ● Ended
        </Badge>
      );
    case 'cancelled':
      return (
        <Badge className='bg-[color:var(--gray-muted)] text-[color:var(--gray-lightyhjmjm)] border-none rounded-full px-3 py-1 text-xs font-medium'>
          ● Cancelled
        </Badge>
      );
    default:
      return null;
  }
};
