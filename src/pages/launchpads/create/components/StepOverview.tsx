/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFormContext } from 'react-hook-form';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import Image from '@/components/ui/image';
import { cn, formatNumber, shortenAddress, shortenUrl } from '@/utils';
import type { ITokenOFT } from '@/utils/interfaces/token';
import { configLaunchPadsChains } from '@/utils/constants/chain';
import { getChainImage, isEvmChain } from '@/utils/blockchain/chain';
import { ChainTokenSource, ChainType } from '@/utils/enums/chain';
import dayjs from 'dayjs';
import type { LaunchpadFormValues } from './launchpadFormValidation';
import CopyIcon from '@/assets/icons/copy-icon.svg';
import { useState } from 'react';
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { CheckIcon } from '@radix-ui/react-icons';
import { Button } from '@/components/ui/button';
import { useChainTransfer } from '@/hooks/useChainTransfer';
import type { Address } from 'viem';
import { TransactionStatus } from '@/utils/enums/transaction';
import { useSwitchChain } from 'wagmi';
const SOCIAL_FIELDS = [
  { key: 'website', label: 'Website' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'x', label: 'X' },
  { key: 'github', label: 'Github' },
  { key: 'telegram', label: 'Telegram' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'discord', label: 'Discord' },
  { key: 'reddit', label: 'Reddit' },
  { key: 'youtube', label: 'Youtube Video' },
  { key: 'description', label: 'Description' },
];

const URL_FIELDS = [
  'website',
  'facebook',
  'x',
  'github',
  'telegram',
  'instagram',
  'discord',
  'reddit',
  'youtube',
];

