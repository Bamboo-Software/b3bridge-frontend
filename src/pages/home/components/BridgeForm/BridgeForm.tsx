/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAccount, useSwitchChain } from 'wagmi';
import { Form } from '@/components/ui/form';
import { WalletConnectModal } from '@/pages/common/ConnectWalletModal';
import { useTokenList } from '@/hooks/useTokenList';
import { useChainList } from '@/hooks/useChainList';
import { useUserTokenBalance } from '@/hooks/useUserBalance';
import { useDestinationToken } from '@/hooks/useDestinationToken';
import type { Address } from 'viem';
import {
  bridgeFormSchema,
  type BridgeFormValues,
} from './BridgeFormValidation';
import BridgeDestinationSection from './BridgeDestinationSection';
import SwapButton from './SwapButton';
import SubmitButton from './SubmitButton';
import TransactionAccordion from './TransactionAccordion';
import { useGetQuotes } from '@/hooks/useGetQuotes';
import { QuoteModal } from './QuoteModal';
import type { IQuoteFee } from '@/utils/interfaces/quote';
import { isSameQuote } from '@/utils/blockchain/quote';
import { useDebouncedValue } from '@/hooks/useDebounceValue';
import { ChainTokenSource } from '@/utils/enums/chain';
import { useBridgeTokens } from '@/hooks/bridge/useBridgeTokens';
import type { ITokenInfo } from '@/utils/interfaces/token';
import BridgeSourceSection from './BridgeSourceSection';
import { formatTokenAmount } from '@/utils';
import { toast } from 'sonner';

const validateReceiver = (value: string) =>
  value ? /^0x[a-fA-F0-9]{40}$/.test(value) : null;

