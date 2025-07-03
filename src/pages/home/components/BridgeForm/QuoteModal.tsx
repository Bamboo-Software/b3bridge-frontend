import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { IQuote } from '@/utils/interfaces/quote';
import type { ITokenInfo } from '@/utils/interfaces/token';
import Image from '@/components/ui/image';
import { formatNumber } from '@/utils';

interface QuoteModalProps {
  open: boolean;
  onClose: () => void;
  quotes?: IQuote[];
  tokenList?: ITokenInfo[];
  destinationToken?: ITokenInfo;
  onSelect?: (quote: IQuote) => void;
  selectedQuote?: IQuote;
}

function getTokenInfo(
  tokenList: ITokenInfo[] = [],
  address: string,
  destinationToken?: ITokenInfo
) {
  if (!address) return undefined;
  const found = tokenList.find(
    (t) => t.address?.toLowerCase() === address.toLowerCase()
  );
  if (found) return found;
  if (destinationToken?.address?.toLowerCase() === address.toLowerCase()) {
    return destinationToken;
  }
  return undefined;
}

function formatUsd(amount: string, token: ITokenInfo | undefined) {
  if (!token || !token.priceUsd || !amount) return '';
  const value =
    (Number(amount) / 10 ** (token.decimals || 18)) * Number(token.priceUsd);
  return value
    ? `~$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
    : '';
}

export function QuoteModal({
  open,
  onClose,
  quotes = [],
  tokenList = [],
  destinationToken,
  onSelect,
  selectedQuote,
}: QuoteModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className=' max-h-[90vh] overflow-y-auto !w-md bg-background border border-primary/20 rounded-xl shadow-lg'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold text-center text-primary'>
            Select Quote
          </DialogTitle>
        </DialogHeader>
        <div className='space-y-4 mt-2'>
          {quotes.length === 0 ? (
            <div className='text-center text-muted-foreground py-6'>
              No quote available
            </div>
          ) : (
            quotes.map((quote) => {
              const dstTokenInfo = getTokenInfo(
                tokenList,
                quote.dstToken,
                destinationToken
              );
              return (
                <div
                  key={quote.route}
                  className={`p-4 rounded-lg border transition-colors cursor-pointer
                    ${
                      selectedQuote?.route === quote.route
                        ? 'border-primary bg-primary/10'
                        : 'border-primary/20 bg-background/60 hover:border-primary'
                    }
                  `}
                  onClick={() => onSelect?.(quote)}
                >
                  {/* Route name */}
                  <div className='flex items-center justify-between mb-4'>
                    <div className='font-semibold text-primary text-lg'>
                      {quote.route}
                    </div>
                    {selectedQuote?.route === quote.route && (
                      <span className='text-xs px-2 py-0.5 rounded bg-primary text-white ml-2'>
                        Selected
                      </span>
                    )}
                  </div>
                  <div className='flex justify-between'>
                    <div className='mb-3'>
                      <div className='text-base font-semibold text-primary'>
                        Destination Amount
                      </div>
                      <div className='flex items-center gap-2 mt-1'>
                        <span className='font-semibold text-lg'>
                          {formatNumber(
                            Number(quote.dstAmount) /
                              10 ** (dstTokenInfo?.decimals || 18)
                          )}
                        </span>
                        <span className='font-medium text-base flex gap-2 items-center'>
                          <Image
                            alt='Token logo'
                            fallbackSrc={'/images/default-coin-logo.jpg'}
                            src={dstTokenInfo?.logo || ''}
                            className='w-5 h-5 rounded-xl'
                          />
                          <span className='mt-0.5'>
                            {dstTokenInfo?.symbol ||
                              dstTokenInfo?.symbol ||
                              quote.dstToken}
                          </span>
                        </span>
                      </div>
                    </div>
                    {/* Duration */}
                    <div className='mb-3'>
                      <div className='text-base font-semibold text-primary'>
                        Estimated Duration
                      </div>
                      <div className='font-medium mt-1'>
                        {quote.duration?.estimated}s
                      </div>
                    </div>

                  </div>
                  {/* Fees */}
                  <div>
                    <div className='text-base font-semibold text-primary mb-1'>
                      Fees
                    </div>
                    <div className='space-y-1'>
                      {quote.fees && quote.fees.length > 0 ? (
                        quote.fees.map((fee, i) => {
                          const feeToken = getTokenInfo(
                            tokenList,
                            fee.token,
                            destinationToken
                          );
                          return (
                            <div
                              key={i}
                              className='flex items-center gap-2 text-sm'
                            >
                              <span className='text-primary text-base leading-none'>
                                •
                              </span>
                              <span className='capitalize font-medium'>
                                {fee.type}:
                              </span>
                              <div className='flex gap-1'>
                                <span>
                                  {formatNumber(
                                    Number(fee.amount) /
                                      10 ** (feeToken?.decimals || 18)
                                  )}
                                </span>
                                <span>{feeToken?.symbol || fee.token}</span>
                              </div>
                              <span className='text-xs text-muted-foreground'>
                                {formatUsd(fee.amount, feeToken)}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <span className='text-sm'>N/A</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <DialogFooter className='mt-4'>
          <Button
            onClick={onClose}
            variant='ghost'
            className='w-full'
            type='button'
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
