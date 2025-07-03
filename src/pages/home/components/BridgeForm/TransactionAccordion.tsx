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
import { Clock, Receipt } from 'lucide-react';

interface TransactionAccordionProps {
  receiveAmount?: string;
  route?: string;
  estTime?: string;
  slippage?: string;
  isTransactionInfoLoading?: boolean;
  enable?: boolean;
  totalFeeStargateUsd?:string
  setQuoteModalOpen: (value:boolean)=> void
  destinationToken?:ITokenInfo
}

export default function TransactionAccordion({
  receiveAmount = '—',
  route = '—',
  estTime = '—',
  isTransactionInfoLoading = false,
  enable = false,
  totalFeeStargateUsd,
  setQuoteModalOpen,
  destinationToken
}: TransactionAccordionProps) {
  const hasAllInfo =
    receiveAmount !== '—' &&
    receiveAmount  &&
    estTime !== '—' &&
    estTime &&
    totalFeeStargateUsd;
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
              <AccordionTrigger className='pt-0 py-2 text-sm text-muted-foreground hover:no-underline no-underline cursor-pointer ju'>
                <div className='flex justify-between flex-1'>
                  <span>
                    Transaction
                  </span>
                 {hasAllInfo && (
                  <div className='flex items-center gap-2'>
                    <div className="flex items-center gap-1" title="Receive Amount">
                      <Image
                        alt='Token logo'
                        fallbackSrc={'/images/default-coin-logo.jpg'}
                        src={destinationToken?.logo || ''}
                        className='w-4 h-4 rounded-xl'
                      />
                      <span>{formatNumber(Number(receiveAmount))}</span>
                    </div>
                    <span className="text-muted-foreground select-none">|</span>
                    <div className="flex items-center gap-1" title="Total Fee">
                      <Receipt className="w-4 h-4 text-primary" />
                      <span>${formatNumber(Number(totalFeeStargateUsd))}</span>
                    </div>
                    <span className="text-muted-foreground select-none">|</span>
                    <div className="flex items-center gap-1" title="Estimated Time">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>{estTime}s</span>
                    </div>
                  </div>
                )}
                </div>
              </AccordionTrigger>
              <AccordionContent className='flex flex-col gap-4 text-foreground'>
                {enable ? (
                  isTransactionInfoLoading ? (
                    <Skeleton className='h-20 w-full rounded-lg' />
                  ) : (
                    <div className='text-sm text-muted-foreground space-y-2'>
                      <div className='flex justify-between'>
                        <span>You will receive</span>
                        <div className='flex items-center gap-1'>
                          <span>{formatNumber(Number(receiveAmount)) } </span>
                           <Image
                            alt='Token logo'
                            fallbackSrc={'/images/default-coin-logo.jpg'}
                            src={destinationToken?.logo || ''}
                            className='w-3 h-3 rounded-xl'
                          />
                        </div>
                      </div>
                      {route && (
                        <div className='flex justify-between'>
                          <span>Route</span>
                          <div onClick={() => setQuoteModalOpen(true)} className='flex items-center gap-1'>
                            <span>{route}</span>  
                            <Pencil1Icon className='cursor-pointer'/>
                          </div>
                        </div>
                      )}
                      
                      <div className='flex justify-between'>
                        <span>Est. Time</span>
                        <span>{estTime}s</span>
                      </div>
                      <div className='flex justify-between'>
                        <span>Total Fee</span>
                        <div className='flex gap-2'>
                          {totalFeeStargateUsd && <span> ${formatNumber(Number(totalFeeStargateUsd)) }</span>}
                          
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
