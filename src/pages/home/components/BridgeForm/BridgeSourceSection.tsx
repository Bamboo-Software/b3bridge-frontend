import {
  FormControl,
  FormField,
  FormItem,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Image from '@/components/ui/image';
import { shortenAddress } from '@/utils';
import type { ITokenInfo } from '@/utils/interfaces/token';
import type { IChainInfo } from '@/utils/interfaces/chain';
import type { UseFormReturn } from 'react-hook-form';
import type { BridgeFormValues } from './BridgeFormValidation';
import { memo, useMemo } from 'react';
import { getTokenNameByChainIdAndTokenAddress } from '@/utils/blockchain/chain';

interface FromSectionProps {
  form: UseFormReturn<BridgeFormValues>;
  isConnected: boolean;
  chainList: IChainInfo[];
  chainListLoading: boolean;
  tokenList: ITokenInfo[];
  tokenListLoading: boolean;
  userSourceBalance: string | undefined;
  userSourceBalanceLoading: boolean;
  isMaxDisabled: boolean;
  watchedFromWallet: string;
  handleOpenConnectModal: () => void;
}

function BridgeSourceSection({
  form,
  isConnected,
  chainList,
  chainListLoading,
  tokenList,
  tokenListLoading,
  userSourceBalance,
  userSourceBalanceLoading,
  isMaxDisabled,
  watchedFromWallet,
  handleOpenConnectModal,
}: FromSectionProps) {
const selectedFromChain = form.watch('fromChain');
const watchedTokenAddress = form.watch('token')?.address;

const tokenName = useMemo(() => {
  if (selectedFromChain?.id && watchedTokenAddress) {
    return getTokenNameByChainIdAndTokenAddress(
      selectedFromChain.id,
      watchedTokenAddress
    );
  }
  return null;
}, [selectedFromChain?.id, watchedTokenAddress]);
  return (
    <div className='rounded-2xl border border-primary/20 bg-primary/5 p-4 shadow-sm flex flex-col gap-5 h-fit'>
      <div className='flex items-center justify-between gap-2 rounded-xl bg-muted/30'>
        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
          {isConnected ? (
            <Button
              type="button"
              disabled
              className="font-medium text-foreground bg-background/60 px-2 py-1 rounded"
            >
              {shortenAddress(watchedFromWallet || '')}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleOpenConnectModal}
              className="text-primary cursor-pointer font-medium py-1 px-2 rounded bg-primary/10 hover:bg-primary/20 transition"
            >
              Please connect wallet
            </Button>
          )}
        </div>
      </div>

      {/* Select Chain */}
      <FormField
        control={form.control}
        name='fromChain'
        render={() => (
          <FormItem>
            <Select
              onValueChange={(value: string) => {
                if (!value) return;
                const selected = chainList.find((chain) => chain.id === Number(value)) || null;
                form.setValue('fromChain', selected);
                form.setValue('token', null);
              }}
              value={form.getValues('fromChain')?.id?.toString() || ''}
            >
              <FormControl>
                <SelectTrigger className='w-full min-h-[44px] text-base font-medium bg-background/70 border-primary/30 hover:border-primary/50 focus:border-primary/60 rounded-lg cursor-pointer'>
                  <SelectValue placeholder='Select chain' />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {chainListLoading ? (
                  <div className='p-2 text-sm text-muted-foreground italic'>
                    <Skeleton className='w-24 h-5' />
                  </div>
                ) : chainList?.length ? (
                  chainList
                    .filter((chain) => !form.getValues('toChain')?.id || chain.id !== form.getValues('toChain')?.id)
                    .map((chain) => (
                      <SelectItem key={chain.id} value={chain.id.toString()}>
                        <div className='flex items-center gap-2'>
                          <Image
                            alt='Chain logo'
                            fallbackSrc={'/images/default-coin-logo.jpg'}
                            src={chain.logo || ''}
                            className='w-5 h-5 rounded-xl'
                          />
                          <span>{chain.name}</span>
                        </div>
                      </SelectItem>
                    ))
                ) : (
                  <div className='p-2 text-sm text-red-500'>No chains available</div>
                )}
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />

      {/* Amount + Token */}
      <div className='w-full'>
        <div className='relative flex items-center bg-background/70 border border-primary/30 rounded-xl px-2 py-1'>
          {/* Amount Input */}
          <FormField
            control={form.control}
            name='amount'
            render={({ field }) => (
              <FormItem className='flex-1'>
                <FormControl>
                  <Input
                    {...field}
                    placeholder='0.0'
                    inputMode='decimal'
                    autoComplete='off'
                    className={`
                      text-[2.2rem] md:text-5xl font-extrabold
                      py-4 md:py-6 px-2
                      border-none shadow-none !bg-transparent
                      focus:ring-0 focus-visible:ring-0
                      h-[56px] md:h-[72px] leading-tight
                      rounded-xl
                      transition-all
                    `}
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Token Select */}
          <FormField
            control={form.control}
            name='token'
            render={() => (
              <FormItem>
                <Select
                  onValueChange={(value) => {
                    const selected = tokenList.find((token) => token.address === value) || null;
                    form.setValue('token', selected);
                  }}
                  value={form.getValues('token')?.address || ''}
                >
                  <FormControl>
                    <SelectTrigger className='h-[36px] me-2 text-base font-medium bg-background/70 border-primary/30 hover:border-primary/50 focus:border-primary/60 rounded-lg cursor-pointer'>
                      <SelectValue placeholder='Token' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {!form.getValues('fromChain') ? (
                      <div className='p-2 text-sm text-muted-foreground italic'>
                        Please select a chain first
                      </div>
                    ) : tokenListLoading ? (
                      <div className='p-2 text-sm text-muted-foreground italic'>
                        <Skeleton className='w-20 h-5' />
                      </div>
                    ) : tokenList.length > 0 ? (
                      tokenList.map((token) => (
                        <SelectItem key={token.address} value={token.address}>
                          <div className='flex items-center gap-2'>
                            <Image
                              alt='Token logo'
                              fallbackSrc={'/images/default-coin-logo.jpg'}
                              src={token.logo}
                              className='w-5 h-5 rounded-xl'
                            />
                            <span>{token.symbol}</span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <div className='p-2 text-sm text-red-500'>No tokens found</div>
                    )}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Balance + MAX Button */}
      <div className='flex justify-between items-center'>
        <div className='text-xs text-muted-foreground px-2'>
          Balance:{' '}
          {userSourceBalanceLoading ? (
            <Skeleton className='inline-block w-16 h-4 align-middle' />
          ) : (
            <span className='font-semibold text-foreground'>{userSourceBalance} {tokenName}</span>
          )}
        </div>
        <Button
          type='button'
          className='text-xs font-semibold !px-3 !py-1 rounded-lg transition border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/50 active:bg-primary/30 shadow cursor-pointer'
          onClick={() => form.setValue('amount', userSourceBalance ?? '')}
          tabIndex={-1}
          disabled={isMaxDisabled}
        >
          {userSourceBalanceLoading ? <Skeleton className='w-10 h-4' /> : 'MAX'}
        </Button>
      </div>
    </div>
  );
}

export default memo(BridgeSourceSection);
