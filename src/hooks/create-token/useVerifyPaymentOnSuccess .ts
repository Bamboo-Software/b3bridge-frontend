// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { useEffect, useRef } from 'react';
// import { useWatch, useFormContext } from 'react-hook-form';
// import type { CreateTokenFormValues } from '@/pages/create-token/create/CreateTokenFormValidation';
// import { useVerifyPaymentMutation } from '@/services/pre-sale/create-token';
// import { TransactionStatus } from '@/utils/enums/transaction';

// interface VerifiedResult {
//   tokenId: string;
//   chainId: string;
//   paymentStatus: string;
//   [key: string]: any;
// }
// export const useVerifyPaymentOnSuccess = () => {
//   const { getValues, setValue } = useFormContext<CreateTokenFormValues>();
//   const [verifyPayment] = useVerifyPaymentMutation();
//   const verifiedMap = useRef<Record<string, boolean>>({});

//   useEffect(() => {
//     const chainFields = getValues("chainFields");
//     if (!chainFields) return;

//     Object.entries(chainFields).forEach(([chainId, data]) => {
//       const status = data?.transactions?.native?.payStatus;
//       const tokenId = data?.id;

//       if (
//         status === TransactionStatus.SUCCESS &&
//         tokenId &&
//         !verifiedMap.current[tokenId]
//       ) {
//         verifiedMap.current[tokenId] = true;

//         (async () => {
//           try {
//             await new Promise((r) => setTimeout(r, 3000));
//             const result = await verifyPayment(tokenId).unwrap();
//             const isVerify = result?.data?.paymentStatus === "Completed";

//             setValue(
//               `chainFields.${chainId}.transactions.native.isVerify`,
//               isVerify
//             );
//           } catch (err) {
//             console.error(`❌ Verify failed for token ${tokenId}:`, err);
//             setValue(
//               `chainFields.${chainId}.transactions.native.isVerify`,
//               false
//             );
//             verifiedMap.current[tokenId] = false;
//           }
//         })();
//       }
//     });
//   }, [getValues, setValue, verifyPayment]);
// };


// // export const useVerifyPaymentOnSuccess = () => {
// //   const chainFields = useWatch<CreateTokenFormValues>({ name: 'chainFields' });
// //   const { setValue } = useFormContext<CreateTokenFormValues>();
// //   const [verifyPayment] = useVerifyPaymentMutation();
// //   const verifiedMap = useRef<Record<string, boolean>>({});
// //   const [verifiedResults, setVerifiedResults] = useState<VerifiedResult[]>([]);

// //   useEffect(() => {
// //     if (!chainFields) return;

// //     const handleVerifyPayments = async () => {
// //       for (const [chainId, data] of Object.entries(chainFields)) {
// //         const status = data?.transactions?.native?.payStatus;
// //         const tokenId = data?.id;

// //         if (status === 'success' && tokenId && !verifiedMap.current[tokenId]) {
// //           verifiedMap.current[tokenId] = true;

// //           try {
// //             await new Promise((resolve) => setTimeout(resolve, 3000)); 
// //             const result = await verifyPayment(tokenId).unwrap();
// //             const paymentStatus = result?.data?.paymentStatus ?? 'Unknown';

// //             const isVerify = paymentStatus === 'Completed' ? true : false;
// //             setValue(
// //               `chainFields.${chainId}.transactions.native.isVerify`,
// //               isVerify
// //             );

// //             const mergedResult: VerifiedResult = {
// //               chainId,
// //               tokenId,
// //               paymentStatus,
// //               ...result?.data,
// //             };

// //             setVerifiedResults((prev) => [...prev, mergedResult]);

// //           } catch (err) {
// //             console.error(`Error verifying payment for token ${tokenId}:`, err);
// //             verifiedMap.current[tokenId] = false;
// //             setValue(
// //               `chainFields.${chainId}.transactions.native.isVerify`,
// //               false
// //             );
// //           }
// //         }
// //       }
// //     };

// //     handleVerifyPayments();
// //   }, [chainFields, setValue, verifyPayment]);

// //   return verifiedResults;
// // };