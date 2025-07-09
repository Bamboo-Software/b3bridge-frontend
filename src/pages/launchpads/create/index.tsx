/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Step1Info } from './components/StepInfo';
import { Step2Social } from './components/StepSocial';
import { Step3Overview } from './components/StepOverview';
import type { ITokenOFT } from '@/utils/interfaces/token';
import { EntryStatus } from '@/utils/enums/entry';
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

enum LaunchpadStep {
  Info = 1,
  Social = 2,
  Overview = 3,
}

export const TOKENS_OFT: ITokenOFT[] = [
  {
    id: '1',
    tokenAddress: '0x779877A7B0D9E8603169DdbD7836e478b4624789',
    chainType: ChainType.EVM,
    chainId: '1',
    name: 'Defi Bamboo',
    symbol: 'DFB',
    decimals: 18,
    totalSupply: '1000000000',
    logoUrl: '/images/default-coin-logo.jpg',
    status: EntryStatus.DRAFT,
    isVerified: true,
    tags: ['defi', 'bamboo'],
    category: 'DeFi',
    createdAt: '2025-07-08T03:47:45.991Z',
  },
  {
    id: '2',
    tokenAddress: '0x779877A7B0D9E8603169DdbD7836e478b4624789',
    chainType: ChainType.EVM,
    chainId: '56',
    name: 'Bamboo Chain',
    symbol: 'BMB',
    decimals: 18,
    totalSupply: '500000000',
    logoUrl: '/images/default-coin-logo.jpg',
    status: EntryStatus.DRAFT,
    isVerified: false,
    tags: ['bamboo'],
    category: 'Utility',
    createdAt: '2025-07-08T03:47:45.991Z',
  },
];

export default function CreateLaunchpadPage() {
  const [step, setStep] = useState<LaunchpadStep>(LaunchpadStep.Info);

  const [filterTokens, setFilterTokens] = useState({
    page: 1,
    q: ''
  });

  const { page, q } = filterTokens;

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

  const { handleSubmit, trigger, getValues, watch } = methods;
  const onSubmit = (data: LaunchpadFormValues) => {
    console.log(data, 'data nay');
  };
    const chainFields = watch('chainFields');

 const handleNext = async () => {
  let fields: string[] = [];
  if (step === LaunchpadStep.Info) {
    fields = ['token', 'startTime', 'endTime'];
    const selectedChains = getValues('chain') || [];
    const currentChainFields = getValues('chainFields') || {};
    
    selectedChains.forEach((chainKey: string) => {
      if (!currentChainFields[chainKey]) {
        methods.setValue(`chainFields.${chainKey}`, {
          address: '',
          presaleRate: '',
          numberOfTokens: '',
          softcap: '',
          hardcap: '',
          minBuy: '',
          maxBuy: ''
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
    fields = ['logoUrl', 'website'];
  }
  
  const valid = await trigger(fields as any);
  
  if (valid) {
    if (step === LaunchpadStep.Social) {
      const selectedChains = getValues('chain') || [];
      const chainFields = getValues('chainFields') || {};
      selectedChains.forEach((chainKey: string, idx: number) => {
        if (!chainFields[chainKey]?.address) {
          chainFields[chainKey] = {
            ...chainFields[chainKey],
            address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
          };
        }
        if (!chainFields[chainKey]?.totalFee) {
          chainFields[chainKey] = {
            ...chainFields[chainKey],
            totalFee: `${0.0001 + idx * 0.001}`,
          };
        }
      });
      methods.setValue('chainFields', chainFields);
    }
    if (step < LaunchpadStep.Overview) {
      setStep(step + 1);
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

  const chain = watch('chain');

  const allPaid = chain?.every((chainId: string) => {
    const f = chainFields?.[chainId];
    const nativeStatus = f?.transactions?.native?.payStatus;
    const oftStatus = f?.transactions?.oft?.payStatus;
    const nativeHash = f?.transactions?.native?.payHash;
    const oftHash = f?.transactions?.oft?.payHash;
    
    return nativeStatus === TransactionStatus.SUCCESS && 
            oftStatus === TransactionStatus.SUCCESS && 
            !!nativeHash && 
            !!oftHash;
  });

  const { useGetMyTokensQuery } = preSaleTokenManagementApi;
  const { data: tokenRes, isLoading: isLoadingMyTokens, error } = useGetMyTokensQuery({
    page,
    limit: appConfig.defaultLimit,
    q
  });


  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='max-w-2xl mx-auto py-10'
        autoComplete='off'
      >
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

          {step === LaunchpadStep.Info && <Step1Info tokenState={{
            // tokenData:  tokenRes?.data?.data,
            tokenData:  {
              ...(tokenRes?.data?.data || {}),
              items: TOKENS_OFT,
              meta: {
                total: TOKENS_OFT.length,
                page: 1,
                limit: TOKENS_OFT.length
              }
            },
            isLoadingMyTokens,
            error,
            filterTokens,
            setFilterTokens
          }}/>}
          {step === LaunchpadStep.Social && <Step2Social />}
          {step === LaunchpadStep.Overview && (
            <Step3Overview/>
          )}

          {/* Fees & Actions */}
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
              >
                Next
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
                  type='submit'
                >
                  Submit
                </Button>
              ))}
          </div>
        </div>
      </form>
    </FormProvider>
  );
}