export function Step3Overview({ tokens }: { tokens: ITokenOFT[] }) {
  const { getValues, setValue } = useFormContext<LaunchpadFormValues>();
  const values = getValues();
  const token = tokens.find((t: ITokenOFT) => t.id === values.token);

  const totalTokens = values.chainFields
    ? Object.values(values.chainFields).reduce(
        (sum, field) => sum + (parseFloat(field.numberOfTokens) || 0),
        0
      )
    : 0;
  const [copied, setCopied] = useState<{ [chainId: string]: boolean }>({});

  const handleCopy = (chainId: string, address: string) => {
    navigator.clipboard.writeText(address || '');
    setCopied((prev) => ({ ...prev, [chainId]: true }));
    setTimeout(() => {
      setCopied((prev) => ({ ...prev, [chainId]: false }));
    }, 1500);
  };

  const { transfer } = useChainTransfer();
  const { switchChainAsync } = useSwitchChain();

  const handlePay = async (
    chainId: number,
    chainType: ChainType,
    to: string,
    amount?: string
  ) => {
    try {
      await switchChainAsync({ chainId });

      if (!amount) throw new Error('Amount is required for payment');
      setValue(`chainFields.${chainId}.payStatus`, TransactionStatus.PENDING);
      setValue(`chainFields.${chainId}.payError`, '');
      const result = await transfer({
        chainType,
        to: to as Address,
        amount,
        chainId,
      });
      if (result?.hash) {
        setValue(`chainFields.${chainId}.payStatus`, TransactionStatus.SUCCESS);
        setValue(`chainFields.${chainId}.payHash`, result.hash);
      } else {
        setValue(`chainFields.${chainId}.payStatus`, TransactionStatus.ERROR);
        setValue(
          `chainFields.${chainId}.payError`,
          result?.error || 'Transaction failed'
        );
      }
    } catch (e) {
      setValue(`chainFields.${chainId}.payStatus`, TransactionStatus.ERROR);
      setValue(
        `chainFields.${chainId}.payError`,
        (e as Error).message || 'Transaction failed'
      );
    }
  };

  return (
    <div className='space-y-6'>
      {/* Token Info */}
      <div className='rounded-lg bg-[color:var(--gray-night)] border border-[color:var(--gray-charcoal)] p-4'>
        <div className='font-semibold mb-2'>Token Information</div>
        <div className='flex flex-col gap-2'>
          <div className='flex justify-between'>
            <span className='text-foreground'>Total token</span>
            <span className='font-semibold text-primary'>
              {formatNumber(totalTokens)} {token?.symbol}
            </span>
          </div>
          <div className='flex justify-between'>
            <span className='text-foreground'>Token name</span>
            <span className='font-semibold text-primary'>{token?.name}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-foreground'>Token symbol</span>
            <span className='font-semibold text-primary'>{token?.symbol}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-foreground'>Token decimals</span>
            <span className='font-semibold text-primary'>
              {token?.decimals}
            </span>
          </div>
        </div>
      </div>
      {/* Chain */}
      <div className='rounded-lg bg-[color:var(--gray-night)] border border-[color:var(--gray-charcoal)] p-4'>
        <div className='font-semibold mb-2'>Chain</div>
        <Accordion type='single' collapsible className='flex flex-col gap-3'>
          {values.chain?.map((chainId: string) => {
            const chain = configLaunchPadsChains.find(
              (c) => c.id.toString() === chainId
            );
            const field = values.chainFields?.[chainId];
            if (!chain || !field) return null;
            return (
              <AccordionItem
                key={chain.id}
                value={chain.id.toString()}
                className='cursor-pointer  !border-2 border-[color:var(--gray-charcoal)] rounded-2xl'
              >
                <div className='rounded-xl bg-[color:var(--gray-night)]'>
                  <AccordionTrigger
                    className={cn(
                      'p-6 cursor-pointer flex items-center gap-2 rounded-lg focus:outline-none bg-transparent hover:no-underline'
                    )}
                  >
                    <div className='flex !flex-1 gap-2 items-center '>
                      <Image
                        src={getChainImage({
                          chainId: chain.id,
                          source: ChainTokenSource.Local,
                        })}
                        objectFit='contain'
                        alt={chain.name}
                        className='w-6 h-6 rounded-full'
                      />
                      <span className='font-semibold text-foreground'>
                        {chain.name}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className='px-6 pb-6 pt-3 border-t border-[color:var(--gray-charcoal)]'>
                    <div className='flex flex-col'>
                      {/* Address */}
                      <div className='flex items-center justify-between py-2'>
                        <span className='text-foreground'>Address</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span
                                className='flex items-center gap-2 font-semibold text-primary cursor-pointer truncate max-w-[220px]'
                                onClick={() =>
                                  handleCopy(chainId, field.address || '')
                                }
                              >
                                <span>
                                  {shortenAddress(field.address || '') || '-'}
                                </span>
                                {copied[chainId] ? (
                                  <CheckIcon className='text-green-500 w-[20px] h-[20px]' />
                                ) : (
                                  <Image src={CopyIcon} alt='copy' />
                                )}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <span>{field.address}</span>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      {[
                        { label: 'Presale Rate', value: field.presaleRate },
                        {
                          label: 'Number of tokens',
                          value: formatNumber(field.numberOfTokens),
                        },
                        {
                          label: 'Softcap',
                          value: formatNumber(field.softcap),
                        },
                        {
                          label: 'Hardcap',
                          value: formatNumber(field.hardcap),
                        },
                        {
                          label: 'Minimum Buy',
                          value: formatNumber(field.minBuy),
                        },
                        {
                          label: 'Maximum Buy',
                          value: formatNumber(field.maxBuy),
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className={cn(
                            'flex justify-between py-2',
                            'border-t border-[color:var(--gray-charcoal)]'
                          )}
                        >
                          <span className='text-foreground'>{item.label}</span>
                          <span className='font-semibold text-primary'>
                            {item.value}
                          </span>
                        </div>
                      ))}
                      <div className='flex justify-between items-center py-3 border-t border-[color:var(--gray-charcoal)]'>
                        <div className='text-foreground'>
                          Total fees:
                          <span className='font-semibold text-primary ms-1'>
                            {formatNumber(field.totalFee || '0')} ETH
                          </span>
                        </div>
                        {field.payStatus === TransactionStatus.SUCCESS ? (
                          <span className='ml-4 px-4 py-1 rounded-full bg-green-900/30 text-green-400 flex items-center gap-1 border border-green-700'>
                            Payment successful <CheckIcon className='w-4 h-4' />
                          </span>
                        ) : (
                          <Button
                            type='button'
                            disabled={
                              field.payStatus === TransactionStatus.PENDING
                            }
                            onClick={() =>
                              handlePay(
                                chain.id,
                                isEvmChain(chain.id)
                                  ? ChainType.EVM
                                  : ChainType.Solana,
                                field.address || '',
                                field.totalFee
                              )
                            }
                            className='
        !px-6 !h-8 !py-2 transition ml-4 text-white !text-base font-semibold
        bg-[linear-gradient(45deg,_var(--blue-primary),_var(--primary))]
        shadow-[0_0px_10px_0_var(--blue-primary)]
        border-none
        rounded-lg
        cursor-pointer
        hover:opacity-90
        hover:shadow-[0_0px_16px_0_var(--blue-primary)]
      '
                          >
                            {field.payStatus === TransactionStatus.PENDING
                              ? 'Paying...'
                              : 'Pay'}
                          </Button>
                        )}
                      </div>
                      {field.payStatus === TransactionStatus.ERROR && (
                        <div className='text-red-400 text-sm mt-1 ml-auto'>
                          {field.payError || 'Insufficient funds !'}
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </div>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
      {/* Time */}
      <div className='rounded-lg bg-[color:var(--gray-night)] border border-[color:var(--gray-charcoal)] p-4'>
        <div className='font-semibold mb-2'>Time</div>
        <div className='flex flex-col gap-2'>
          <div className='flex justify-between'>
            <span className='text-foreground'>Start time</span>
            <span className='font-semibold text-primary'>
              {values.startTime
                ? dayjs(values.startTime).format('MMMM DD, YYYY')
                : '-'}
            </span>
          </div>
          <div className='flex justify-between'>
            <span className='text-foreground'>End time</span>
            <span className='font-semibold text-primary'>
              {values.endTime
                ? dayjs(values.endTime).format('MMMM DD, YYYY')
                : '-'}
            </span>
          </div>
        </div>
      </div>
      {/* Additional Info */}
      <div className='rounded-lg bg-[color:var(--gray-night)] border border-[color:var(--gray-charcoal)] p-4'>
        <div className='font-semibold mb-2'>Additional information</div>
        <div className='flex flex-col gap-2'>
          {SOCIAL_FIELDS.map((f) => {
            const value = values[f.key as keyof LaunchpadFormValues];
            if (!value) return null;
            const isUrl = URL_FIELDS.includes(f.key);
            return (
              <div className='flex justify-between' key={f.key}>
                <span className='text-foreground'>{f.label}</span>
                <span className='font-semibold  text-right max-w-[60%] break-words'>
                  {isUrl ? (
                    <a
                      href={value as string}
                      target='_blank'
                      rel='noopener noreferrer'
                      className=' hover:text-blue-400 transition'
                    >
                      {shortenUrl(value as string)}
                    </a>
                  ) : (
                    (value as string)
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
