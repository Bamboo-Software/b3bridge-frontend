import { FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Image from '@/components/ui/image';
import { shortenAddress } from '@/utils';
import type { ITokenInfo } from '@/utils/interfaces/token';
import type { IChainInfo } from '@/utils/interfaces/chain';
import type { UseFormReturn } from 'react-hook-form';
import type { BridgeFormValues } from './BridgeFormValidation';
import FilterSelect from '@/components/ui/filter-select';

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
  return (
    <div className='rounded-2xl border border-primary/20 bg-primary/5 p-4 shadow-sm flex flex-col gap-5 h-fit'>
      <div className='flex items-center justify-between gap-2 rounded-xl bg-muted/30'>
        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
          {isConnected ? (
            <Button
              type='button'
              disabled
              className='font-medium text-foreground bg-background/60 px-2 py-1 rounded'
            >
              {shortenAddress(watchedFromWallet || '')}
            </Button>
          ) : (
            <Button
              type='button'
              onClick={handleOpenConnectModal}
              className='text-primary cursor-pointer font-medium py-1 px-2 rounded bg-primary/10 hover:bg-primary/20 transition'
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
          <FilterSelect
            dropdownClassName='w-[400px]'
            showAll={false}
            data={chainList.filter(
              (chain) =>
                !form.getValues('toChain')?.chainKey ||
                chain.chainKey !== form.getValues('toChain')?.chainKey
            )}
            value={form.getValues('fromChain')?.chainKey?.toString() || null}
            onChange={(selected) => {
              form.setValue('fromChain', selected, { shouldValidate: true });
              form.setValue('token', null, { shouldValidate: true });
            }}
            getLabel={(chain) => (
              <div className='flex items-center gap-2'>
                <Image
                  alt='Chain logo'
                  fallbackSrc='/images/default-coin-logo.jpg'
                  src={chain.logo || ''}
                  className='w-5 h-5 rounded-xl'
                />
                <span>{chain.name?.toUpperCase()}</span>
              </div>
            )}
            getValue={(chain) => chain.chainKey?.toString() || ''}
            placeholder='Select chain'
            allLabel='All Chains'
            disabled={chainList.length === 0}
            loading={chainListLoading}
            filterOption={(chain, search) =>
              !!chain.name?.toLowerCase().includes(search.toLowerCase()) ||
              !!chain.chainKey
                ?.toString()
                .toLowerCase()
                .includes(search.toLowerCase())
            }
          />
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
                    onChange={(e) => {
                      let value = e.target.value.replace(/[^0-9.]/g, '');
                      value = value.replace(/(\..*)\./g, '$1');
                      if (value.includes('.')) {
                        const [intPart, decPart] = value.split('.');
                        value = intPart + '.' + decPart.slice(0, 5);
                      }
                      field.onChange(value);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Token Select */}
          <div className='w-fit'>
            <FormField
              control={form.control}
              name='token'
              render={() => (
                <FilterSelect
                dropdownClassName='w-[350px]'
                  data={tokenList}
                  value={`${form.getValues('token')?.symbol} ${form.getValues('token')?.address}`}
                  onChange={(selected) => {
                    form.setValue('token', selected, { shouldValidate: true });
                  }}
                  getLabel={(token) => (
                    <div className='flex items-center gap-2'>
                      <Image
                        alt='Token logo'
                        fallbackSrc={'/images/default-coin-logo.jpg'}
                        src={token.logo}
                        className='w-5 h-5 rounded-xl'
                      />
                      <span>{token.symbol}</span>
                    </div>
                  )}
                  getValue={(token) => `${token.symbol} ${token.address}`}
                  placeholder='Token'
                  allLabel='All Tokens'
                  showAll={false}
                  disabled={tokenList.length === 0}
                  loading={tokenListLoading}
                  filterOption={(token, search) => {
                      return (token.symbol.toLowerCase().includes(search.toLowerCase()) ||
                      token.address.toLowerCase().includes(search.toLowerCase()))
                    }
                  }
                />
              )}
            />
          </div>
        </div>
      </div>

      {/* Balance + MAX Button */}
      <div className='flex justify-between items-center'>
        <div className='text-xs text-muted-foreground px-2'>
          Balance:{' '}
          {userSourceBalanceLoading ? (
            <Skeleton className='inline-block w-16 h-4 align-middle' />
          ) : (
            <span className='font-semibold text-foreground'>
              {userSourceBalance}
            </span>
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

export default BridgeSourceSection
