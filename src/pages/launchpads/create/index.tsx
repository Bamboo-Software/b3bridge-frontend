/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Step1Info } from './components/StepInfo';
import { Step2Social } from './components/StepSocial';
import { Step3Overview } from './components/StepOverview';
import type { ITokenOFT } from '@/utils/interfaces/token';
import { ChainType } from '@/utils/enums/chain';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  launchpadFormSchema,
  type LaunchpadFormValues,
} from './components/launchpadFormValidation';
import { toast } from 'sonner';
import { TransactionStatus } from '@/utils/enums/transaction';
import { preSaleTokenManagementApi } from '@/services/pre-sale/pre-sale-token';
import { appConfig } from '@/utils/constants/app';
import { ConfirmModal } from '@/pages/common/ConfirmModal';
import { preSaleApi } from '@/services/pre-sale/presales';
import { DeploymentStatusModal } from './components/DeploymentStatusModal';
import { useAccount } from 'wagmi';
import { isEvmChain } from '@/utils/blockchain/chain';
import { useNavigate } from 'react-router-dom';
import { routesPaths } from '@/utils/constants/routes';
import { useAuthToken } from '@/hooks/useAuthToken';
import { WalletConnectionRequired } from '@/pages/common/WalletConnectionRequired';

enum LaunchpadStep {
  Info = 1,
  Social = 2,
  Overview = 3,
}

