/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from '@/components/ui/image';
import FormCreateTokenLogo from '@/assets/icons/form-create-token-logo.svg';
import { useChainTransfer } from '@/hooks/useChainTransfer';
import { useFormContext, useWatch } from 'react-hook-form';
import TokenInfoDisplay from './components/TokenInfoDisplay';
import type { CreateTokenFormValues } from './CreateTokenFormValidation';
import { useSwitchChain,  } from 'wagmi';
import { TransactionStatus } from '@/utils/enums/transaction';
import { ChainType } from '@/utils/enums/chain';
import { useDeployTokenMutation,  } from '@/services/pre-sale/create-token';

type Address = `0x${string}`;


interface ConfirmCreateTokenProps {
  formData: CreateTokenFormValues;
  next: () => void;
}
type ChainFieldType = {
  totalSupply: string;
  systemWalletAddress?: string;
  id?: string;
  paymentTokenAddress?: string;
  deployFee?: string;
  platformFee?: string;
  tokenAddress?: string;
  transactions?: {
    native?: {
      payStatus?: string;
      payError?: string;
      payHash?: string;
      isVerify?: boolean;
      amount?: string;
    };
  };
};

const ConfirmCreateToken: React.FC<ConfirmCreateTokenProps> = ({ next }) => {
 const { setValue, watch } = useFormContext<CreateTokenFormValues>();
const formData = watch();
const [deployToken, { isLoading: isLoadingDeployToken }] = useDeployTokenMutation();
const { transfer } = useChainTransfer();
const { switchChainAsync } = useSwitchChain();
// const [verifyPayment] = useVerifyPaymentMutation();
const watchedChainFields = useWatch<CreateTokenFormValues>({
  name: 'chainFields',
})as Record<string, ChainFieldType>;
console.log("🚀 ~ watchedChainFields:", watchedChainFields)
const handlePay = async (chainId: number, chainType: ChainType, to: string, nativeAmount: string) => {
  console.log("🚀 ~ handlePay ~ chainId:", chainId)
  try {
    console.log(`Starting payment for chain ${chainId}`);
    await switchChainAsync({ chainId })
      .then(() => console.log(`Switched to chain ${chainId} successfully`))
      .catch((error) => {
        throw new Error(`Failed to switch chain ${chainId}: ${error.message}`);
      });

    setValue(
      `chainFields.${chainId}.transactions.native.payStatus`,
      TransactionStatus.PENDING,
      { shouldValidate: true, shouldDirty: true }
    );
    setValue(`chainFields.${chainId}.transactions.native.payError`, '', {
      shouldValidate: true,
      shouldDirty: true,
    });
    console.log('before transfer', chainId)
    const nativeResult = await transfer({ chainType, to: to as Address, amount: nativeAmount, chainId });
    console.log(`Transfer result for chain ${chainId}:`, nativeResult);

    if (!nativeResult?.hash) {
      throw new Error(nativeResult?.error || 'Native payment failed');
    }

    // console.log(`Transaction receipt for chain ${chainId}:`, receipt);

    // if (receipt.status === 'reverted') {
    //   throw new Error('Transaction reverted');
    // }

    setValue(
      `chainFields.${chainId}.transactions.native`,
      {
        payStatus: TransactionStatus.SUCCESS,
        payHash: nativeResult.hash,
        amount: nativeAmount,
        isVerify: false,
      },
      { shouldValidate: true, shouldDirty: true }
    );

  } catch (error) {
    console.error(`Payment failed for chain ${chainId}:`, error);
    setValue(
      `chainFields.${chainId}.transactions.native.payStatus`,
      TransactionStatus.ERROR,
      { shouldValidate: true, shouldDirty: true }
    );
    setValue(
      `chainFields.${chainId}.transactions.native.payError`,
      (error as Error).message,
      { shouldValidate: true, shouldDirty: true }
    );
  }
};
// useEffect(() => {
//   console.log('watchedChainFields:', watchedChainFields);
//   const allChainsPaid = Object.values(watchedChainFields).every(
//     (field) => field?.transactions?.native?.payStatus === TransactionStatus.SUCCESS
//   );

//   if (allChainsPaid) {
//     console.log('All chains paid, verifying payments...');
//     handleVerifyAllPayments();
//   }
// }, [watchedChainFields]);



// const handleVerifyAllPayments = async () => {
//   const tokenIds: string[] = Object.values(watchedChainFields)
//   .map((field) => field?.id)
//   .filter((id): id is string => Boolean(id));

// for (const tokenId of tokenIds) {
//   try {
//     const { data } = await verifyPayment(tokenId).unwrap();
//     const chainStatus = data.find((chain: any) => chain.tokenId === tokenId);

//     if (chainStatus) {
//       const { chainId, readyForDeployment, paymentStatus } = chainStatus;
//       const isVerified = readyForDeployment && paymentStatus === PaymentStatus.COMPLETED;

//       setValue(`chainFields.${chainId}.transactions.native.isVerify`, isVerified);
//     }
//   } catch (error) {
//     console.error('Failed to verify token:', tokenId, error);
//   }
// }
// };


const onPay = (chainId: string, address: string, nativeAmount: string) => {
  const chainType = ChainType.EVM;
  handlePay(Number(chainId), chainType, address, nativeAmount);
};

const onSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const tokenIds = Object.values(formData.chainFields || {})
    .filter((field: any) => field?.transactions?.native?.isVerify === true)
    .map((field: any) => field?.id)
    .filter(Boolean);

  if (tokenIds.length === 0) {
    console.warn('No verified tokenIds to deploy.');
    return;
  }

  try {
    const result = await deployToken({ tokenIds }).unwrap();

    for (const item of result.data) {
      const chainId = item.chainId;
      const tokenAddress = item.tokenAddress;

      if (formData.chainFields?.[chainId]) {
        setValue(`chainFields.${chainId}.tokenAddress`, tokenAddress);
      }
    }

    next();
  } catch (error) {
    console.error('Error deploying tokens:', error);
  }
};
// useEffect(() => {
//   const allChainsPaid = Object.values(watchedChainFields).every(
//     (field) => field?.transactions?.native?.payStatus === TransactionStatus.SUCCESS
//   );
//   console.log("🚀 ~ useEffect ~ allChainsPaid:", allChainsPaid)

//   if (allChainsPaid) {
//     handleVerifyAllPayments();
//   }
// }, [watchedChainFields]);
  
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
                  watchedChainFields={watchedChainFields}
                  showFees={true}
                  chainId={chainId}
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
            disabled={isLoadingDeployToken}
            type="submit"
            className="w-full bg-[linear-gradient(45deg,_var(--blue-primary),_var(--primary))] shadow-[0_0px_10px_0_var(--blue-primary)] border-none rounded-lg cursor-pointer hover:opacity-90 hover:shadow-[0_0px_16px_0_var(--blue-primary)] text-foreground"
          >
            {isLoadingDeployToken ? <>
            Processing
            </> : <>
            Submit
            </> }
          </Button>
        </CardContent>
      </Card>
    </form>
  );
};

export default ConfirmCreateToken;