/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import Image from '@/components/ui/image';
import { Step1Info } from './components/StepInfo';
import { Step2Social } from './components/StepSocial';
import { Step3Overview } from './components/StepOverview';

enum LaunchpadStep {
  Info = 1,
  Social = 2,
  Overview = 3,
}
 
export type LaunchpadForm = {
  // Step 1
  token: string;
  chain: string;
  presaleRate: string;
  numberOfTokens: string;
  softcap: string;
  hardcap: string;
  minBuy: string;
  maxBuy: string;
  startTime: Date | null;
  endTime: Date | null;
  // Step 2
  logoUrl: string;
  website: string;
  facebook?: string;
  x?: string;
  github?: string;
  telegram?: string;
  instagram?: string;
  discord?: string;
  reddit?: string;
  youtube?: string;
  description?: string;
};
export const CHAINS = [
    {
      key: 'eth',
      name: 'ETH',
      icon: '/images/default-coin-logo.jpg',
      fields: [
        {
          label: 'Presale Rate',
          value: '1,000,000',
          sub: 'If I spend 1 ETH how many tokens will I receive?',
        },
        { label: 'Number of tokens', value: '1,000,000' },
        { label: 'Softcap (ETH)', value: '10' },
        { label: 'Hardcap (ETH)', value: '1000' },
        { label: 'Minimum Buy', value: '10' },
        { label: 'Maximum Buy', value: '1000' },
      ],
    },
    {
      key: 'avax',
      name: 'Avalanche',
      icon: '/images/default-coin-logo.jpg',
      fields: [],
    },
    {
      key: 'bsc',
      name: 'BSC',
      icon: '/images/default-coin-logo.jpg',
      fields: [],
    },
];
  
export const TOKENS = [
    {
      value: 'dfb',
      label: <div className='flex items-center gap-2'>
        <Image
          src={'/images/default-coin-logo.jpg'}
          alt={'token'}
          className='w-6 h-6 rounded-full'
        />
        <span>DFB | 0xH5x2LJTr9YRJoqyH7S833rgmFgYQDxvwESiQxynLat</span>
      </div> ,
      name: 'Defi Bamboo',
      symbol: 'DFB',
      decimals: 18,
      poolFee: '1 BNB',
    },
];

export default function CreateLaunchpadPage() {
  const [step, setStep] = useState<LaunchpadStep>(LaunchpadStep.Info);

  const methods = useForm<LaunchpadForm>({
    defaultValues: {
      token: '',
      chain: '',
      presaleRate: '',
      numberOfTokens: '',
      softcap: '',
      hardcap: '',
      minBuy: '',
      maxBuy: '',
      startTime: null,
      endTime: null,
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

  const { handleSubmit, trigger } = methods;

  const onSubmit = (data: LaunchpadForm) => {
    alert("Submit: " + JSON.stringify(data, null, 2));
  };

  // Validate step before next
  const handleNext = async () => {
    let fields: (keyof LaunchpadForm)[] = [];
    if (step === LaunchpadStep.Info) {
      fields = [
        'token',  'presaleRate', 'numberOfTokens', 'softcap', 'hardcap', 'minBuy', 'maxBuy', 'startTime', 'endTime'
      ];
    } else if (step === LaunchpadStep.Social) {
      fields = ['logoUrl', 'website'];
    }
    const valid = await trigger(fields as any);
    if (valid) setStep(step + 1);
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='max-w-2xl mx-auto py-10'
        autoComplete="off"
      >
        <div className='rounded-2xl shadow-lg p-6 border border-[color:var(--gray-charcoal)]'>
          <h2 className='text-2xl font-bold mb-6 text-foreground'>Create your Launchpad</h2>
          <p className='mb-6 text-foreground'>
            {step === LaunchpadStep.Info && "Enter the launchpad information that you want to raise, that should be enter all detail about your presale"}
            {step === LaunchpadStep.Social && "Let people know Who you are"}
            {step === LaunchpadStep.Overview && "Review all information before submitting your launchpad"}
          </p>

          {step === LaunchpadStep.Info && (
            <Step1Info CHAINS={CHAINS} TOKENS={TOKENS} />
          )}
          {step === LaunchpadStep.Social && (
            <Step2Social />
          )}
          {step === LaunchpadStep.Overview && (
            <Step3Overview />
          )}

          {/* Fees & Actions */}
            <div className="flex gap-2 mt-5">
              {step > LaunchpadStep.Info && (
                <Button
                  variant="outline"
                  className="flex-1"
                  type="button"
                  onClick={() => setStep(step - 1)}
                >
                  Back
                </Button>
              )}
              {step < LaunchpadStep.Overview ? (
                <Button
                  className="flex-1 bg-gradient-to-r from-primary via-cyan-400 to-blue-500 text-foreground font-bold py-3 rounded-lg text-lg shadow hover:opacity-90 transition-all"
                  type="button"
                  onClick={handleNext}
                >
                  Next
                </Button>
              ) : (
                <Button
                  className="flex-1 bg-gradient-to-r from-primary via-cyan-400 to-blue-500 text-foreground font-bold py-3 rounded-lg text-lg shadow hover:opacity-90 transition-all"
                  type="submit"
                >
                  Submit
                </Button>
              )}
            </div>
        </div>
      </form>
    </FormProvider>
  );
}