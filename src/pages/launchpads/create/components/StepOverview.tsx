/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { configLaunchPadsChains } from '@/utils/constants/chain';
import { getChainImage, isEvmChain } from '@/utils/blockchain/chain';
import { ChainTokenSource, ChainType } from '@/utils/enums/chain';
import dayjs from 'dayjs';
import type { LaunchpadFormValues } from './launchpadFormValidation';
import CopyIcon from '@/assets/icons/copy-icon.svg';
import { useState, useEffect } from 'react';
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
import type { ITokenOFT } from '@/utils/interfaces/token';
import { ZeroAddress } from 'ethers';
import { preSaleApi } from '@/services/pre-sale/presales';
import type { PresaleChainPaymentStatus } from '@/utils/interfaces/launchpad';
import { DeploymentStatusModal } from './DeploymentStatusModal';
import { getTokenData } from '@/utils/blockchain/token';

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

export function Step3Overview({
  modalState: { showDeploymentModal, setShowDeploymentModal },
  handleContinueCreate,
  handleSeeDetail,
}: {
  modalState: {
    showDeploymentModal: boolean;
    setShowDeploymentModal: (value: boolean) => void;
  };
  handleContinueCreate: () => void;
  handleSeeDetail: () => void;
}) {
  const { getValues, setValue, watch } = useFormContext<LaunchpadFormValues>();
  const values = getValues();
  const token = watch('token');
  const presaleId = watch('presaleId');

  const totalTokens = values.chainFields
    ? Object.values(values.chainFields).reduce(
        (sum, field) => sum + (parseFloat(field.numberOfTokens) || 0),
        0
      )
    : 0;
  const [copied, setCopied] = useState<{ [chainId: string]: boolean }>({});
  const [hasVerifiedPayment, setHasVerifiedPayment] = useState(false);

  // Verify payment hook
  const { useVerifyPaymentPreSalesQuery } = preSaleApi;
  const { data: paymentVerificationData, isLoading: isVerifyingPayment, refetch: refetchPaymentVerification } =
    useVerifyPaymentPreSalesQuery(
      { presaleId },
      {
        skip: !presaleId,
      }
    );

  // Check payment when deployment modal opens/closes
  useEffect(() => {
    if (presaleId) {
      setHasVerifiedPayment(false);
      refetchPaymentVerification();
    }
  }, [showDeploymentModal, presaleId]);

  // Update form with payment verification data when received
  useEffect(() => {
    if (paymentVerificationData && presaleId) {
      const paymentData = paymentVerificationData.data;
      if (paymentData) {
        paymentData.forEach((chainData: PresaleChainPaymentStatus) => {
          const chainId = chainData.chainId;

          // Update payment transactions status
          if (chainData.readyForDeployment) {
            setValue(
              `chainFields.${chainId}.transactions.native.payStatus`,
              TransactionStatus.SUCCESS
            );

            setValue(
              `chainFields.${chainId}.transactions.oft.payStatus`,
              TransactionStatus.SUCCESS
            );
          }
        });

        setHasVerifiedPayment(true);
      }
    }
  }, [paymentVerificationData, presaleId, setValue]);

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
    paymentTokenAddress: string, // Default payment token address
    nativeAmount: string,
    oftAmount: string, // Default OFT amount
    oftTokenAddress: string // Default OFT token address
  ) => {
    try {
      await switchChainAsync({ chainId });

      const field = values.chainFields?.[chainId];
      const nativeHash = field?.transactions?.native?.payHash;
      const oftHash = field?.transactions?.oft?.payHash;

      // Skip native payment if already successful
      if (!nativeHash) {
        // Step 1: Pay Native Currency
        setValue(
          `chainFields.${chainId}.transactions.native.payStatus`,
          'pending'
        );
        setValue(`chainFields.${chainId}.transactions.native.payError`, '');

        const nativeResult = await transfer({
          chainType,
          to: to as Address,
          amount: nativeAmount,
          chainId,
          ...(paymentTokenAddress &&
            paymentTokenAddress !== ZeroAddress && {
              tokenAddress: paymentTokenAddress as Address,
            }),
        });

        if (!nativeResult?.hash) {
          throw new Error(nativeResult?.error || 'Native payment failed');
        }

        // Update native payment success
        setValue(
          `chainFields.${chainId}.transactions.native.payStatus`,
          'success'
        );
        setValue(
          `chainFields.${chainId}.transactions.native.payHash`,
          nativeResult.hash
        );
        setValue(
          `chainFields.${chainId}.transactions.native.amount`,
          nativeAmount
        );
      }

      // Skip OFT payment if already successful
      if (!oftHash) {
        // Step 2: Pay OFT Token
        setValue(
          `chainFields.${chainId}.transactions.oft.payStatus`,
          'pending'
        );
        setValue(`chainFields.${chainId}.transactions.oft.payError`, '');
        const tokenData = await getTokenData(chainId, oftTokenAddress as Address)
        const oftResult = await transfer({
          chainType,
          to: to as Address,
          amount: oftAmount,
          chainId,
          tokenAddress: oftTokenAddress as Address, 
          decimals: tokenData?.decimals || 18,
        });

        if (!oftResult?.hash) {
          throw new Error(oftResult?.error || 'OFT payment failed');
        }

        // Update OFT payment success
        setValue(
          `chainFields.${chainId}.transactions.oft.payStatus`,
          'success'
        );
        setValue(
          `chainFields.${chainId}.transactions.oft.payHash`,
          oftResult.hash
        );
        setValue(`chainFields.${chainId}.transactions.oft.amount`, oftAmount);
        setValue(
          `chainFields.${chainId}.transactions.oft.tokenAddress`,
          oftTokenAddress
        );
      }

      // Re-verify payment after successful transaction
      if (presaleId) {
        setHasVerifiedPayment(false);
        setTimeout(() => {
          refetchPaymentVerification();
        }, 2000); // Wait 2 seconds for backend to process
      }
    } catch (error) {
      // Set failed status for current step
      const currentField = values.chainFields?.[chainId];
      const nativeStatus = currentField?.transactions?.native?.payStatus;
      const nativeHash = currentField?.transactions?.native?.payHash;

      if (!nativeHash || nativeStatus !== 'success') {
        // Native payment failed
        setValue(
          `chainFields.${chainId}.transactions.native.payStatus`,
          'failed'
        );
        setValue(
          `chainFields.${chainId}.transactions.native.payError`,
          'Failed to pay'
        );
      } else {
        // OFT payment failed
        setValue(`chainFields.${chainId}.transactions.oft.payStatus`, 'failed');
        setValue(
          `chainFields.${chainId}.transactions.oft.payError`,
          'Failed to pay'
        );
      }
    }
  };

  const getPaymentButtonText = (chainId: string) => {
    const field = values.chainFields?.[chainId];
    if (!field) return 'Pay';

    const nativeStatus = field.transactions?.native?.payStatus;
    const oftStatus = field.transactions?.oft?.payStatus;

    // If both payments are successful
    if (
      nativeStatus === TransactionStatus.SUCCESS &&
      oftStatus === TransactionStatus.SUCCESS
    ) {
      return 'Completed';
    }

    // If any payment is pending
    if (
      nativeStatus === TransactionStatus.PENDING ||
      oftStatus === TransactionStatus.PENDING
    ) {
      return 'Processing...';
    }

    return 'Pay';
  };

  // Show loading state while verifying payment
  if (presaleId && isVerifyingPayment && !hasVerifiedPayment) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='text-center'>
          <div className='w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2' />
          <p className='text-muted-foreground'>Verifying payment status...</p>
        </div>
      </div>
    );
  }

  return (
    <>
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
              <span className='font-semibold text-primary'>
                {token?.symbol}
              </span>
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
          <Accordion type='multiple' className='flex flex-col gap-3'>
            {values.chain?.map((chainId: string) => {
              const chain = configLaunchPadsChains.find(
                (c) => c.id.toString() === chainId
              );
              const field = values.chainFields?.[chainId];
              const oftToken = values.token?.tokens?.find(
                (t: ITokenOFT) => t.chainId?.toString() === chainId
              );
              if (!chain || !field) return null;

              return (
                <AccordionItem
                  key={chain.id}
                  value={chain.id.toString()}
                  className='cursor-pointer !border-2 border-[color:var(--gray-charcoal)] rounded-2xl'
                >
                  <div className='rounded-xl bg-[color:var(--gray-night)]'>
                    <AccordionTrigger
                      className={cn(
                        'p-6 cursor-pointer flex items-center gap-2 rounded-lg focus:outline-none bg-transparent hover:no-underline'
                      )}
                    >
                      <div className='flex !flex-1 gap-2 items-center'>
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
                                    handleCopy(
                                      chainId,
                                      oftToken.tokenAddress || ''
                                    )
                                  }
                                >
                                  <span>
                                    {shortenAddress(
                                      oftToken.tokenAddress || ''
                                    ) || '-'}
                                  </span>
                                  {copied[chainId] ? (
                                    <CheckIcon className='text-green-500 w-[20px] h-[20px]' />
                                  ) : (
                                    <Image src={CopyIcon} alt='copy' />
                                  )}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <span>{oftToken.tokenAddress}</span>
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
                            <span className='text-foreground'>
                              {item.label}
                            </span>
                            <span className='font-semibold text-primary'>
                              {item.value}
                            </span>
                          </div>
                        ))}
                        <div className='flex justify-between items-center py-3 border-t border-[color:var(--gray-charcoal)]'>
                          <div>
                            <div className='text-foreground'>
                              Total fees:
                              <span className='font-semibold text-primary ms-1'>
                                {formatNumber(field.totalFee || '0')}
                              </span>
                            </div>
                            {(field.transactions?.native?.payStatus ===
                              'failed' ||
                              field.transactions?.oft?.payStatus ===
                                'failed') && (
                              <div className='text-red-400 text-sm mt-1 ml-auto'>
                                {field.transactions?.native?.payError ||
                                  field.transactions?.oft?.payError ||
                                  'Payment failed'}
                              </div>
                            )}
                          </div>
                          {field.transactions?.native?.payStatus ===
                            'success' &&
                          field.transactions?.oft?.payStatus === 'success' ? (
                            <span className='ml-4 px-4 py-1 rounded-full bg-green-900/30 text-green-400 flex items-center gap-1 border border-green-700'>
                              Payment successful{' '}
                              <CheckIcon className='w-4 h-4' />
                            </span>
                          ) : (
                            <Button
                              type='button'
                              disabled={
                                field.transactions?.native?.payStatus ===
                                  'pending' ||
                                field.transactions?.oft?.payStatus === 'pending'
                              }
                              onClick={() =>
                                handlePay(
                                  chain.id,
                                  isEvmChain(chain.id)
                                    ? ChainType.EVM
                                    : ChainType.Solana,
                                  field.systemWalletAddress || '',
                                  field.paymentTokenAddress || '',
                                  field.totalFee || '0',
                                  field.numberOfTokens?.toString() || '0',
                                  oftToken.tokenAddress || ''
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
        disabled:opacity-50
        disabled:cursor-not-allowed
      '
                            >
                              {getPaymentButtonText(chainId)}
                            </Button>
                          )}
                        </div>
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
                  <span className='font-semibold text-right max-w-[60%] break-words'>
                    {isUrl ? (
                      <a
                        href={value as string}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='hover:text-blue-400 transition'
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
      <DeploymentStatusModal
        open={showDeploymentModal}
        onOpenChange={setShowDeploymentModal}
        presaleId={presaleId}
        onContinueCreate={handleContinueCreate}
        onSeeDetail={handleSeeDetail}
      />
    </>
  );
}