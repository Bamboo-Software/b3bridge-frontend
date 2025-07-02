import { useEffect, useState, useCallback } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAccount } from 'wagmi';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Image from '@/components/ui/image';
import { WalletConnectModal } from '@/pages/common/ConnectWalletModal';

import { useTokenList } from '@/hooks/useTokenList';
import { useChainList } from '@/hooks/useChainList';
import { useUserTokenBalance } from '@/hooks/useUserBalance';
import { useDestinationToken } from '@/hooks/useDestinationToken';

import { ArrowDownIcon,ArrowUpIcon , CheckCircle2, XCircle } from 'lucide-react';
import { cn, shortenAddress } from '@/utils';
import type { Address } from 'viem';
import { bridgeFormSchema, type BridgeFormValues } from './BridgeFormValidation';
import TransactionAccordion from './TransactionAccordion';

const validateReceiver = (value: string) =>
  value ? /^0x[a-fA-F0-9]{40}$/.test(value) : null;

function BridgeForm() {
  // --- State ---
  const { address, isConnected } = useAccount();
  const [useCustomAddress, setUseCustomAddress] = useState(false);
  const [receiverValid, setReceiverValid] = useState<boolean | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSwapped, setIsSwapped] = useState(false);

  // --- Form ---
  const form = useForm<BridgeFormValues>({
    resolver: zodResolver(bridgeFormSchema),
    mode: 'onChange',
    defaultValues: {
      fromChain: null,
      toChain: null,
      token: null,
      fromWalletAddress: '',
      toWalletAddress: '',
      amount: '',
    },
  });

  // --- Chain & Token List ---
  const { data: chainList, loading: chainListLoading } = useChainList();
  const selectedFromChain = form.watch('fromChain');
  const selectedToChain = form.watch('toChain');
  const { data: tokenList, loading: tokenListLoading } = useTokenList(selectedFromChain);

  // --- Token & Wallet Watchers ---
  const watchedToken = form.watch('token');
  const watchedTokenAddress = watchedToken?.address as Address;
  const watchedFromWallet = form.watch('fromWalletAddress');
  const watchedToWallet = form.watch('toWalletAddress');
  const watchedAmount = form.watch('amount');

  // --- Destination Token ---
  const destinationToken = useDestinationToken(watchedToken, selectedFromChain, selectedToChain);

  // --- Balances ---
  const { balance: userSourceBalance, loading: userSourceBalanceLoading } = useUserTokenBalance(
    address,
    watchedTokenAddress,
    selectedFromChain?.id
  );
  const { balance: userDesBalance, loading: userDesBalanceLoading } = useUserTokenBalance(
    watchedToWallet as Address,
    destinationToken?.address,
    selectedToChain?.id
  );

  // --- Derived States ---
  const isMaxDisabled = userSourceBalanceLoading || !userSourceBalance || !Number(userSourceBalance);
  const isDestinationTokenValid = !!destinationToken;
  const isBridgeEnabled =
    isConnected &&
    !Object.keys(form.formState.errors).length &&
    form.formState.isValid &&
    !form.formState.isSubmitting &&
    !!selectedFromChain &&
    !!selectedToChain &&
    !!watchedToken &&
    !!watchedAmount &&
    isDestinationTokenValid;

  // --- Effects ---
  useEffect(() => {
    if (isConnected && address) {
      form.setValue('fromWalletAddress', address);
      if (!useCustomAddress) {
        form.setValue('toWalletAddress', address);
      } else {
        form.setValue('toWalletAddress', '');
      }
    }
  }, [isConnected, address, form, useCustomAddress]);

  useEffect(() => {
    if (!useCustomAddress) {
      form.setValue('toWalletAddress', form.getValues('fromWalletAddress'));
    } else {
      form.setValue('toWalletAddress', '');
    }
  }, [useCustomAddress, form]);

  useEffect(() => {
    if (useCustomAddress && watchedToWallet) {
      setReceiverValid(validateReceiver(watchedToWallet));
    } else {
      setReceiverValid(null);
    }
  }, [watchedToWallet, useCustomAddress]);

  useEffect(() => {
    if (modalOpen && isConnected) {
      setModalOpen(false);
    }
  }, [isConnected, modalOpen]);

  // --- Handlers ---
  const handleOpenConnectModal = useCallback(() => setModalOpen(true), []);
  const handleSwap = () => {
    setIsSwapped((prev) => !prev);
    const fromChain = form.getValues('fromChain');
    const toChain = form.getValues('toChain');
    const fromWallet = form.getValues('fromWalletAddress');
    const toWallet = form.getValues('toWalletAddress');
    form.setValue('fromChain', toChain);
    form.setValue('toChain', fromChain);
    form.setValue('token', destinationToken);
    form.setValue('fromWalletAddress', toWallet);
    form.setValue('toWalletAddress', fromWallet);
  }

  const onSubmit: SubmitHandler<BridgeFormValues> = (data) => {
    console.log(data, 'submitted');
  };
  // --- Render ---
  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='max-w-md mx-auto relative flex flex-col gap-3'>
          {/* FROM SECTION */}
          <div className='rounded-2xl border border-primary/20 bg-primary/5 p-4 shadow-sm flex flex-col gap-5 h-fit'>
            {/* Wallet info row (FROM) */}
            <div className='flex items-center justify-between gap-2 rounded-xl bg-muted/30'>
              <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                {isConnected ? (
                  <span className='font-medium text-foreground bg-background/60 px-2 py-1 rounded'>
                    {shortenAddress(watchedFromWallet || '')}
                  </span>
                ) : (
                  <span
                    className='underline cursor-pointer text-primary font-medium py-1 rounded hover:bg-primary/10 transition'
                    onClick={handleOpenConnectModal}
                  >
                    Please connect wallet
                  </span>
                )}
              </div>
            </div>
            {/* Chain Select (FROM) */}
            <FormField
              control={form.control}
              name="fromChain"
              render={() => (
                <FormItem>
                  <Select
                    onValueChange={(value: string) => {
                     if(!value) return
                      form.setValue(
                        'fromChain',
                        chainList?.find((chain) => chain.id === Number(value) ) || null
                      );
                      form.setValue('token', null);
                    }}
                    value={form.getValues('fromChain')?.id?.toString() || ''}
                  >
                    <FormControl>
                      <SelectTrigger className='w-full min-h-[44px] text-base font-medium bg-background/70 border-primary/30 hover:border-primary/50 focus:border-primary/60 rounded-lg'>
                        <SelectValue placeholder="Select chain" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {chainListLoading ? (
                        <div className='p-2 text-sm text-muted-foreground italic'>
                          <Skeleton className="w-24 h-5" />
                        </div>
                      ) : chainList?.length ? (
                        chainList
                          .filter((chain) => !form.getValues('toChain')?.id || chain.id !== form.getValues('toChain')?.id)
                          .map((chain) => (
                            <SelectItem key={chain.id} value={chain.id.toString()}>
                              <div className='flex items-center gap-2'>
                                <Image
                                  alt='Chain logo'
                                  fallbackSrc={"/images/default-coin-logo.jpg"}
                                  src={chain.logo || ''}
                                  className='w-5 h-5 rounded-xl'
                                />
                                <span>{chain.name}</span>
                              </div>
                            </SelectItem>
                          ))
                      ) : (
                        <div className='p-2 text-sm text-red-500'>
                          No chains available
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            {/* Amount, MAX, Select Token */}
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
                        onValueChange={(value) => value &&
                          form.setValue('token', tokenList?.find((token) => token.address === value) || null)
                        }
                        value={form.getValues('token')?.address || ''}
                      >
                        <FormControl>
                          <SelectTrigger className='h-[36px] me-2 text-base font-medium bg-background/70 border-primary/30 hover:border-primary/50 focus:border-primary/60 rounded-lg'>
                            <SelectValue placeholder='Token' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {!selectedFromChain ? (
                            <div className='p-2 text-sm text-muted-foreground italic'>
                              Please select a chain first
                            </div>
                          ) : tokenListLoading ? (
                            <div className='p-2 text-sm text-muted-foreground italic'>
                              <Skeleton className="w-20 h-5" />
                            </div>
                          ) : tokenList.length > 0 ? (
                            tokenList.map((token) => (
                              <SelectItem key={token.address} value={token.address}>
                                <div className='flex items-center gap-2'>
                                  <Image
                                    alt='Token logo'
                                    fallbackSrc={"/images/default-coin-logo.jpg"}
                                    src={token.logo}
                                    className='w-5 h-5 rounded-xl'
                                  />
                                  <span>{token.symbol}</span>
                                </div>
                              </SelectItem>
                            ))
                          ) : (
                            <div className='p-2 text-sm text-red-500'>
                              No tokens found
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className='flex justify-between items-center'>
              <div className='text-xs text-muted-foreground px-2'>
                Balance:{' '}
                {userSourceBalanceLoading ? (
                  <Skeleton className="inline-block w-16 h-4 align-middle" />
                ) : (
                  <span className='font-semibold text-foreground'>{userSourceBalance}</span>
                )}
              </div>
              <Button
                type='button'
                className={`
                      text-xs font-semibold
                      !px-3 !py-1 rounded-lg
                      transition
                      border border-primary/30
                      bg-primary/10
                      text-primary
                      hover:bg-primary/20 hover:border-primary/50
                      active:bg-primary/30
                      shadow
                    `}
                onClick={() => form.setValue('amount', userSourceBalance)}
                tabIndex={-1}
                disabled={isMaxDisabled}
              >
                {userSourceBalanceLoading ? <Skeleton className="w-10 h-4" /> : 'MAX'}
              </Button>
            </div>
          </div>

          {/* SWAP ICON */}
          <div className='flex justify-center my-3 absolute top-[250px] left-[200px]'>
            <button
              type='button'
              onClick={handleSwap}
              className='bg-background border border-primary/20 p-2 rounded-full shadow-md hover:bg-accent transition'
            >
              {isSwapped ? (
                <ArrowUpIcon className='w-6 h-6 text-primary' />
              ) : (
                <ArrowDownIcon className='w-6 h-6 text-primary' />
              )}
            </button>
          </div>


          {/* TO SECTION */}
          <div className='rounded-2xl border border-primary/20 bg-primary/5 p-4 shadow-sm space-y-5'>
            {/* Wallet info row (TO) */}
            <div
              className='flex items-center justify-between gap-2 mb-2 rounded-xl bg-muted/30'
              style={{ minHeight: 40 }}
            >
              <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                {isConnected ? (
                  <span className='font-medium text-foreground bg-background/60 px-2 py-1 rounded'>
                    {useCustomAddress
                      ? 'Custom Wallet'
                      : shortenAddress(watchedFromWallet || '')}
                  </span>
                ) : useCustomAddress ? (
                  <span className='cursor-pointer text-primary font-medium rounded hover:bg-primary/10 transition'>
                    Custom Wallet
                  </span>
                ) : (
                  <span
                    className='underline cursor-pointer text-primary font-medium rounded hover:bg-primary/10 transition'
                    onClick={handleOpenConnectModal}
                  >
                    Please connect wallet
                  </span>
                )}
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-xs text-muted-foreground'>
                  Custom address
                </span>
                <Switch
                  checked={useCustomAddress}
                  onCheckedChange={setUseCustomAddress}
                />
              </div>
            </div>
            {/* Chain Select (TO) */}
            <FormField
              control={form.control}
              name="toChain"
              render={() => (
                <FormItem>
                  <Select
                    onValueChange={(value: string) => {
                      if(!value) return
                      form.setValue(
                        'toChain',
                        chainList?.find((chain) => chain.id === Number(value))|| null
                      );
                    }}
                    value={form.getValues('toChain')?.id?.toString() || ''}
                  >
                    <FormControl>
                      <SelectTrigger className='w-full min-h-[44px] text-base font-medium bg-background/70 border-primary/30 hover:border-primary/50 focus:border-primary/60 rounded-lg'>
                        <SelectValue placeholder="Select chain" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {chainListLoading ? (
                        <div className='p-2 text-sm text-muted-foreground italic'>
                          <Skeleton className="w-24 h-5" />
                        </div>
                      ) : chainList?.length ? (
                        chainList
                          .filter((chain) => !form.getValues('fromChain')?.id || chain.id !== form.getValues('fromChain')?.id)
                          .map((chain) => (
                            <SelectItem key={chain.id} value={chain.id.toString()}>
                              <div className='flex items-center gap-2'>
                                <Image
                                  alt='Chain logo'
                                  fallbackSrc={"/images/default-coin-logo.jpg"}
                                  src={chain.logo || ''}
                                  className='w-5 h-5 rounded-xl'
                                />
                                <span>{chain.name}</span>
                              </div>
                            </SelectItem>
                          ))
                      ) : (
                        <div className='p-2 text-sm text-red-500'>
                          No chains available
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            {/* Amount (read only, no MAX, no select token) */}
            <div className='w-full'>
              <div className='relative flex items-center bg-background/70 border border-primary/30 rounded-xl px-2 py-1'>
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
                    <Skeleton className="inline-block w-16 h-4 align-middle" />
                  ) : (
                    <span className='font-semibold text-foreground'>{userDesBalance}</span>
                  )}
                </div>
              </div>
            </div>
            {/* To Wallet */}
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
                            setReceiverValid(validateReceiver(e.target.value));
                          }}
                          onChange={(e) => {
                            field.onChange(e);
                            setReceiverValid(validateReceiver(e.target.value));
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
           <TransactionAccordion />
          {/* SUBMIT */}
         <div className='pt-4'>
            {!isConnected ? (
              <button
                type='button'
                className='w-full bg-gradient-to-r from-primary via-cyan-400 to-purple-500 hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg text-white py-2 rounded-lg'
                onClick={handleOpenConnectModal}
              >
                Connect Wallet
              </button>
            ) : (
              <Button
                type='submit'
                className='w-full bg-gradient-to-r from-primary via-cyan-400 to-purple-500 hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg text-white py-2 rounded-lg'
                disabled={!isBridgeEnabled}
              >
                {form.formState.isSubmitting ? (
                  <span className='flex items-center justify-center gap-2'>
                    <svg
                      className='animate-spin h-4 w-4'
                      viewBox='0 0 24 24'
                      fill='none'
                    >
                      <circle
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='white'
                        strokeWidth='4'
                        className='opacity-25'
                      />
                      <path
                        fill='white'
                        className='opacity-75'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'
                      />
                    </svg>
                    Processing...
                  </span>
                ) : !isDestinationTokenValid ? (
                  "Destination token not available"
                ) : (
                  'Bridge'
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>
      <WalletConnectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}

export default BridgeForm;