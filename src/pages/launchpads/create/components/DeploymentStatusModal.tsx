/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { preSaleApi } from '@/services/pre-sale/presales';
import type {
  PresalePaymentVerificationResponse,
  PresalePaymentVerificationStatus,
  PresaleSupportedChain,
} from '@/utils/interfaces/launchpad';
import { DeploymentStatus, PaymentStatus } from '@/utils/enums/presale';
import MissileIcon from '@/assets/icons/missile-icon.svg';
import Image from '@/components/ui/image';

export interface DeploymentStatusModalProps {
  open: boolean;
  presaleId?: string;
  onContinueCreate?: () => void;
  onSeeDetail?: () => void;
  onOpenChange?: (open: boolean) => void;
}

export function DeploymentStatusModal({
  open,
  presaleId,
  onContinueCreate,
  onSeeDetail,
  onOpenChange
}: DeploymentStatusModalProps) {
  const [paymentStatus, setPaymentStatus] =
    useState<PresalePaymentVerificationStatus>({
      isVerified: false,
      isVerifying: false,
      allChainsReady: false,
      chainsStatus: [],
    });

  const [deploymentStarted, setDeploymentStarted] = useState(false);
  const [deploymentError, setDeploymentError] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [paymentVerificationError, setPaymentVerificationError] = useState<string | null>(null);

  // Redux hooks
  const {
    useVerifyPaymentPreSalesQuery,
    useGetDetailPreSalesQuery,
    useDeployContractPreSalesMutation,
  } = preSaleApi;

  // Verify payment
  const {
    data: paymentVerificationData,
    isLoading: isVerifyingPayment,
    refetch: refetchPaymentVerification,
    error: paymentVerificationApiError,
  } = useVerifyPaymentPreSalesQuery(
    { presaleId },
    { skip: !open || !presaleId }
  );

  // Get presale detail to check status
  const { data: presaleDetailData, refetch: refetchDetail } =
    useGetDetailPreSalesQuery({ presaleId }, { skip: !open || !presaleId });

  const [deployContract, { isLoading: isDeploymentTriggering, isError: isDeploymentFailed }] = useDeployContractPreSalesMutation();

  // Check if modal should be closable
  const isModalClosable = !deploymentStarted || deploymentError || isDeploying;

  // Handle modal close - only allow when closable
  const handleModalOpenChange = (open: boolean) => {
    if (!open && !isModalClosable) {
      // Prevent closing when deployment is successful
      return;
    }
    onOpenChange?.(open);
  };

  // Reset states when modal closes
  useEffect(() => {
    if (!open) {
      setPaymentStatus({
        isVerified: false,
        isVerifying: false,
        allChainsReady: false,
        chainsStatus: [],
      });
      setDeploymentStarted(false);
      setDeploymentError(null);
      setIsDeploying(false);
      setPaymentVerificationError(null);
    }
  }, [open]);

  // Handle payment verification API errors
  useEffect(() => {
    if (paymentVerificationApiError) {
      const errorMessage = 
        (paymentVerificationApiError as any)?.data?.message || 
        (paymentVerificationApiError as any)?.message || 
        'Failed to verify payment';
      
      setPaymentVerificationError(errorMessage);
      setPaymentStatus(prev => ({
        ...prev,
        isVerifying: false,
        error: errorMessage,
      }));
      toast.error(`Payment verification failed: ${errorMessage}`);
    }
  }, [paymentVerificationApiError]);

  // Process payment verification data
  useEffect(() => {
    if (!open) return;

    if (
      paymentVerificationData?.data &&
      Array.isArray(paymentVerificationData?.data)
    ) {
      const chainsStatus = paymentVerificationData.data.map(
        (chain: PresalePaymentVerificationResponse) => ({
          chainId: chain.chainId,
          chainName: chain.chainName,
          paymentStatus: chain.paymentStatus,
          readyForDeployment: chain.readyForDeployment,
          paymentProgress: chain.paymentProgress,
          requiredAmount: chain.requiredAmount,
          amount: chain.amount,
        })
      );

      const allChainsReady = paymentVerificationData?.data.every(
        (chain: PresalePaymentVerificationResponse) =>
          chain.readyForDeployment &&
          chain.paymentStatus === PaymentStatus.COMPLETED
      );

      setPaymentStatus((prev) => ({
        ...prev,
        isVerified: allChainsReady,
        allChainsReady,
        chainsStatus,
        isVerifying: false,
        error: undefined,
      }));
      
      // Clear payment verification error if successful
      setPaymentVerificationError(null);
      
      if (allChainsReady && !deploymentStarted && !deploymentError && !isDeploying) {
        toast.success('All payments verified successfully!');
        checkAndTriggerDeployment();
      } else if (!allChainsReady) {
        const pendingChains = paymentVerificationData?.data.filter(
          (chain: PresalePaymentVerificationResponse) =>
            !chain.readyForDeployment
        );
        toast.warning(
          `${pendingChains.length} chain(s) still pending payment verification`
        );
      }
    }
  }, [paymentVerificationData, deploymentStarted, deploymentError, isDeploying, open]);

  // Check presale status and trigger deployment if needed
  const checkAndTriggerDeployment = useCallback(async () => {
    if (!open) return;

    if (!presaleDetailData?.data) {
      await refetchDetail();
      return;
    }

    const presaleDetail = presaleDetailData.data;

    // Check if any chain is in DRAFT status
    const hasDraftChains = presaleDetail.presaleChains?.some(
      (chain: PresaleSupportedChain) => chain.status === DeploymentStatus.DRAFT
    );
    
    if (
      presaleDetail.status === DeploymentStatus.DRAFT &&
      hasDraftChains &&
      !deploymentStarted &&
      !deploymentError &&
      !isDeploying
    ) {
      handleTriggerDeployment();
    } else if (!deploymentError && !isDeploying) {
      setDeploymentStarted(true);
    }
  }, [presaleDetailData, deploymentStarted, deploymentError, isDeploying, open]);

  // Verify payment function
  const handleVerifyPayment = useCallback(async () => {
    if (!open) return;

    try {
      setPaymentStatus((prev) => ({
        ...prev,
        isVerifying: true,
        error: undefined,
      }));
      
      setPaymentVerificationError(null);

      await refetchPaymentVerification();
      
      setPaymentStatus((prev) => ({
        ...prev,
        isVerifying: false,
      }));
      
    } catch (error: any) {
      console.error('Payment verification error:', error);
      const errorMessage = error.message || 'Failed to verify payment';
      
      setPaymentVerificationError(errorMessage);
      setPaymentStatus((prev) => ({
        ...prev,
        isVerifying: false,
        error: errorMessage,
      }));
      toast.error(`Payment verification failed: ${errorMessage}`);
    }
  }, [refetchPaymentVerification, open]);

  // Trigger deployment
  const handleTriggerDeployment = useCallback(async () => {
    if (!open) return;

    try {
      setIsDeploying(true);
      setDeploymentError(null);

      const result = await deployContract({ presaleId }).unwrap();

      if (result) {
        setDeploymentStarted(true);
        setIsDeploying(false);
        toast.success('Contract deployment started successfully!');
      } else {
        throw new Error('Failed to trigger deployment');
      }
    } catch (error: any) {
      console.error('Trigger deployment error:', error);
      
      const errorMessage = 
        error?.data?.message || 
        error?.message || 
        'Failed to trigger deployment';
      
      setDeploymentError(errorMessage);
      setDeploymentStarted(false);
      setIsDeploying(false);
      toast.error(`Deployment failed: ${errorMessage}`);
    }
  }, [presaleId, deployContract, open]);

  // Retry deployment
  const handleRetryDeployment = useCallback(() => {
    setDeploymentError(null);
    handleTriggerDeployment();
  }, [handleTriggerDeployment]);

  // Retry payment verification
  const handleRetryPaymentVerification = useCallback(() => {
    setPaymentVerificationError(null);
    handleVerifyPayment();
  }, [handleVerifyPayment]);

  // Effect to start verification when modal opens
  useEffect(() => {
    if (open && presaleId && !paymentStatus.isVerified && !paymentVerificationError) {
      handleVerifyPayment();
    }
  }, [open, presaleId, handleVerifyPayment, paymentStatus.isVerified, paymentVerificationError]);

  // Check when both payment and detail data are available
  useEffect(() => {
    if (!open) return;

    if (
      paymentStatus.allChainsReady &&
      presaleDetailData?.data &&
      !deploymentStarted &&
      !deploymentError &&
      !isDeploying
    ) {
      checkAndTriggerDeployment();
    }
  }, [
    paymentStatus.allChainsReady,
    presaleDetailData,
    deploymentStarted,
    deploymentError,
    isDeploying,
    checkAndTriggerDeployment,
    open
  ]);

  // Check for deployment failures from API
  useEffect(() => {
    if (isDeploymentFailed && !deploymentError) {
      setDeploymentError('Deployment request failed. Please try again.');
      setIsDeploying(false);
      setDeploymentStarted(false);
    }
  }, [isDeploymentFailed, deploymentError]);

  return (
    <Dialog
      open={open}
      onOpenChange={(value)=> isModalClosable && handleModalOpenChange(value)}
    >
      <DialogContent
        className='sm:max-w-[600px] max-h-[80vh] overflow-y-auto'
        // Disable close button when deployment is successful
        showCloseButton={!!isModalClosable}
      >
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            Create launchpad successfully
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Deployment Success */}
          {deploymentStarted && !deploymentError && !isDeploying && (
            <div className='flex flex-col items-center justify-center'>
              <Image src={MissileIcon} alt='missile-icon' />
              <div className='mt-4 text-center'>
                <h3 className='text-lg font-semibold text-green-600 mb-2'>
                   Deployment Successful!
                </h3>
                <p className='text-sm text-gray-600'>
                  Your launchpad has been deployed successfully. Choose your next action below.
                </p>
              </div>
            </div>
          )}

          {/* Deployment Loading */}
          {isDeploying && (
            <div className='border rounded-lg p-4'>
              <h3 className='font-semibold mb-3 flex items-center gap-2'>
                Deploying Contract
                <RefreshCw className='w-4 h-4 animate-spin text-blue-500' />
              </h3>
              
              <div className='space-y-3'>
                <div className='flex items-center gap-2 text-blue-600'>
                  <RefreshCw className='w-4 h-4 animate-spin' />
                  <span>Deploying smart contracts to blockchain...</span>
                </div>
                <p className='text-sm text-blue-500'>
                  This process may take a few minutes. Please wait...
                </p>
              </div>
            </div>
          )}

          {/* Deployment Error */}
          {deploymentError && !isDeploying && (
            <div className='rounded-lg p-4'>
              <h3 className='font-semibold mb-3 flex items-center gap-2 text-red-700'>
                Deployment Failed
                <XCircle className='w-4 h-4 text-red-500' />
              </h3>
              
              <div className='space-y-3'>
                <div className='flex items-center gap-2 text-red-600'>
                  <XCircle className='w-4 h-4' />
                  <span>Contract deployment failed</span>
                </div>
                <Button
                  size='sm'
                  onClick={handleRetryDeployment}
                  disabled={isDeploying || isDeploymentTriggering}
                  className='w-full mt-2'
                  variant='destructive'
                >
                  {isDeploying || isDeploymentTriggering ? (
                    <>
                      <RefreshCw className='w-4 h-4 animate-spin mr-2' />
                      Retrying...
                    </>
                  ) : (
                    'Retry Deployment'
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Payment Verification Error */}
          {paymentVerificationError && !paymentStatus.isVerifying && !isVerifyingPayment && (
            <div className='rounded-lg p-4'>
              <h3 className='font-semibold mb-3 flex items-center gap-2 text-red-700'>
                Payment Verification Failed
                <XCircle className='w-4 h-4 text-red-500' />
              </h3>
              
              <div className='space-y-3'>
                <div className='flex items-center gap-2 text-red-600'>
                  <XCircle className='w-4 h-4' />
                  <span>Unable to verify payment status</span>
                </div>
                <p className='text-sm text-red-600 bg-red-100 p-2 rounded'>
                  {paymentVerificationError}
                </p>
                <Button
                  size='sm'
                  onClick={handleRetryPaymentVerification}
                  disabled={paymentStatus.isVerifying || isVerifyingPayment}
                  className='w-full mt-2'
                  variant='destructive'
                >
                  {paymentStatus.isVerifying || isVerifyingPayment ? (
                    <>
                      <RefreshCw className='w-4 h-4 animate-spin mr-2' />
                      Retrying...
                    </>
                  ) : (
                    'Retry Payment Verification'
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Payment Verification */}
          {!deploymentStarted && !deploymentError && !isDeploying && !paymentVerificationError && (
            <div className='border rounded-lg p-4'>
              <h3 className='font-semibold mb-3 flex items-center gap-2'>
                Payment Verification
                {(paymentStatus.isVerifying || isVerifyingPayment) && (
                  <RefreshCw className='w-4 h-4 animate-spin text-blue-500' />
                )}
              </h3>

              {paymentStatus.isVerifying || isVerifyingPayment ? (
                <div className='flex items-center gap-2 text-blue-600'>
                  <RefreshCw className='w-4 h-4 animate-spin' />
                  <span>Verifying payments...</span>
                </div>
              ) : paymentStatus.allChainsReady ? (
                <div className='flex items-center gap-2 text-green-600'>
                  <CheckCircle className='w-4 h-4' />
                  <span>All payments verified successfully</span>
                </div>
              ) : paymentStatus.error ? (
                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-red-600'>
                    <XCircle className='w-4 h-4' />
                    <span>Payment verification failed</span>
                  </div>
                  <p className='text-sm text-red-500 bg-red-100 p-2 rounded'>
                    {paymentStatus.error}
                  </p>
                  <Button
                    size='sm'
                    onClick={handleVerifyPayment}
                    disabled={paymentStatus.isVerifying || isVerifyingPayment}
                    variant='destructive'
                  >
                    {paymentStatus.isVerifying || isVerifyingPayment ? (
                      <>
                        <RefreshCw className='w-4 h-4 animate-spin mr-2' />
                        Retrying...
                      </>
                    ) : (
                      'Retry Verification'
                    )}
                  </Button>
                </div>
              ) : paymentStatus.chainsStatus.length > 0 ? (
                <div className='space-y-3'>
                  <div className='flex items-center gap-2 text-yellow-600 mb-2'>
                    <AlertTriangle className='w-4 h-4' />
                    <span>Some payments are still pending</span>
                  </div>

                  <Button
                    size='sm'
                    onClick={handleVerifyPayment}
                    disabled={paymentStatus.isVerifying || isVerifyingPayment}
                    className='w-full mt-2'
                  >
                    {paymentStatus.isVerifying || isVerifyingPayment ? (
                      <>
                        <RefreshCw className='w-4 h-4 animate-spin mr-2' />
                        Retrying...
                      </>
                    ) : (
                      'Retry Verification'
                    )}
                  </Button>
                </div>
              ) : (
                <div className='space-y-3'>
                  <div className='flex items-center gap-2 text-gray-600'>
                    <Clock className='w-4 h-4' />
                    <span>Payment verification pending</span>
                  </div>
                  <Button
                    size='sm'
                    onClick={handleVerifyPayment}
                    disabled={paymentStatus.isVerifying || isVerifyingPayment}
                    className='w-full'
                  >
                    {paymentStatus.isVerifying || isVerifyingPayment ? (
                      <>
                        <RefreshCw className='w-4 h-4 animate-spin mr-2' />
                        Verifying...
                      </>
                    ) : (
                      'Start Verification'
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer with Action Buttons */}
        {deploymentStarted && !deploymentError && !isDeploying && (
          <div className='flex gap-3 pt-4 border-t'>
            <Button
              variant='outline'
              onClick={onContinueCreate}
              className='flex-1'
            >
              Create Another Launchpad
            </Button>
            <Button onClick={onSeeDetail} className='flex-1'>
              View Details
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}