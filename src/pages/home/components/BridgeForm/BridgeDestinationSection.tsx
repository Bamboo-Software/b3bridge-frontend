import { FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import Image from '@/components/ui/image';
import { CheckCircle2, XCircle } from 'lucide-react';
import { cn, formatTokenAmount, shortenAddress } from '@/utils';
import type { IChainInfo } from '@/utils/interfaces/chain';
import type { BridgeFormValues } from './BridgeFormValidation';
import type { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { memo } from 'react';
import { ChainTokenSource } from '@/utils/enums/chain';
import type { ITokenInfo } from '@/utils/interfaces/token';
import FilterSelect from '@/components/ui/filter-select';
import { useDestinationToken } from '@/hooks/useDestinationToken';
import { Skeleton } from '@/components/ui/skeleton';

interface ToSectionProps {
  form: UseFormReturn<BridgeFormValues>;
  isConnected: boolean;
  chainList: IChainInfo[];
  chainListLoading: boolean;
  useCustomAddress: boolean;
  setUseCustomAddress: (value: boolean) => void;
  receiverValid: boolean | null;
  userDesBalance: string | undefined;
  userDesBalanceLoading: boolean;
  watchedFromWallet: string;
  handleOpenConnectModal: () => void;
  destinationToken?: ITokenInfo;
  selectedFromChain?: IChainInfo;
  toAmount: string;
  watchedAmount: string;
}

function BridgeDestinationSection({
  form,
  isConnected,
  chainList,
  chainListLoading,
  useCustomAddress,
  setUseCustomAddress,
  receiverValid,
  userDesBalance,
  userDesBalanceLoading,
  watchedFromWallet,
  handleOpenConnectModal,
  destinationToken,
  selectedFromChain,
  toAmount,
  watchedAmount,
}: ToSectionProps) {
  const { isLoading } = useDestinationToken(
    form.getValues('token'),
    selectedFromChain,
    form.getValues('toChain')
  );
  return (
    <div className='rounded-2xl border border-primary/20 bg-primary/5 p-4 shadow-sm space-y-5'>
      <div
        className='flex items-center justify-between gap-2 mb-2 rounded-xl bg-muted/30'
        style={{ minHeight: 40 }}
      >
        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
          {isConnected ? (
            <Button
              type='button'
              disabled
              className="text-primary cursor-pointer font-medium py-1 px-2 rounded bg-primary/10 hover:bg-primary/20 transition"
            >
              {useCustomAddress
                ? 'Custom Wallet'
                : shortenAddress(watchedFromWallet || '')}
            </Button>
          ) : useCustomAddress ? (
            <Button
              type='button'
              className='text-primary cursor-pointer font-medium rounded bg-primary/10 px-2 py-1 hover:bg-primary/20 transition'
            >
              Custom Wallet
            </Button>
          ) : (
            <Button
              type='button'
              onClick={handleOpenConnectModal}
              className='text-primary cursor-pointer font-medium rounded bg-primary/10 px-2 py-1 hover:bg-primary/20 transition'
            >
              Connect Wallet
            </Button>
          )}
        </div>
        <div className='flex items-center gap-2'>
          <span className='text-xs text-muted-foreground'>Custom address</span>
          <Switch
            checked={useCustomAddress}
            onCheckedChange={setUseCustomAddress}
          />
        </div>
      </div>

      <FormField
        control={form.control}
        name='toChain'
        render={() => (
          <FilterSelect
            dropdownClassName='w-[400px]'
            showAll={false}
            data={chainList.filter(
              (chain) =>
                (
                  !form.getValues('fromChain')?.chainKey ||
                  chain.chainKey !== form.getValues('fromChain')?.chainKey
                ) &&
                (
                  !form.getValues('fromChain')?.source ||
                  chain.source === form.getValues('fromChain')?.source
                )
            )}
            value={form.getValues('toChain')?.chainKey?.toString() || null}
            onChange={(selected) => {
              form.setValue('toChain', selected, { shouldValidate: true });
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
      <div className='w-full'>
        <div className='relative flex items-center bg-background/70 border border-primary/30 rounded-xl px-2 py-1'>
          <FormField
            control={form.control}
            name='amount'
            render={() => (
              <FormItem className='flex-1'>
                <FormControl>
                  <Input
                    //  value={
                    //   isLoading
                    //     ? '0'
                    //     : destinationToken
                    //       ? selectedFromChain?.source === ChainTokenSource.Stargate
                    //         ? formatTokenAmount(toAmount, destinationToken)
                    //         : watchedAmount
                    //       : '0'
                    // }
                   value={
                      isLoading
                        ? watchedAmount || '0'
                        : selectedFromChain?.source === ChainTokenSource.Stargate
                          ? formatTokenAmount(toAmount, destinationToken) || '0'
                          : watchedAmount || '0'
                    }
                    placeholder='0.0'
                    inputMode='decimal'
                    autoComplete='off'
                    readOnly
                    disabled
                    className={`
                            text-[2.2rem] md:text-5xl font-extrabold
                            py-4 md:py-6 px-4
                            border-none shadow-none !bg-transparent
                            focus:ring-0 focus-visible:ring-0
                            h-[56px] md:h-[72px] leading-tight
                            rounded-xl
                            transition-all
                            opacity-70 cursor-not-allowed
                          `}
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className='flex justify-start mt-5'>
           <div className='text-xs text-muted-foreground px-2'>
            Balance:{' '}
            {userDesBalanceLoading ? (
                // <span className='font-semibold text-foreground'>0</span>
                <Skeleton className='inline-block w-24 h-4 align-middle' />
                // <></>
              )
              :
                (
              <span className='font-semibold text-foreground'>
                {userDesBalance || '0'}
              </span>
            )}
          </div>
          {/* <div className='text-xs text-muted-foreground px-2'>
            Balance:{' '}
            {!destinationToken ? null : userDesBalanceLoading ? (
              <Skeleton className='inline-block w-24 h-4 align-middle' />
            ) : (
              <span className='font-semibold text-foreground'>
                {userDesBalance || '0'} {destinationToken.symbol}
              </span>
            )}
          </div> */}
        </div>
      </div>
      {useCustomAddress ? (
        <FormField
          control={form.control}
          name='toWalletAddress'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className='relative flex items-center'>
                  <Input
                    {...field}
                    placeholder='0x...'
                    className={cn(
                      'bg-background/50 pr-10',
                      receiverValid === false &&
                        'border-destructive focus-visible:ring-destructive/40'
                    )}
                    onBlur={(e) => {
                      form.setValue('toWalletAddress', e.target.value, {
                        shouldValidate: true,
                      });
                    }}
                    onChange={(e) => {
                      field.onChange(e);
                    }}
                  />
                  {receiverValid === true && (
                    <CheckCircle2 className='absolute right-2 text-green-500 w-5 h-5' />
                  )}
                  {receiverValid === false && (
                    <XCircle className='absolute right-2 text-destructive w-5 h-5' />
                  )}
                </div>
              </FormControl>
            </FormItem>
          )}
        />
      ) : null}
    </div>
  );
}

export default memo(BridgeDestinationSection);
