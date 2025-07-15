/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from '@/components/ui/image';
import FormCreateTokenLogo from '@/assets/icons/form-create-token-logo.svg';
import { useChainTransfer } from '@/hooks/useChainTransfer';
import { useFormContext, useWatch } from 'react-hook-form';
import TokenInfoDisplay from './components/TokenInfoDisplay';
import type { CreateTokenFormValues } from './CreateTokenFormValidation';
import { useSwitchChain } from 'wagmi';
import { TransactionStatus } from '@/utils/enums/transaction';
import { ChainType } from '@/utils/enums/chain';
import { useState } from 'react';
import DeployTokenModal from './components/DeployTokenModal';

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
  const { transfer } = useChainTransfer();
  const { switchChainAsync } = useSwitchChain();
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [processingChains, setProcessingChains] = useState<Set<number>>(new Set());

  const watchedChainFields = useWatch<CreateTokenFormValues>({
    name: 'chainFields',
  }) as Record<string, ChainFieldType>;

  const handlePay = async (chainId: number, chainType: ChainType, to: string, nativeAmount: string) => {
    // Prevent multiple concurrent payments for the same chain
    if (processingChains.has(chainId)) {
      return;
    }

    try {
      setProcessingChains(prev => new Set(prev).add(chainId));

      await switchChainAsync({ chainId })
        .then(() => console.log(`Switched to chain ${chainId} successfully`))
        .catch((error) => {
          throw new Error(`Failed to switch chain ${chainId}: ${error.message}`);
        });

      setValue(
        `chainFields.${chainId}.transactions.native.payStatus`,TransactionStatus.PENDING,{ shouldValidate: true, shouldDirty: true }
      );
      setValue(`chainFields.${chainId}.transactions.native.payError`, '', {
        shouldValidate: true,
        shouldDirty: true,
      });

      const nativeResult = await transfer({ 
        chainType, 
        to: to as Address, 
        amount: nativeAmount, 
        chainId 
      });

      if (!nativeResult?.hash) {
        throw new Error(nativeResult?.error || 'Native payment failed');
      }

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
    } finally {
      setProcessingChains(prev => {
        const newSet = new Set(prev);
        newSet.delete(chainId);
        return newSet;
      });
    }
  };

  const onPay = (chainId: string, address: string, nativeAmount: string) => {
    const chainType = ChainType.EVM;
    handlePay(Number(chainId), chainType, address, nativeAmount);
  };

  // Check if all transactions are successful
  const allTransactionsSuccessful = () => {
    if (!formData.targetChains || formData.targetChains.length === 0) {
      return false;
    }

    return formData.targetChains.every((chainId) => {
      const chainData = formData.chainFields?.[chainId];
      const transactionStatus = chainData?.transactions?.native?.payStatus;
      return transactionStatus === TransactionStatus.SUCCESS;
    });
  };

  const isDeployDisabled = !allTransactionsSuccessful() || processingChains.size > 0;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isDeployDisabled) {
      return;
    }
    
    const tokenIds = Object.values(formData.chainFields || {})
      .map((field: any) => field?.id)
      .filter(Boolean);

    if (tokenIds.length === 0) {
      console.warn('No token IDs found for deployment.');
      return;
    }

    // Open deploy modal
    setIsDeployModalOpen(true);
  };

  const handleDeployModalClose = () => {
    setIsDeployModalOpen(false);
  };

  const handleDeploySuccess = (deployedTokens: any[]) => {
    for (const item of deployedTokens) {
      const chainId = item.chainId;
      const tokenAddress = item.tokenAddress;

      if (formData.chainFields?.[chainId]) {
        setValue(`chainFields.${chainId}.tokenAddress`, tokenAddress);
      }
    }

    setIsDeployModalOpen(false);
    next();
  };

  // Get token IDs for the modal
  const getTokenIds = () => {
    return Object.values(formData.chainFields || {})
      .map((field: any) => field?.id)
      .filter(Boolean);
  };

  return (
    <>
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
              type="submit"
              disabled={isDeployDisabled}
              className={`w-full rounded-lg cursor-pointer text-foreground ${
                isDeployDisabled
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-[linear-gradient(45deg,_var(--blue-primary),_var(--primary))] shadow-[0_0px_10px_0_var(--blue-primary)] border-none hover:opacity-90 hover:shadow-[0_0px_16px_0_var(--blue-primary)]'
              }`}
            >
              {processingChains.size > 0 
                ? 'Processing Payments...' 
                : !allTransactionsSuccessful() 
                ? 'Complete Payments First' 
                : 'Deploy Tokens'
              }
            </Button>
          </CardContent>
        </Card>
      </form>

      {/* Deploy Token Modal */}
      <DeployTokenModal
        open={isDeployModalOpen}
        tokenIds={getTokenIds()}
        onClose={handleDeployModalClose}
        onSuccess={handleDeploySuccess}
      />
    </>
  );
};

export default ConfirmCreateToken;