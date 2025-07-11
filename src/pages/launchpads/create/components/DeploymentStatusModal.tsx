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
}

export function DeploymentStatusModal({
  open,
  presaleId,
  onContinueCreate,
  onSeeDetail,
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
  const [isDeploying, setIsDeploying] = useState(false); // Thêm state cho loading deployment

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
  } = useVerifyPaymentPreSalesQuery(
    { presaleId },
    { skip: !open || !presaleId }
  );

  // Get presale detail to check status
  const { data: presaleDetailData, refetch: refetchDetail } =
    useGetDetailPreSalesQuery({ presaleId }, { skip: !open || !presaleId });

  const [deployContract, { isLoading: isDeploymentTriggering }] = useDeployContractPreSalesMutation();

  // Process payment verification data
  useEffect(() => {
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
      
      if (allChainsReady && !deploymentStarted && !deploymentError && !isDeploying) {
        toast.success('All payments verified successfully!');
        // Check presale detail status before triggering deployment
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
  }, [paymentVerificationData, deploymentStarted, deploymentError, isDeploying]);

  // Check presale status and trigger deployment if needed
  const checkAndTriggerDeployment = useCallback(async () => {
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
  }, [presaleDetailData, deploymentStarted, deploymentError, isDeploying]);

  // Verify payment function
  const handleVerifyPayment = useCallback(async () => {
    try {
      setPaymentStatus((prev) => ({
        ...prev,
        isVerifying: true,
        error: undefined,
      }));

      await refetchPaymentVerification();
      
      // Sau khi verify xong, set isVerifying về false
      setPaymentStatus((prev) => ({
        ...prev,
        isVerifying: false,
      }));
      
    } catch (error: any) {
      console.error('Payment verification error:', error);
      setPaymentStatus((prev) => ({
        ...prev,
        isVerifying: false,
        error: error.message || 'Failed to verify payment',
      }));
      toast.error('Failed to verify payment');
    }
  }, [refetchPaymentVerification]);

  // Trigger deployment
  const handleTriggerDeployment = useCallback(async () => {
    try {
      setIsDeploying(true); // Bắt đầu loading
      setDeploymentError(null);

      const result = await deployContract({ presaleId }).unwrap();

      if (result) {
        setDeploymentStarted(true);
        setIsDeploying(false); // Kết thúc loading
        toast.success('Contract deployment started successfully!');
      } else {
        throw new Error('Failed to trigger deployment');
      }
    } catch (error: any) {
      console.error('Trigger deployment error:', error);
      const errorMessage = error.message || 'Failed to trigger deployment';
      setDeploymentError(errorMessage);
      setDeploymentStarted(false);
      setIsDeploying(false); // Kết thúc loading
      toast.error(errorMessage);
    }
  }, [presaleId, deployContract]);

  // Retry deployment
  const handleRetryDeployment = useCallback(() => {
    setDeploymentError(null);
    handleTriggerDeployment();
  }, [handleTriggerDeployment]);

  // Effect to start verification when modal opens
  useEffect(() => {
    if (open && presaleId && !paymentStatus.isVerified) {
      handleVerifyPayment();
    }
  }, [open, presaleId, handleVerifyPayment, paymentStatus.isVerified]);

  // Check when both payment and detail data are available
  useEffect(() => {
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
  ]);

  return (
    <Dialog
      open={open}
      onOpenChange={() => {}}
    >
      <DialogContent
        className='sm:max-w-[600px] max-h-[80vh] overflow-y-auto [&>button]:hidden'
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()} 
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
            <div className='border rounded-lg p-4'>
              <h3 className='font-semibold mb-3 flex items-center gap-2'>
                Deployment Failed
                <XCircle className='w-4 h-4 text-red-500' />
              </h3>
              
              <div className='space-y-3'>
                <div className='flex items-center gap-2 text-red-600'>
                  <XCircle className='w-4 h-4' />
                  <span>Contract deployment failed</span>
                </div>
                <p className='text-sm text-red-500'>{deploymentError}</p>
                <Button
                  size='sm'
                  onClick={handleRetryDeployment}
                  disabled={isDeploying || isDeploymentTriggering}
                  className='w-full mt-2'
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

          {/* Payment Verification */}
          {!deploymentStarted && !deploymentError && !isDeploying && (
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
                  <p className='text-sm text-red-500'>{paymentStatus.error}</p>
                  <Button
                    size='sm'
                    onClick={handleVerifyPayment}
                    disabled={paymentStatus.isVerifying || isVerifyingPayment}
                  >
                    Retry Verification
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
                    Retry Verification
                  </Button>
                </div>
              ) : (
                <div className='flex items-center gap-2 text-gray-600'>
                  <Clock className='w-4 h-4' />
                  <span>Payment verification pending</span>
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
              Create Launchpad
            </Button>
            <Button onClick={onSeeDetail} className='flex-1'>
              See details
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}