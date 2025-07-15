/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { TransactionStatus } from '@/utils/enums/transaction';
import { preSaleTokenManagementApi } from '@/services/pre-sale/pre-sale-token';
import { appConfig } from '@/utils/constants/app';
import { ConfirmModal } from '@/pages/common/ConfirmModal';
import { preSaleApi } from '@/services/pre-sale/presales';
import { useAccount } from 'wagmi';
import { routesPaths } from '@/utils/constants/routes';
import { useAuthToken } from '@/hooks/useAuthToken';
import { WalletConnectionRequired } from '@/pages/common/WalletConnectionRequired';
import {
  launchpadFormSchema,
  type LaunchpadFormValues,
} from '../create/components/launchpadFormValidation';
import { Step1Info } from '../create/components/StepInfo';
import { Step2Social } from '../create/components/StepSocial';
import { Step3Overview } from '../create/components/StepOverview';
import { RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { PresaleStatus } from '@/utils/enums/presale';
import type { PresaleSupportedChain } from '@/utils/interfaces/launchpad';

enum LaunchpadStep {
  Info = 1,
  Social = 2,
  Overview = 3,
}

export default function EditLaunchpadPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [step, setStep] = useState<LaunchpadStep>(LaunchpadStep.Info);
  const [processing, setProcessing] = useState(false);
  const [currentStepData, setCurrentStepData] = useState<any>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeploymentModal, setShowDeploymentModal] = useState(false);
  const [filterTokens, setFilterTokens] = useState({
    page: 1,
    q: '',
  });

  const { page, q } = filterTokens;

  // API hooks
  const { useGetDetailPreSalesQuery, useUpdatePreSalesMutation } = preSaleApi;
  const [updatePresale] = useUpdatePreSalesMutation();

  // Get presale detail
  const {
    data: presaleDetailResponse,
    isLoading: isLoadingDetail,
    error: detailError,
    refetch: refetchDetail,
  } = useGetDetailPreSalesQuery({ presaleId: id }, { skip: !id });

  const presaleDetail = presaleDetailResponse?.data;

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
      presaleId: '', // Add presaleId to form
    },
    mode: 'onChange',
  });

  const { trigger, getValues, watch, setValue } = methods;

  const presaleId = watch('presaleId'); // This will trigger field disable logic
  const chainFields = watch('chainFields');

  // Load presale data into form when detail is fetched
  useEffect(() => {
    if (
      presaleDetail &&
      presaleDetail.presaleChains &&
      presaleDetail.presaleChains.length > 0
    ) {
      // Get first presale chain to extract token info
      const firstChain = presaleDetail.presaleChains[0];
      const oftToken = firstChain.oftToken;

      // Create token object from presale detail
      const tokenData = {
        id: presaleDetail.id,
        name: presaleDetail.title || oftToken?.name || '',
        symbol: oftToken?.symbol || '',
        description: presaleDetail.description || '',
        bannerUrl: presaleDetail.bannerUrl || '',
        totalSupply: oftToken?.totalSupply || '0',
        decimals: oftToken?.decimals || 18,
        // Create tokens array for all chains
        tokens: presaleDetail.presaleChains.map(
          (chain: PresaleSupportedChain) => ({
            id: chain.oftToken?.id || chain.id,
            chainId: chain.chainId,
            name: presaleDetail.title || chain.oftToken?.name || '',
            symbol: chain.oftToken?.symbol || '',
            totalSupply: chain.oftToken?.totalSupply || '0',
            decimals: chain.oftToken?.decimals || 18,
            contractAddress: chain.oftToken?.contractAddress || '',
            tokenAddress: chain.oftToken?.tokenAddress || '',
          })
        ),
      };

      // Set form values
      setValue('presaleId', presaleDetail.id); // Set presaleId first to trigger edit mode
      setValue('token', tokenData);
      setValue(
        'chain',
        presaleDetail.presaleChains.map(
          (chain: PresaleSupportedChain) => chain.chainId
        )
      );
      setValue(
        'startTime',
        presaleDetail.startTime ? new Date(presaleDetail.startTime) : null
      );
      setValue(
        'endTime',
        presaleDetail.endTime ? new Date(presaleDetail.endTime) : null
      );
      setValue('logoUrl', presaleDetail.bannerUrl || '');
      setValue('description', presaleDetail.description || '');

      // Social links
      setValue('website', presaleDetail.websiteURL || '');
      setValue('facebook', presaleDetail.facebookURL || '');
      setValue('x', presaleDetail.xURL || '');
      setValue('github', presaleDetail.githubURL || '');
      setValue('telegram', presaleDetail.telegramURL || '');
      setValue('instagram', presaleDetail.instagramURL || '');
      setValue('discord', presaleDetail.discordURL || '');
      setValue('reddit', presaleDetail.redditURL || '');
      setValue('youtube', presaleDetail.youtubeURL || '');

      // Chain fields
      const chainFieldsData: any = {};
      presaleDetail.presaleChains.forEach((chain: any) => {
        chainFieldsData[chain.chainId] = {
          // Existing fields from form (if any)
          ...(getValues('chainFields')?.[chain.chainId] || {}),

          // Update/override with new data from presale detail
          presaleRate: parseFloat(chain.presaleRate) || '0',
          numberOfTokens: parseFloat(chain.totalTokens) || '0',
          softcap: parseFloat(chain.softCap) || '0',
          hardcap: parseFloat(chain.hardCap) || '0',
          minBuy: parseFloat(chain.minContribution) || '0',
          maxBuy: parseFloat(chain.maxContribution) || '0',
          totalFee: chain.deployFee || '0',
          paymentTokenAddress: chain.paymentTokenAddress || '',
          paymentTokenSymbol: chain.paymentTokenSymbol || 'ETH',
          systemWalletAddress: chain.systemWalletAddress || '',
        };
      });
      setValue('chainFields', chainFieldsData);
    }
  }, [presaleDetail, setValue, getValues]);

  // Check permissions
  const { token: authToken } = useAuthToken();
  const isCreator = presaleDetail?.userId && authToken;
  const canEdit = presaleDetail?.status === PresaleStatus.DRAFT;

  const handleInfoStepSuccess = async () => {
    setStep(LaunchpadStep.Social);
  };

  const handleSocialStepSuccess = async (
    validatedData: LaunchpadFormValues
  ) => {
    try {
      setProcessing(true);

      // Only update editable fields for edit mode
      const updateData = {
        presaleId: presaleDetail.id,
        title: validatedData.token?.name || presaleDetail.title,
        description: validatedData.description || presaleDetail.description,
        bannerUrl: validatedData.logoUrl || presaleDetail.bannerUrl,
        websiteURL: validatedData.website,
        facebookURL: validatedData.facebook,
        xURL: validatedData.x,
        githubURL: validatedData.github,
        telegramURL: validatedData.telegram,
        instagramURL: validatedData.instagram,
        discordURL: validatedData.discord,
        redditURL: validatedData.reddit,
        youtubeURL: validatedData.youtube,
      };

      await updatePresale(updateData).unwrap();

      toast.success('Presale updated successfully!');
      setStep(LaunchpadStep.Overview);
    } catch (error: any) {
      console.error('Update error:', error);
      const errorMessage =
        error?.data?.message?.[0]?.error ||
        error?.data?.message?.[0] ||
        'Failed to update presale';
      toast.error(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const handleNext = async () => {
    let fields: string[] = [];

    if (step === LaunchpadStep.Info) {
      // Edit mode - only validate editable fields
      fields = ['description', 'logoUrl'];
    } else if (step === LaunchpadStep.Social) {
      fields = ['website']; // Only validate required fields
    }

    const valid = await trigger(fields as any);

    if (valid) {
      const validatedData = getValues();

      if (step === LaunchpadStep.Info) {
        await handleInfoStepSuccess();
      } else if (step === LaunchpadStep.Social) {
        // Edit mode - update directly
        setCurrentStepData(validatedData);
        setShowConfirmModal(true);
      } else if (step === LaunchpadStep.Overview) {
        // Open deployment modal for deploy
        setCurrentStepData(validatedData);
        setShowDeploymentModal(true);
      }
    } else {
      const errors = methods.formState.errors;
      let firstErrorMsg = 'Please fill all required fields!';
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
    return {
      title: 'Confirm Update',
      description:
        'Are you sure you want to update this presale information?',
      confirmText: 'Yes, Update',
      type: 'info' as const,
    };
  };

  const chain = watch('chain');

  // Check if all payments are completed
  const allPaid = chain?.every((chainId: string) => {
    const f = chainFields?.[chainId];
    const nativeStatus = f?.transactions?.native?.payStatus;
    const oftStatus = f?.transactions?.oft?.payStatus;

    return (
      nativeStatus === TransactionStatus.SUCCESS &&
      oftStatus === TransactionStatus.SUCCESS
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


  const handleSeeDetail = () => {
    if (presaleId) {
      navigate(routesPaths.LAUNCHPAD_DETAIL(presaleId));
    } else {
      toast.error('Presale ID not found');
    }
  };

  const handleContinueCreate = () => {
    navigate(routesPaths.CREATE_LAUNCHPAD);
  }

  // Refetch all data
  const refetchAll = useCallback(() => {
    refetchMyTokens();
    if (id) {
      refetchDetail();
    }
  }, [refetchMyTokens, refetchDetail, id]);

  const { isConnected } = useAccount();
  const { token } = useAuthToken();

  // Auto-refetch when wallet connects
  useEffect(() => {
    if (token) {
      const timer = setTimeout(() => {
        refetchAll();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [token, refetchAll]);

  // Check wallet connection first
  if (!isConnected || !token) {
    return (
      <div className='container mx-auto px-6 py-8'>
        <WalletConnectionRequired
          title='Connect Wallet to Edit Launchpad'
          description='Please connect your wallet to edit this launchpad.'
        />
      </div>
    );
  }

  // Loading state for edit mode
  if (id && isLoadingDetail) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <RefreshCw className='w-8 h-8 animate-spin mx-auto mb-4' />
          <p className='text-muted-foreground'>Loading presale details...</p>
        </div>
      </div>
    );
  }

  // Error state for edit mode
  if (id && (detailError || !presaleDetail)) {
    return (
      <div className='container mx-auto px-6 py-8'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold mb-4'>Presale Not Found</h1>
          <p className='text-muted-foreground mb-6'>
            The presale you're trying to edit doesn't exist.
          </p>
          <Button onClick={() => navigate('/launchpads')} variant='outline'>
            Back to Launchpads
          </Button>
        </div>
      </div>
    );
  }

  // Check permissions for edit mode
  if (presaleId && !isCreator) {
    return (
      <div className='container mx-auto px-6 py-8'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold mb-4'>Access Denied</h1>
          <p className='text-muted-foreground mb-6'>
            You can only edit presales that you created.
          </p>
          <Button
            onClick={() => navigate(`/launchpads/${presaleId}`)}
            variant='outline'
          >
            View Presale
          </Button>
        </div>
      </div>
    );
  }

  // Check if presale can be edited
  if (presaleId && !canEdit) {
    return (
      <div className='container mx-auto px-6 py-8'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold mb-4'>Cannot Edit Presale</h1>
          <p className='text-muted-foreground mb-6'>
            This presale cannot be edited because it has been finalized or
            cancelled.
          </p>
          <Button
            onClick={() => navigate(`/launchpads/${presaleId}`)}
            variant='outline'
          >
            View Presale
          </Button>
        </div>
      </div>
    );
  }

  // Get button text and state for Overview step
  const getOverviewButtonText = () => {
    if (!allPaid) {
      return 'Complete Payment First';
    }
    return 'Deploy Launchpad';
  };

  const isOverviewButtonDisabled = () => {
    return !allPaid;
  };

  return (
    <FormProvider {...methods}>
      <form className='max-w-2xl mx-auto py-10' autoComplete='off'>
        <div className='rounded-2xl shadow-lg p-6 border border-[color:var(--gray-charcoal)]'>
          <h2 className='text-2xl font-bold mb-6 text-foreground flex items-center gap-2'>
            Edit Launchpad
            <Badge variant='secondary' className='text-xs'>
              Edit Mode
            </Badge>
          </h2>

          {/* Edit mode alert */}
          <Alert className='mb-6'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>
              You are in edit mode. Only certain fields can be modified.
              Technical parameters cannot be changed after creation.
            </AlertDescription>
          </Alert>

          <p className='mb-6 text-foreground'>
            {step === LaunchpadStep.Info &&
              'Update your launchpad information (limited fields can be edited)'}
            {step === LaunchpadStep.Social && 'Update your social media links'}
            {step === LaunchpadStep.Overview &&
              'Complete payments and deploy your launchpad'}
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
          {step === LaunchpadStep.Overview && (
            <Step3Overview
              modalState={{
                showDeploymentModal,
                setShowDeploymentModal,
              }}
              handleContinueCreate={handleContinueCreate}
              handleSeeDetail={handleSeeDetail}
            />
          )}

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

            {step === LaunchpadStep.Overview && (
              <Button
                className={`flex-1 ${
                  isOverviewButtonDisabled()
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-[linear-gradient(45deg,_var(--blue-primary),_var(--primary))] hover:opacity-90 hover:shadow-[0_0px_16px_0_var(--blue-primary)]'
                } 
                shadow-[0_0px_10px_0_var(--blue-primary)]
                border-none
                rounded-lg
                text-foreground`}
                type='button'
                onClick={handleNext}
                disabled={processing || isOverviewButtonDisabled()}
              >
                {processing ? (
                  <div className='flex items-center gap-2'>
                    <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                    Deploying...
                  </div>
                ) : (
                  getOverviewButtonText()
                )}
              </Button>
            )}
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
      </form>
    </FormProvider>
  );
}