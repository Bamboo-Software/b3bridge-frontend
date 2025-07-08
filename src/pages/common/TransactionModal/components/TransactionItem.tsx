import type { ITransaction } from '@/utils/interfaces/transaction';
import { getLayerZeroScanLink } from '@/utils/blockchain/explorer';
import { AlertTriangle, ArrowRightLeft, ExternalLink } from 'lucide-react';
import Image from '@/components/ui/image';
import type { ITokenInfo } from '@/utils/interfaces/token';
import { useTransactionInfo } from '@/hooks/transaction/useTransactionInfo';
import { formatNumber, getCCIPExplorerLink, getTxExplorerLink, shortenAddress } from '@/utils';
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
// import { useLocalTransactionStatus } from '@/hooks/transaction/useUpdateLocalTransactionStatus';
// import { ChainTokenSource } from '@/utils/enums/chain';
import { Button } from '@/components/ui/button';
import { CCIPTransactionStatus } from '@/utils/enums/transaction';


export function TransactionItem({
  tx,
  tokenList = [],
  
}: {
    tx: ITransaction;
 
  tokenList?: ITokenInfo[];
  }) {



  const {
    statusColor,
    progress,
    fromToken,
    toToken,
    fromAmountFormatted,
    toAmountFormatted,
    fees,
  } = useTransactionInfo(tx, tokenList);
 
  return (
    <div className='border rounded-xl p-4 mb-4 bg-background/80 shadow transition hover:shadow-lg flex flex-col gap-4'>
          <div className='flex flex-col gap-1'>
            <div className='flex items-center justify-between mb-1'>
              <div className='flex items-center gap-2'>
                {progress.icon}
                <span className={`font-semibold text-sm ${statusColor}`}>
                  {progress.label}
                </span>
              </div>
              <span className='text-xs text-muted-foreground'>
                {progress.percent}%
              </span>
            </div>
            <div className='w-full h-2 bg-muted rounded-full overflow-hidden'>
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  progress.percent === 100 ? 'bg-green-500' : 'bg-primary'
                }`}
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>
      <div className="flex flex-wrap gap-2">
      {tx.txHash && (
        <Button
          asChild
          variant="outline"
          className="gap-1 text-primary hover:text-primary/90 border-primary hover:bg-primary/5"
        >
          <a
            href={getTxExplorerLink(tx.txHash, tx.fromChain.id)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="w-4 h-4" />
            Tx on {tx.fromChain.name}
          </a>
        </Button>
      )}

      {tx.messageId && (
        <Button
          asChild
          variant="outline"
          className="gap-1 text-purple-600 hover:text-purple-500 border-purple-500 hover:bg-purple-100"
        >
          <a
            href={getCCIPExplorerLink(tx.messageId)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="w-4 h-4" />
            CCIP Message
          </a>
        </Button>
      )}
    </div>
    {tx.source === "Local" && tx.status !== CCIPTransactionStatus.TARGET && (
      <div className="flex items-start gap-2 p-3 mt-2 rounded-md bg-yellow-50 border border-yellow-200 text-sm text-yellow-800">
        <AlertTriangle className="w-4 h-4 mt-0.5 text-yellow-600" />
        <div>
          <p className="font-medium">Transaction in Progress</p>
          <p>
            This local transaction is still pending. Please don’t refresh or close this tab to avoid losing the transaction status.
          </p>
        </div>
      </div>
    )}
      {/* Transaction Box */}
      <div className='flex items-center justify-between gap-4 bg-muted/30 rounded-lg px-3 py-3 relative'>
        {/* From */}
        <div className='flex flex-col items-center min-w-[90px] group relative'>
          <Image
            src={tx.fromChain.logo || ''}
            fallbackSrc='/images/default-coin-logo.jpg'
            alt={tx.fromChain.name || ''}
            className='w-8 h-8 rounded-full border'
          />
          <span className='text-xs font-semibold mt-1'>
            {tx.fromChain.name}
          </span>
          <div className='flex items-center gap-1 mt-1'>
            <Image
              src={fromToken?.logo || ''}
              fallbackSrc='/images/default-coin-logo.jpg'
              alt={fromToken?.symbol}
              className='w-5 h-5 rounded-full'
            />
            <span className='text-xs'>{fromToken?.symbol}</span>
          </div>
          <span className='text-sm font-bold mt-1'>{fromAmountFormatted}</span>
        </div>

        {/* Arrow + Tooltip */}
        <TooltipProvider delayDuration={100}>
          <div className='flex flex-col items-center min-w-[80px] gap-1'>
            {/* Arrow + tx tooltip */}
            <Tooltip>
              <TooltipTrigger asChild>
                <ArrowRightLeft className='w-7 h-7 text-primary cursor-pointer' />
              </TooltipTrigger>
              <TooltipContent
                side='top'
                align='center'
                className='!bg-background [&_svg]:!fill-background [&_svg]:!bg-background border border-border shadow-md rounded-md p-3 w-64 text-xs text-foreground'
              >
                <div className='text-center'>
                  <span className='block font-semibold mb-2'>Transactions</span>
                  <div className='flex flex-col gap-1'>
                    <a
                      href={getLayerZeroScanLink(tx.txHash)}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-blue-600 underline hover:text-blue-800 break-all'
                    >
                      {shortenAddress(tx.txHash)}
                    </a>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>

            {/* Fee total USD */}
            {fees.length > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className='flex flex-col items-center cursor-default'>
                    <span className='text-[11px] text-muted-foreground'>
                      Fees
                    </span>
                    <span className='text-xs font-medium text-foreground'>
                      $
                      {formatNumber(
                        fees.reduce((sum, fee) => {
                          const usd =
                            fee?.token?.priceUsd && fee?.token?.decimals
                              ? (Number(fee.amount) /
                                  10 ** fee.token.decimals) *
                                Number(fee.token.priceUsd)
                              : 0;
                          return sum + usd;
                        }, 0)
                      )}
                    </span>
                  </div>
                </TooltipTrigger>

                <TooltipContent
                  side='top'
                  align='center'
                  className='bg-background [&_svg]:!fill-background [&_svg]:!bg-background border border-border shadow-md rounded-md p-3 w-64 text-xs text-foreground'
                >
                  <div className='text-center'>
                    <span className='font-semibold text-sm block mb-2'>
                      Fees
                    </span>
                    <div className='flex flex-col gap-1 items-start'>
                      {fees.map((fee, idx) => {
                        const usd =
                          fee?.token?.priceUsd && fee?.token?.decimals
                            ? (Number(fee.amount) /
                                10 ** Number(fee?.token?.decimals)) *
                              Number(fee.token.priceUsd)
                            : null;
                        return (
                          <div key={idx} className='flex items-center gap-2'>
                            <span>{fee.type.toUpperCase()}:</span>
                            <span className='text-xs'>
                              {fee.amountFormatted} {fee.symbol}
                              {usd !== null && (
                                <span className='ml-1 text-muted-foreground text-[11px]'>
                                  (~${formatNumber(usd)})
                                </span>
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </TooltipProvider>

        {/* To */}
        <div className='flex flex-col items-center min-w-[90px] group relative'>
          <Image
            src={tx.toChain.logo || ''}
            fallbackSrc='/images/default-coin-logo.jpg'
            alt={tx.toChain.name || ''}
            className='w-8 h-8 rounded-full border'
          />
          <span className='text-xs font-semibold mt-1'>{tx.toChain.name}</span>
          <div className='flex items-center gap-1 mt-1'>
            <Image
              src={toToken?.logo || ''}
              fallbackSrc='/images/default-coin-logo.jpg'
              alt={toToken?.symbol}
              className='w-5 h-5 rounded-full'
            />
            <span className='text-xs'>{toToken?.symbol}</span>
          </div>
          <span className='text-sm font-bold mt-1'>{toAmountFormatted}</span>
        </div>
      </div>
    </div>
  );
}
