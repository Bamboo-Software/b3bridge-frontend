import type { ITransaction } from '@/utils/interfaces/transaction';
import { getLayerZeroScanLink } from '@/utils/blockchain/explorer';
import { ArrowRightLeft, Clock } from 'lucide-react';
import Image from '@/components/ui/image';
import type { ITokenInfo } from '@/utils/interfaces/token';
import { useTransactionInfo } from '@/hooks/transaction/useTransactionInfo';
import { formatNumber, shortenAddress } from '@/utils';
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useLocalTransactionStatus } from '@/hooks/transaction/useUpdateLocalTransactionStatus';


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
  const elapsedTime = useLocalTransactionStatus(tx)
   function getTxExplorerLink(txHash: string, chainId: number): string {
  switch (chainId) {
    case 11155111:
      return `https://sepolia.etherscan.io/tx/${txHash}`;
    case 1:
      return `https://etherscan.io/tx/${txHash}`;
    case 1328:
      return `https://seitrace.com/tx/${txHash}`;
    default:
      return '';
  }
}

 function getCCIPExplorerLink(messageId: string): string {
  return `https://ccip.chain.link/msg/${messageId}`;
}
  return (
    <div className='border rounded-xl p-4 mb-4 bg-background/80 shadow transition hover:shadow-lg flex flex-col gap-4'>
      {/* Progress && Elapsed Time */}
        {elapsedTime ? (
            <div className="flex justify-between items-center px-1 py-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="inline-flex items-center gap-1 bg-muted/50 text-foreground text-xs font-semibold px-2 py-1 rounded-md shadow-sm cursor-default hover:bg-muted transition-colors">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>
                      Running for: <span className="text-primary">{elapsedTime}</span>
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className='w-full bg-gradient-to-r from-primary via-cyan-400 to-purple-500 hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg text-white py-2 rounded-lg'>
                  <span className="text-xs font-semibold">
                    Started at: {new Date(tx.createdAt ?? Date.now()).toLocaleString()}
                  </span>
                </TooltipContent>
              </Tooltip>
            </div>
          ) : (
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
      )}
      <div className="flex gap-2 flex-wrap">
      {/* View tx on Explorer */}
      {tx.txHash && (
        <a
          href={getTxExplorerLink(tx.txHash, tx.fromChain.id)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary underline hover:text-primary/80 transition"
        >
          🧾 View Tx on {tx.fromChain.name} Explorer
        </a>
      )}

      {/* View CCIP message */}
      {tx.messageId && (
        <a
          href={getCCIPExplorerLink(tx.messageId)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-medium text-purple-500 underline hover:text-purple-400 transition"
        >
          🔗 View CCIP Message
        </a>
      )}
    </div>

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
