import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import Image from '@/components/ui/image';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber } from '@/utils';
import type { ITokenInfo } from '@/utils/interfaces/token';
import { Pencil1Icon } from '@radix-ui/react-icons';

interface TransactionAccordionProps {
  receiveAmount?: string;
  route?: string;
  estTime?: string;
  slippage?: string;
  totalFee?: string;
  isTransactionInfoLoading?: boolean;
  enable?: boolean;
  feeToken?: ITokenInfo;
  setQuoteModalOpen: (value:boolean)=> void
}

export default function TransactionAccordion({
  receiveAmount = '—',
  route = '—',
  estTime = '—',
  totalFee = '—',
  isTransactionInfoLoading = false,
  enable = false,
  feeToken,
  setQuoteModalOpen
}: TransactionAccordionProps) {
  return (
    <>
      {enable &&
        (isTransactionInfoLoading ? (
          <Skeleton className='h-20 w-full rounded-lg' />
        ) : (
          <Accordion
            type='single'
            collapsible
            className='w-full'
            defaultValue='item-1'
          >
            <AccordionItem value='item-3'>
              <AccordionTrigger className='pt-0 py-2 text-sm text-muted-foreground hover:no-underline no-underline cursor-pointer'>
                Transaction
              </AccordionTrigger>
              <AccordionContent className='flex flex-col gap-4 text-foreground'>
                {enable ? (
                  isTransactionInfoLoading ? (
                    <Skeleton className='h-20 w-full rounded-lg' />
                  ) : (
                    <div className='text-sm text-muted-foreground space-y-2'>
                      <div className='flex justify-between'>
                        <span>You will receive</span>
                        <span>{receiveAmount}</span>
                      </div>
                      {route && (
                        <div className='flex justify-between'>
                          <span>Route</span>
                          <div onClick={() => setQuoteModalOpen(true)} className='flex items-center gap-1'>
                            <span>{route}</span>  
                            <Pencil1Icon/>
                          </div>
                        </div>
                      )}
                      
                      <div className='flex justify-between'>
                        <span>Est. Time</span>
                        <span>{estTime}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span>Total Fee</span>
                        <div className='flex gap-2'>
                          <span> {formatNumber(Number(totalFee)) }</span>
                          {feeToken && (
                            <div>
                              <Image
                                alt='Token logo'
                                fallbackSrc={'/images/default-coin-logo.jpg'}
                                src={feeToken.logo || ''}
                                className='w-5 h-5 rounded-xl'
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                ) : null}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ))}
    </>
  );
}
