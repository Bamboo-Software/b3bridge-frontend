import { useEffect, useState, useCallback } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAccount } from 'wagmi';
import { useTokenList } from '@/hooks/useTokenList';
import { useChainList } from '@/hooks/useChainList';
import { useUserTokenBalance } from '@/hooks/useUserBalance';
import { useDestinationToken } from '@/hooks/useDestinationToken';
import { Form } from '@/components/ui/form';
import type { Address } from 'viem';
import { bridgeFormSchema, type BridgeFormValues } from './BridgeFormValidation';
import BridgeDestinationSection from './BridgeDestinationSection';
import SwapButton from './SwapButton';
import SubmitButton from './SubmitButton';
import TransactionAccordion from './TransactionAccordion';
import { WalletConnectModal } from '@/pages/common/ConnectWalletModal';
import BridgeSourceSection from './BridgeSourceSection';




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
  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='max-w-md mx-auto relative flex flex-col gap-3'>
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
          <SwapButton isSwapped={isSwapped} handleSwap={handleSwap} />
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
          />
          <TransactionAccordion />
          <SubmitButton
            isConnected={isConnected}
            isBridgeEnabled={isBridgeEnabled}
            isDestinationTokenValid={isDestinationTokenValid}
            formState={form.formState}
            handleOpenConnectModal={handleOpenConnectModal}
          />
        </form>
      </Form>
      <WalletConnectModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

export default BridgeForm;