function BridgeForm() {
  // --- State ---
  const { address, isConnected } = useAccount();
  const [useCustomAddress, setUseCustomAddress] = useState(false);
  const [receiverValid, setReceiverValid] = useState<boolean | null>(null);
  const [connectWalletModalOpen, setConnectWalletModalOpen] = useState(false);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [toAmount, setToAmount] = useState('');
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
      quote: null,
    },
  });

  // --- Chain & Token List ---
  const { data: chainList, loading: chainListLoading } = useChainList();
  const selectedFromChain = form.watch('fromChain');
  const selectedToChain = form.watch('toChain');
  const { data: tokenList, loading: tokenListLoading } =
    useTokenList(selectedFromChain);
  // --- Token & Wallet Watchers ---
  const watchedToken = form.watch('token');
  const watchedTokenAddress = watchedToken?.address as Address;
  const watchedFromWallet = form.watch('fromWalletAddress');
  const watchedToWallet = form.watch('toWalletAddress');
  const watchedAmount = form.watch('amount');
  const debouncedAmount = useDebouncedValue(watchedAmount, 400);
  // --- Destination Token ---
  const destinationToken = useDestinationToken(
    watchedToken,
    selectedFromChain,
    selectedToChain
  );
  // --- Balances ---
  const { balance: userSourceBalance, loading: userSourceBalanceLoading } =
    useUserTokenBalance(address, watchedTokenAddress, selectedFromChain?.id);
  const { balance: userDesBalance, loading: userDesBalanceLoading } =
    useUserTokenBalance(
      watchedToWallet as Address,
      destinationToken?.address,
      selectedToChain?.id
    );

  // --- Effects ---
  useEffect(() => {
    if (isConnected && address) {
      form.setValue('fromWalletAddress', address, { shouldValidate: true });
      if (!useCustomAddress) {
        form.setValue('toWalletAddress', address, { shouldValidate: true });
      } else {
        form.setValue('toWalletAddress', '', { shouldValidate: true });
      }
    }
  }, [isConnected, address, form, useCustomAddress]);

  useEffect(() => {
    if (!useCustomAddress) {
      form.setValue('toWalletAddress', form.getValues('fromWalletAddress'), {
        shouldValidate: true,
      });
    } else {
      form.setValue('toWalletAddress', '', { shouldValidate: true });
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
    if (connectWalletModalOpen && isConnected) {
      setConnectWalletModalOpen(false);
    }
  }, [isConnected, connectWalletModalOpen]);

  // ----- Quotes----------
  const watchedQuote = form.watch('quote');
  const { quotes, loading: quotesLoading } = useGetQuotes({
    srcToken: watchedToken,
    desToken: destinationToken,
    srcAddress: watchedFromWallet,
    destAddress: watchedToWallet,
    srcChain: selectedFromChain,
    destChain: selectedToChain,
    srcAmount: debouncedAmount,
    destAmount: debouncedAmount,
  });

  useEffect(() => {
    const hasQuotes = quotes && quotes.length > 0;

    if (hasQuotes) {
      const found = quotes.some((q) => isSameQuote(q, watchedQuote));
      if (!watchedQuote || !found) {
        form.setValue('quote', quotes[0], { shouldValidate: true });
      }
    } else if (watchedQuote) {
      form.setValue('quote', null, { shouldValidate: true });
    }
  }, [JSON.stringify(quotes), watchedQuote]);

  useEffect(() => {
    if (watchedQuote && watchedQuote.dstAmountMin) {
      setToAmount(watchedQuote.dstAmountMin);
    } else {
      setToAmount('');
    }
  }, [watchedQuote]);

  const totalFeeStargateUsd = useMemo(() => {
  if (!watchedQuote || !watchedQuote.fees || watchedQuote.fees.length === 0) return 0;

  return watchedQuote.fees.reduce((total: number, fee: IQuoteFee) => {
    const feeTokenAddress = fee.token?.toLowerCase();
    const token =
      tokenList.find((t) => t.address?.toLowerCase() === feeTokenAddress) ||
      (destinationToken?.address?.toLowerCase() === feeTokenAddress
        ? destinationToken
        : undefined);

    if (!token || !token.priceUsd) return total;

    const decimals = token.decimals || 18;
    const amount = Number(fee.amount) / 10 ** decimals;
    const feeUsd = amount * Number(token.priceUsd);

    return total + feeUsd;
  }, 0);
}, [watchedQuote, tokenList, destinationToken]);

  const isTransactionInfoLoading = useMemo(
    () => quotesLoading,
    [quotesLoading]
  );

  // --- Derived States ---
  const isMaxDisabled =
    userSourceBalanceLoading ||
    !userSourceBalance ||
    !Number(userSourceBalance);

  const isDestinationTokenValid = !!destinationToken;
  const isFullField =
    !Object.keys(form.formState.errors).length &&
    form.formState.isValid &&
    !form.formState.isSubmitting &&
    !!selectedFromChain &&
    !!selectedToChain &&
    !!watchedToken &&
    !!watchedAmount &&
    !(selectedFromChain?.source === ChainTokenSource.Stargate && !watchedQuote);
    
  const isSufficientBalance =
    parseFloat(userSourceBalance) >= parseFloat(watchedAmount);
  const isBridgeEnabled =
    isConnected &&
    isFullField &&
    isSufficientBalance &&
    !(selectedFromChain?.source === ChainTokenSource.Stargate && !watchedQuote);

  // --- Handlers ---
  const bridge = useBridgeTokens({
    amount: watchedAmount,
    fromChain: selectedFromChain,
    fromToken: watchedToken,
    receiver: watchedToWallet,
    toChain: selectedToChain,
    toToken: destinationToken as ITokenInfo,
    quote: watchedQuote,
  });
  const handleOpenConnectModal = useCallback(
    () => setConnectWalletModalOpen(true),
    []
  );
  const handleSwap = () => {
    const fromChain = form.getValues('fromChain');
    const toChain = form.getValues('toChain');
    const fromWallet = form.getValues('fromWalletAddress');
    const toWallet = form.getValues('toWalletAddress');
    form.setValue('fromChain', toChain, { shouldValidate: true });
    form.setValue('toChain', fromChain, { shouldValidate: true });
    form.setValue('token', destinationToken, { shouldValidate: true });
    form.setValue('fromWalletAddress', toWallet, { shouldValidate: true });
    form.setValue('toWalletAddress', fromWallet, { shouldValidate: true });
  };

  const { switchChainAsync } = useSwitchChain();

  const onSubmit: SubmitHandler<BridgeFormValues> = async () => {
    try{
      if (selectedFromChain?.id) {
        await switchChainAsync({ chainId: selectedFromChain?.id });
      }
      await bridge();
    }catch(e:any){
       toast.error("Something went wrong. Please try again.", {
        duration: Infinity,
        closeButton: true,
      });
    }
  };

  // --- Render ---
  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='max-w-md mx-auto relative flex flex-col gap-3'
        >
          <BridgeSourceSection
            form={form}
            isConnected={isConnected}
            chainList={chainList ?? []}
            chainListLoading={chainListLoading}
            tokenList={tokenList}
            tokenListLoading={tokenListLoading}
            userSourceBalance={userSourceBalance}
            userSourceBalanceLoading={userSourceBalanceLoading}
            isMaxDisabled={isMaxDisabled}
            watchedFromWallet={watchedFromWallet}
            handleOpenConnectModal={handleOpenConnectModal}
          />
          <SwapButton  handleSwap={handleSwap} />
          <BridgeDestinationSection
            form={form}
            isConnected={isConnected}
            chainList={chainList ?? []}
            chainListLoading={chainListLoading}
            useCustomAddress={useCustomAddress}
            setUseCustomAddress={setUseCustomAddress}
            receiverValid={receiverValid}
            userDesBalance={userDesBalance}
            userDesBalanceLoading={userDesBalanceLoading}
            watchedFromWallet={watchedFromWallet}
            handleOpenConnectModal={handleOpenConnectModal}
            toAmount={toAmount}
            watchedAmount={watchedAmount}
            destinationToken={destinationToken}
            selectedFromChain={selectedFromChain}
          />
          <TransactionAccordion
            setQuoteModalOpen={setQuoteModalOpen}
            receiveAmount={
              formatTokenAmount(
                watchedQuote?.dstAmountMin,
                destinationToken
              )?.toString() || ''
            }
            estTime={watchedQuote?.duration?.estimated}
            totalFeeStargateUsd={totalFeeStargateUsd}
            route={watchedQuote?.route}
            enable={isBridgeEnabled}
            isTransactionInfoLoading={isTransactionInfoLoading}
            destinationToken={destinationToken}
          />
          <SubmitButton
            isFullField={isFullField}
            isSufficientBalance={isSufficientBalance}
            isConnected={isConnected}
            isBridgeEnabled={isBridgeEnabled}
            isDestinationTokenValid={isDestinationTokenValid}
            formState={form.formState}
            handleOpenConnectModal={handleOpenConnectModal}
          />
        </form>
      </Form>
      <WalletConnectModal
        open={connectWalletModalOpen}
        onClose={() => setConnectWalletModalOpen(false)}
      />
      <QuoteModal
        onSelect={(quote) => {
          form.setValue('quote', quote, { shouldValidate: true });
          setQuoteModalOpen(false);
        }}
        open={quoteModalOpen}
        quotes={quotes}
        selectedQuote={watchedQuote}
        tokenList={tokenList}
        destinationToken={destinationToken}
        onClose={() => setQuoteModalOpen(false)}
      />
    </>
  );
}

export default BridgeForm;
