/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from '@/components/ui/image';
import FormCreateTokenLogo from '@/assets/icons/form-create-token-logo.svg';
import { useChainTransfer } from '@/hooks/useChainTransfer';
import { useFormContext, useWatch } from 'react-hook-form';
import TokenInfoDisplay from './components/TokenInfoDisplay';
import type { CreateTokenFormValues } from './CreateTokenFormValidation';
import { useSwitchChain, useWalletClient } from 'wagmi';
import { TransactionStatus } from '@/utils/enums/transaction';
import { ChainType } from '@/utils/enums/chain';
import { useVerifyPaymentOnSuccess } from '@/hooks/create-token/useVerifyPaymentOnSuccess ';
import { useDeployTokenMutation } from '@/services/pre-sale/create-token';
import { useMemo } from 'react';
import { waitForTransactionReceipt } from 'viem/actions';

type Address = `0x${string}`;


interface ConfirmCreateTokenProps {
  formData: CreateTokenFormValues;
  next: () => void;
}


const ConfirmCreateToken: React.FC<ConfirmCreateTokenProps> = ({ next }) => {
  const { setValue, watch } = useFormContext<CreateTokenFormValues>();
  const { data: walletClient } = useWalletClient();
  const formData = watch();
  const [deployToken] = useDeployTokenMutation();
  const { transfer } = useChainTransfer();
  const { switchChainAsync } = useSwitchChain();
const watchedChainFields = useWatch<CreateTokenFormValues>({
  name: 'chainFields',
});
  const handlePay = async (
    chainId: number,
    chainType: ChainType,
    to: string,
    nativeAmount: string
  ) => {
    try {
      await switchChainAsync({ chainId });
      setValue(
        `chainFields.${chainId}.transactions.native.payStatus`,
        TransactionStatus.PENDING
      );
      setValue(`chainFields.${chainId}.transactions.native.payError`, '');
      
      const nativeResult = await transfer({
        chainType,
        to: to as Address,
        amount: nativeAmount,
        chainId,
      });
      
      if (!nativeResult?.hash) {
        throw new Error(nativeResult?.error || 'Native payment failed');
      }
      
      await waitForTransactionReceipt(walletClient!, {
        hash: nativeResult?.hash as `0x${string}`,
      })
      
      setValue(
        `chainFields.${chainId}.transactions.native.payStatus`,
        TransactionStatus.SUCCESS
      );
      setValue(
        `chainFields.${chainId}.transactions.native.payHash`,
        nativeResult.hash
      );
      setValue(
        `chainFields.${chainId}.transactions.native.amount`,
        nativeAmount
      );
    } catch (error) {
      console.error('Payment failed:', error);
      setValue(
        `chainFields.${chainId}.transactions.native.payStatus`,
        TransactionStatus.ERROR
      );
      setValue(
        `chainFields.${chainId}.transactions.native.payError`,
        (error as Error).message
      );
    }
};

const onPay = (chainId: string, address: string, nativeAmount: string) => {
    const chainType = ChainType.EVM;
    const to: Address = address as `0x${string}`;
    handlePay(Number(chainId), chainType, to, nativeAmount);
  };
  
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const deployIds = Object.values(formData.chainFields || {})
    .filter((field: any) => field?.transactions?.native?.isVerify === true)
    .map((field: any) => field?.id)
    .filter(Boolean);

    try {
      const results = await Promise.all(deployIds.map((tokenId) => deployToken(tokenId).unwrap())
    );
    console.log('All tokens deployed:', results);
    next();
  } catch (error) {
      console.error('Error deploying tokens:', error);
    }
  };
  
  useVerifyPaymentOnSuccess();
 const allVerified = useMemo(() => {
  return Object.values(watchedChainFields || {}).every(
    (field: any) => field?.transactions?.native?.isVerify === true
  );
}, [watchedChainFields]);
  
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
            const address = chainData?.systemWalletAddress || '';
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
                  onPay={() => onPay(chainId, address, nativeAmount)}
                />
              </div>
            );
          })}

          <Button
            disabled={!allVerified}
            type="submit"
            className="w-full bg-[linear-gradient(45deg,_var(--blue-primary),_var(--primary))] shadow-[0_0px_10px_0_var(--blue-primary)] border-none rounded-lg cursor-pointer hover:opacity-90 hover:shadow-[0_0px_16px_0_var(--blue-primary)] text-foreground"
          >
            Submit
          </Button>
        </CardContent>
      </Card>
    </form>
  );
};

export default ConfirmCreateToken;