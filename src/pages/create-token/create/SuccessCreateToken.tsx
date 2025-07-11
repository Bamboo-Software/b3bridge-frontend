/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from '@/components/ui/image';
import FormCreateTokenLogo from '@/assets/icons/form-create-token-logo.svg';
import TokenInfoDisplay from './components/TokenInfoDisplay';
import type { CreateTokenFormValues } from './CreateTokenFormValidation';
import { useNavigate } from 'react-router-dom';

interface SuccessCreateTokenProps {
  formData: CreateTokenFormValues;
  next: () => void;
}

const SuccessCreateToken: React.FC<SuccessCreateTokenProps> = ({ formData, next }) => {
  const navigate = useNavigate();
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    next();
  };

  return (
    <form onSubmit={onSubmit} className="w-full max-w-[670px] mx-auto">
      <Card className="dark:bg-[#111417] bg-[#111417] dark:border-[#373B40] border-[#373B40] text-white">
        <CardHeader className="pb-6">
          <CardTitle className="flex justify-between items-start">
            <div className="flex flex-col gap-2">
              <span className="text-2xl font-semibold text-white">Create OFT Token</span>
              <span className="text-base font-normal text-gray-400">Review your information</span>
            </div>
            <Image src={FormCreateTokenLogo} alt="FormCreateTokens" className="h-16 w-16" />
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 px-6 pb-6">
           {formData.targetChains?.map((chainId) => {
            const chainData = formData.chainFields?.[chainId];
            const address = chainData?.tokenAddress || '';
            const nativeAmount = chainData?.platformFee || '';
            const totalSupply = chainData?.totalSupply || '';
            const isVerified = chainData?.transactions?.native?.isVerify === true;

            return (
              <div key={chainId} className="space-y-4">
                <TokenInfoDisplay
                  formData={formData}
                  showFees={true}
                  nativeAmount={nativeAmount}
                  totalSupply={totalSupply}
                  showPayButton={!isVerified}
                  address={address}
                />
              </div>
            );
          })}

          {/* Submit Buttons */}
          <div className="flex justify-between items-center">
            <Button
              type="button"
              onClick={() => navigate('/list-token')}
              className="dark:bg-[#1E242D] text-white py-3 text-base font-medium"
            >
              View Transaction
            </Button>

            <Button
              type="button"
              onClick={() => navigate('/create-token')}
              className="dark:bg-[#1E242D] text-white py-3 text-base font-medium"
            >
              Create new token
            </Button>

            <Button
              type="button"
              onClick={() => navigate('/launchpads/create')}
              className="bg-[linear-gradient(45deg,_var(--blue-primary),_var(--primary))] shadow-[0_0px_10px_0_var(--blue-primary)] border-none rounded-lg cursor-pointer hover:opacity-90 hover:shadow-[0_0px_16px_0_var(--blue-primary)] text-foreground"
            >
              Create Launchpad
            </Button>
          </div>

        </CardContent>
      </Card>
    </form>
  );
};

export default SuccessCreateToken;
