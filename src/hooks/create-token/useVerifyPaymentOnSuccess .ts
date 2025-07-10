/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { useWatch, useFormContext } from 'react-hook-form';
import type { CreateTokenFormValues } from '@/pages/create-token/create/CreateTokenFormValidation';
import { useVerifyPaymentMutation } from '@/services/pre-sale/create-token';

interface VerifiedResult {
  tokenId: string;
  chainId: string;
  paymentStatus: string;
  [key: string]: any;
}

export const useVerifyPaymentOnSuccess = () => {
  const chainFields = useWatch<CreateTokenFormValues>({ name: 'chainFields' });
  const { setValue } = useFormContext<CreateTokenFormValues>();
  const [verifyPayment] = useVerifyPaymentMutation();
  const verifiedMap = useRef<Record<string, boolean>>({});
  const [verifiedResults, setVerifiedResults] = useState<VerifiedResult[]>([]);

  useEffect(() => {
    if (!chainFields) return;

    const handleVerifyPayments = async () => {
      for (const [chainId, data] of Object.entries(chainFields)) {
        const status = data?.transactions?.native?.payStatus;
        const tokenId = data?.id;

        if (status === 'success' && tokenId && !verifiedMap.current[tokenId]) {
          verifiedMap.current[tokenId] = true;

          try {
            await new Promise((resolve) => setTimeout(resolve, 3000)); 
            const result = await verifyPayment(tokenId).unwrap();
            const paymentStatus = result?.data?.paymentStatus ?? 'Unknown';

            const isVerify = paymentStatus === 'Completed' ? true : false;
            setValue(
              `chainFields.${chainId}.transactions.native.isVerify`,
              isVerify
            );

            const mergedResult: VerifiedResult = {
              chainId,
              tokenId,
              paymentStatus,
              ...result?.data,
            };

            setVerifiedResults((prev) => [...prev, mergedResult]);

          } catch (err) {
            console.error(`Error verifying payment for token ${tokenId}:`, err);
            verifiedMap.current[tokenId] = false;
            setValue(
              `chainFields.${chainId}.transactions.native.isVerify`,
              false
            );
          }
        }
      }
    };

    handleVerifyPayments();
  }, [chainFields, setValue, verifyPayment]);

  return verifiedResults;
};