export default function CreateLaunchpadPage() {
  const [step, setStep] = useState<LaunchpadStep>(LaunchpadStep.Info);
  const [processing, setProcessing] = useState(false);
  const [currentStepData, setCurrentStepData] = useState<any>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeploymentModal, setShowDeploymentModal] = useState(false);
  const { address, chainId } = useAccount();
  const [filterTokens, setFilterTokens] = useState({
    page: 1,
    q: '',
  });

  const { page, q } = filterTokens;
  const { useCreatePreSalesMutation } = preSaleApi;
  const [createPreSales] = useCreatePreSalesMutation();
  const methods = useForm<LaunchpadFormValues>({
    resolver: zodResolver(launchpadFormSchema),
    defaultValues: {
      token: '',
      chain: [],
      chainFields: {},
      startTime: undefined,
      endTime: undefined,
      logoUrl: '',
      website: '',
      facebook: '',
      x: '',
      github: '',
      telegram: '',
      instagram: '',
      discord: '',
      reddit: '',
      youtube: '',
      description: '',
    },
    mode: 'onChange',
  });

  const { trigger, getValues, watch } = methods;

  const chainFields = watch('chainFields');

  const handleInfoStepSuccess = async () => {
    setStep(LaunchpadStep.Social);
  };

  const handleSocialStepSuccess = async (
    validatedData: LaunchpadFormValues
  ) => {
    try {
      setProcessing(true);
      const chainConfigurations =
        validatedData.chain?.map((chainKey: string) => {
          const oftToken = validatedData.token?.tokens?.find(
            (t: ITokenOFT) => t.chainId?.toString() === chainKey?.toString()
          );
          const chain = validatedData.chainFields?.[chainKey];
          return {
            oftTokenId: oftToken?.id || '',
            chainType: 'Evm',
            chainId: chainKey,
            presaleRate: chain?.presaleRate || '0',
            listingRate: '0.001',
            softCap: chain?.softcap || '0',
            hardCap: chain?.hardcap || '0',
            minContribution: chain?.minBuy || '0',
            maxContribution: chain?.maxBuy || '0',
            totalTokens: chain?.numberOfTokens || '0',
            userWalletAddress: address,
          };
        }) || [];

      const presaleData = {
        fundRecipientAddress: address,
        fundRecipientChainId: chainId,
        fundRecipientChainType: isEvmChain(chainId || '')
          ? ChainType.EVM
          : ChainType.Solana,
        title: validatedData.token?.name || '',
        description: validatedData.description || '',
        bannerUrl: validatedData.logoUrl || '',
        startTime: validatedData.startTime?.toISOString() || undefined,
        endTime: validatedData.endTime?.toISOString() || undefined,
        whitelistEnabled: false,
        publicStartTime: validatedData.startTime?.toISOString() || undefined,
        chainConfigurations,
        website: validatedData.website,
        facebook: validatedData.facebook,
        x: validatedData.x,
        github: validatedData.github,
        telegram: validatedData.telegram,
        instagram: validatedData.instagram,
        discord: validatedData.discord,
        reddit: validatedData.reddit,
        youtube: validatedData.youtube,
      };

      const result = (await createPreSales(presaleData)) as any;
      if (result.error) {
        const error = result.error;
        // Lấy message đầu tiên từ mảng message trả về từ API
        const firstError =
          Array.isArray(error?.data?.message) && error.data.message.length > 0
            ? error.data.message[0]?.error || error.data.message[0]
            : 'Something went wrong';
        toast.error(firstError);
        setProcessing(false);
        return;
      } else {
        const draftData = result.data.data;
        const id = draftData.id;
        const chainDeployments = draftData.presaleChains || [];

        // Set lại chainFields từ chainDeployments
        const chainFields = methods.getValues('chainFields') || {};
        chainDeployments.forEach((deployment: any) => {
          const chainId = deployment.chainId?.toString();
          if (chainId) {
            chainFields[chainId] = {
              ...chainFields[chainId],
              totalFee: deployment.deployFee,
              paymentTokenAddress: deployment.paymentTokenAddress,
              paymentTokenSymbol: deployment.paymentTokenSymbol,
              systemWalletAddress: deployment.systemWalletAddress,
            };
          }
        });
        methods.setValue('chainFields', chainFields);
        methods.setValue('presaleId', id);
      }

      toast.success('Social information saved successfully!');
      setStep(LaunchpadStep.Overview);
    } catch (error) {
      console.error('Social step error:', error);
      toast.error('Failed to save social information');
    } finally {
      setProcessing(false);
    }
  };

  const presaleId = watch('presaleId');

  const handleNext = async () => {
    let fields: string[] = [];

    if (step === LaunchpadStep.Info) {
      fields = ['token', 'startTime', 'endTime', 'chain'];
      const selectedChains = getValues('chain') || [];
      const currentChainFields = getValues('chainFields') || {};

      selectedChains.forEach((chainKey: string) => {
        if (!currentChainFields[chainKey]) {
          methods.setValue(`chainFields.${chainKey}`, {
            presaleRate: '',
            numberOfTokens: '',
            softcap: '',
            hardcap: '',
            minBuy: '',
            maxBuy: '',
          });
        }

        // Thêm fields để validate
        fields.push(
          `chainFields.${chainKey}.presaleRate`,
          `chainFields.${chainKey}.numberOfTokens`,
          `chainFields.${chainKey}.softcap`,
          `chainFields.${chainKey}.hardcap`,
          `chainFields.${chainKey}.minBuy`,
          `chainFields.${chainKey}.maxBuy`
        );
      });
    } else if (step === LaunchpadStep.Social) {
      fields = ['logoUrl', 'website', 'description'];
    }

    const valid = await trigger(fields as any);

    if (valid) {
      const validatedData = getValues();

      if (step === LaunchpadStep.Info) {
        await handleInfoStepSuccess();
      } else if (step === LaunchpadStep.Social) {
        if (!presaleId) {
          setCurrentStepData(validatedData);
          setShowConfirmModal(true);
        } else {
          setStep(LaunchpadStep.Overview);
        }
      } else if (step === LaunchpadStep.Overview) {
        setCurrentStepData(validatedData);
        setShowDeploymentModal(true);
      }
    } else {
      const errors = methods.formState.errors;
      let firstErrorMsg = 'Please fill all the form!';
      const findFirstError = (obj: any): string | null => {
        for (const key in obj) {
          if (obj[key]?.message) return obj[key].message;
          if (typeof obj[key] === 'object') {
            const msg = findFirstError(obj[key]);
            if (msg) return msg;
          }
        }
        return null;
      };
      const msg = findFirstError(errors);
      if (msg) firstErrorMsg = msg;
      toast.error(firstErrorMsg);
    }
  };

  const handleConfirmAction = async () => {
    if (!currentStepData) return;
    if (step === LaunchpadStep.Social) {
      await handleSocialStepSuccess(currentStepData);
    }
    setShowConfirmModal(false);
    setCurrentStepData(null);
  };

  const handleCancelAction = () => {
    setShowConfirmModal(false);
    setCurrentStepData(null);
  };

  const getConfirmModalContent = () => {
    if (step === LaunchpadStep.Social) {
      return {
        title: 'Confirm Social Information',
        description:
          'Are you sure you want to save this social information? This data will be used for your launchpad.',
        confirmText: 'Yes, Save & Continue',
        type: 'info' as const,
      };
    } else if (step === LaunchpadStep.Overview) {
      return {
        title: 'Confirm Launchpad Creation',
        description:
          'Are you sure you want to create this launchpad? Once created, some information cannot be modified.',
        confirmText: 'Yes, Create Launchpad',
        type: 'warning' as const,
      };
    }
    return {
      title: '',
      description: '',
      confirmText: '',
      type: 'info' as const,
    };
  };

  const chain = watch('chain');

  const allPaid = chain?.every((chainId: string) => {
    const f = chainFields?.[chainId];
    const nativeStatus = f?.transactions?.native?.payStatus;
    const oftStatus = f?.transactions?.oft?.payStatus;
    const nativeHash = f?.transactions?.native?.payHash;
    const oftHash = f?.transactions?.oft?.payHash;

    return (
      nativeStatus === TransactionStatus.SUCCESS &&
      oftStatus === TransactionStatus.SUCCESS &&
      !!nativeHash &&
      !!oftHash
    );
  });

  const { useGetMyTokenGroupsQuery } = preSaleTokenManagementApi;
  const {
    data: tokenRes,
    isLoading: isLoadingMyTokens,
    error,
    refetch: refetchMyTokens,
  } = useGetMyTokenGroupsQuery({
    page,
    limit: appConfig.defaultLimit,
    q,
  });

  const confirmModalContent = getConfirmModalContent();
  const navigate = useNavigate();

  const handleContinueCreate = () => {
    setStep(LaunchpadStep.Info);

    methods.reset();

    setCurrentStepData(null);
    setProcessing(false);

    setShowDeploymentModal(false);

    toast.success('Ready to create a new launchpad!');
  };

  const handleSeeDetail = () => {
    if (presaleId) {
      navigate(routesPaths.LAUNCHPAD_DETAIL(presaleId));
    } else {
      toast.error('Presale ID not found');
    }
  };
  // Refetch all data
  const refetchAll = useCallback(() => {
    refetchMyTokens();
  }, [refetchMyTokens]);
  const { isConnected } = useAccount();
  const { token } = useAuthToken();
  // Auto-refetch when wallet connects
  useEffect(() => {
    if (token && isConnected) {
      const timer = setTimeout(() => {
        refetchAll();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [token, isConnected, refetchAll]);

  // Check wallet connection first
  if (!isConnected || !token) {
    return (
      <div className='container mx-auto px-6 py-8'>
        <WalletConnectionRequired
          title='Connect Wallet to Create Launchpad'
          description='Please connect your wallet to create launchpad.'
        />
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form className='max-w-2xl mx-auto py-10' autoComplete='off'>
        <div className='rounded-2xl shadow-lg p-6 border border-[color:var(--gray-charcoal)]'>
          <h2 className='text-2xl font-bold mb-6 text-foreground'>
            Create your Launchpad
          </h2>
          <p className='mb-6 text-foreground'>
            {step === LaunchpadStep.Info &&
              'Enter the launchpad information that you want to raise, that should be enter all detail about your presale'}
            {step === LaunchpadStep.Social && 'Let people know Who you are'}
            {step === LaunchpadStep.Overview &&
              'Review all information before submitting your launchpad'}
          </p>

          {step === LaunchpadStep.Info && (
            <Step1Info
              tokenState={{
                tokenData: tokenRes?.data,
                isLoadingMyTokens,
                error,
                filterTokens,
                setFilterTokens,
              }}
            />
          )}
          {step === LaunchpadStep.Social && <Step2Social />}
          {step === LaunchpadStep.Overview && <Step3Overview />}

          {/* Actions */}
          <div className='flex gap-2 mt-5'>
            {step > LaunchpadStep.Info && (
              <div
                className='flex-1 bg-[linear-gradient(45deg,_var(--blue-primary),_var(--primary))]
        border-none
        rounded-lg
        cursor-pointer
        hover:opacity-90
        hover:shadow-[0_0px_10px_0_var(--blue-primary)] text-foreground p-[1px] '
                onClick={() => setStep(step - 1)}
              >
                <div className='w-full h-full text-center bg-background rounded-lg flex items-center justify-around'>
                  <p className='leading-0'>Back</p>
                </div>
              </div>
            )}
            {step < LaunchpadStep.Overview && (
              <Button
                className='flex-1 bg-[linear-gradient(45deg,_var(--blue-primary),_var(--primary))]
        shadow-[0_0px_10px_0_var(--blue-primary)]
        border-none
        rounded-lg
        cursor-pointer
        hover:opacity-90
        hover:shadow-[0_0px_16px_0_var(--blue-primary)] text-foreground'
                type='button'
                onClick={handleNext}
                disabled={processing}
              >
                {processing ? (
                  <div className='flex items-center gap-2'>
                    <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                    Processing...
                  </div>
                ) : (
                  'Next'
                )}
              </Button>
            )}
            {step === LaunchpadStep.Overview &&
              (!allPaid ? (
                <Button
                  variant='outline'
                  className='flex-1  text-foreground rounded-lg text-lg cursor-not-allowed'
                  type='button'
                  disabled
                >
                  Submit
                </Button>
              ) : (
                <Button
                  className='flex-1 bg-[linear-gradient(45deg,_var(--blue-primary),_var(--primary))]
        shadow-[0_0px_10px_0_var(--blue-primary)]
        border-none
        rounded-lg
        cursor-pointer
        hover:opacity-90
        hover:shadow-[0_0px_16px_0_var(--blue-primary)] text-foreground'
                  type='button'
                  onClick={handleNext}
                  disabled={processing}
                >
                  {processing ? (
                    <div className='flex items-center gap-2'>
                      <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                      Creating...
                    </div>
                  ) : (
                    'Submit'
                  )}
                </Button>
              ))}
          </div>
        </div>

        {/* Confirm Modal */}
        <ConfirmModal
          open={showConfirmModal}
          onOpenChange={setShowConfirmModal}
          title={confirmModalContent.title}
          description={confirmModalContent.description}
          confirmText={confirmModalContent.confirmText}
          cancelText='Cancel'
          type={confirmModalContent.type}
          loading={processing}
          onConfirm={handleConfirmAction}
          onCancel={handleCancelAction}
        />

        <DeploymentStatusModal
          open={showDeploymentModal}
          onOpenChange={setShowDeploymentModal}
          presaleId={presaleId}
          onContinueCreate={handleContinueCreate}
          onSeeDetail={handleSeeDetail}
        />
      </form>
    </FormProvider>
  );
}
