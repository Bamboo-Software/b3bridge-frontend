/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { 
  useVerifyPaymentMutation, 
  useDeployTokenMutation 
} from '@/services/pre-sale/create-token';
import { toast } from 'sonner';
import { getErrorMessage } from '@/utils/errors';
import { PaymentStatus } from '@/utils/enums/presale';

interface DeployTokenModalProps {
  open: boolean;
  tokenIds: string[];
  onClose: () => void;
  onSuccess: (deployedTokens: any[]) => void;
}

interface TokenVerificationStatus {
  tokenId: string;
  chainId?: string;
  chainName?: string;
  paymentStatus: PaymentStatus;
  readyForDeployment: boolean;
  paymentProgress: number;
  requiredAmount: string;
  amount: string;
  verifying?: boolean;
  verifyError?: string;
}

interface TokenDeploymentStatus {
  tokenId: string;
  chainId?: string;
  chainName?: string;
  deploying?: boolean;
  deployed?: boolean;
  deployError?: string;
  tokenAddress?: string;
}

interface PaymentStatusState {
  isVerified: boolean;
  allTokensReady: boolean;
  tokensStatus: TokenVerificationStatus[];
  isVerifying: boolean;
  error?: string;
}

interface DeploymentState {
  isDeploying: boolean;
  deploymentStarted: boolean;
  deploymentCompleted: boolean;
  tokensDeployment: TokenDeploymentStatus[];
  deploymentError?: string;
}

export function DeployTokenModal({
  open,
  tokenIds,
  onClose,
  onSuccess
}: DeployTokenModalProps) {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusState>({
    isVerified: false,
    allTokensReady: false,
    tokensStatus: [],
    isVerifying: false,
  });

  const [deploymentState, setDeploymentState] = useState<DeploymentState>({
    isDeploying: false,
    deploymentStarted: false,
    deploymentCompleted: false,
    tokensDeployment: [],
  });

  const [verifyTokenPayment] = useVerifyPaymentMutation();
  const [deployToken] = useDeployTokenMutation();

  // Start payment verification when modal opens
  useEffect(() => {
    if (open && tokenIds.length > 0 && !paymentStatus.isVerified) {
      startBatchPaymentVerification();
    }
  }, [open, tokenIds]);

  const startBatchPaymentVerification = async () => {
    try {
      setPaymentStatus(prev => ({ 
        ...prev, 
        isVerifying: true, 
        error: undefined,
        tokensStatus: tokenIds.map(tokenId => ({
          tokenId,
          paymentStatus: PaymentStatus.PENDING,
          readyForDeployment: false,
          paymentProgress: 0,
          requiredAmount: '0',
          amount: '0',
          verifying: true,
        }))
      }));

      // Verify all tokens in parallel
      const verificationPromises = tokenIds.map(async (tokenId) => {
        try {
          // Update individual token status to verifying
          setPaymentStatus(prev => ({
            ...prev,
            tokensStatus: prev.tokensStatus.map(token =>
              token.tokenId === tokenId
                ? { ...token, verifying: true, verifyError: undefined }
                : token
            )
          }));

          const result = await verifyTokenPayment(tokenId).unwrap();
          if (result?.data) {
            const tokenData = result.data;
            setPaymentStatus(prev => ({
              ...prev,
              tokensStatus: prev.tokensStatus.map(token =>
                token.tokenId === tokenId
                  ? {
                      ...token,
                      paymentStatus: tokenData.paymentStatus,
                      readyForDeployment: tokenData.readyForDeployment,
                      paymentProgress: tokenData.paymentProgress,
                      requiredAmount: tokenData.requiredAmount,
                      amount: tokenData.amount,
                      chainId: tokenData.chainId,
                      chainName: tokenData.chainName,
                      verifying: false,
                      verifyError: undefined,
                    }
                  : token
              )
            }));

            return {
              tokenId,
              success: true,
              data: tokenData
            };
          } else {
            throw new Error('Invalid verification response');
          }
        } catch (error: any) {
          console.error(`Verification failed for token ${tokenId}:`, error);
          const errorMessage = getErrorMessage(error, 'Verification failed');
          
          // Update individual token status with error
          setPaymentStatus(prev => ({
            ...prev,
            tokensStatus: prev.tokensStatus.map(token =>
              token.tokenId === tokenId
                ? {
                    ...token,
                    verifying: false,
                    verifyError: errorMessage,
                    paymentStatus: PaymentStatus.FAILED,
                  }
                : token
            )
          }));

          return {
            tokenId,
            success: false,
            error: errorMessage
          };
        }
      });

      // Wait for all verifications to complete
      const verificationResults = await Promise.allSettled(verificationPromises);
      
      // Process results
      const successfulVerifications = verificationResults
        .filter(result => result.status === 'fulfilled' && result.value.success)
        .map(result => (result as PromiseFulfilledResult<any>).value);

      const failedVerifications = verificationResults
        .filter(result => result.status === 'rejected' || 
                (result.status === 'fulfilled' && !result.value.success));

      // Update final verification status
      const allTokensReady = successfulVerifications.length === tokenIds.length &&
        successfulVerifications.every(result => 
          result.data.readyForDeployment && 
          result.data.paymentStatus === PaymentStatus.COMPLETED
        );

      const finalVerificationData = {
        isVerifying: false,
        isVerified: allTokensReady,
        allTokensReady,
        error: failedVerifications.length > 0 ? 
          `${failedVerifications.length} token(s) failed verification` : undefined,
      };

      setPaymentStatus(prev => ({
        ...prev,
        ...finalVerificationData
      }));

      if (allTokensReady) {
        toast.success('All payments verified successfully!');
        // Auto start deployment with fresh verification data
        setTimeout(() => {
          startBatchDeployment(successfulVerifications);
        }, 1000);
      } else if (failedVerifications.length > 0) {
        toast.error(`${failedVerifications.length} token(s) failed verification`);
      } else {
        const pendingTokens = successfulVerifications.filter(result => 
          !result.data.readyForDeployment || 
          result.data.paymentStatus !== PaymentStatus.COMPLETED
        );
        toast.warning(`${pendingTokens.length} token(s) still pending payment verification`);
      }

    } catch (error: any) {
      console.error('Batch verification error:', error);
      const errorMessage = getErrorMessage(error, 'Failed to verify payments');
      setPaymentStatus(prev => ({
        ...prev,
        isVerifying: false,
        error: errorMessage,
      }));
      toast.error(errorMessage);
    }
  };

  const startBatchDeployment = async (verifiedTokensData?: any[]) => {
    if (deploymentState.deploymentStarted || deploymentState.isDeploying) return;

    try {
      // Get verified token IDs - use passed data or current state
      let verifiedTokenIds: string[];
      let tokensStatusForDeployment: TokenVerificationStatus[];

      if (verifiedTokensData) {
        // Called from verification with fresh data
        verifiedTokenIds = verifiedTokensData
          .filter(result => 
            result.data.readyForDeployment && 
            result.data.paymentStatus === PaymentStatus.COMPLETED
          )
          .map(result => result.tokenId);
        
        tokensStatusForDeployment = verifiedTokensData.map(result => ({
          tokenId: result.tokenId,
          chainId: result.data.chainId,
          chainName: result.data.chainName,
          paymentStatus: result.data.paymentStatus,
          readyForDeployment: result.data.readyForDeployment,
          paymentProgress: result.data.paymentProgress,
          requiredAmount: result.data.requiredAmount,
          amount: result.data.amount,
        }));
      } else {
        // Called independently - use current state
        verifiedTokenIds = paymentStatus.tokensStatus
          .filter(token => token.readyForDeployment && token.paymentStatus === PaymentStatus.COMPLETED)
          .map(token => token.tokenId);
        
        tokensStatusForDeployment = paymentStatus.tokensStatus;
      }

      if (verifiedTokenIds.length === 0) {
        throw new Error('No verified tokens found for deployment');
      }

      setDeploymentState(prev => ({
        ...prev,
        deploymentStarted: true,
        isDeploying: true,
        deploymentError: undefined,
        tokensDeployment: verifiedTokenIds.map(tokenId => {
          const tokenStatus = tokensStatusForDeployment.find(t => t.tokenId === tokenId);
          return {
            tokenId,
            chainId: tokenStatus?.chainId,
            chainName: tokenStatus?.chainName,
            deploying: true,
            deployed: false,
          };
        })
      }));

      try {
        // Deploy all verified tokens at once
        const result = await deployToken({ tokenIds: verifiedTokenIds }).unwrap();
        
        if (result?.data && Array.isArray(result.data) && result.data.length > 0) {
          const deploymentData = result.data;
          
          // Update all tokens deployment status with success
          setDeploymentState(prev => ({
            ...prev,
            tokensDeployment: prev.tokensDeployment.map(token => {
              const deployedToken = deploymentData.find(d => d.id === token.tokenId);
              return deployedToken ? {
                ...token,
                deploying: false,
                deployed: true,
                tokenAddress: deployedToken.tokenAddress,
                chainId: deployedToken.chainId,
              } : {
                ...token,
                deploying: false,
                deployError: 'No deployment data found',
              };
            })
          }));

          // Check if all tokens were successfully deployed
          const allDeployed = deploymentData.length === verifiedTokenIds.length;

          setDeploymentState(prev => ({
            ...prev,
            isDeploying: false,
            deploymentCompleted: allDeployed,
            deploymentError: !allDeployed ? 
              `${verifiedTokenIds.length - deploymentData.length} token(s) failed deployment` : undefined,
          }));

          if (allDeployed) {
            toast.success('All tokens deployed successfully!');
            
            // Auto close and trigger success after a short delay
            setTimeout(() => {
              onSuccess(deploymentData);
            }, 1500);
          } else {
            toast.error(`${verifiedTokenIds.length - deploymentData.length} token(s) failed deployment`);
          }

        } else {
          throw new Error('Invalid deployment response');
        }
      } catch (error: any) {
        console.error('Deployment failed:', error);
        const errorMessage = getErrorMessage(error, 'Deployment failed');
        
        // Update all tokens deployment status with error
        setDeploymentState(prev => ({
          ...prev,
          isDeploying: false,
          deploymentError: errorMessage,
          tokensDeployment: prev.tokensDeployment.map(token => ({
            ...token,
            deploying: false,
            deployError: errorMessage,
          }))
        }));

        toast.error(errorMessage);
      }

    } catch (error: any) {
      console.error('Batch deployment error:', error);
      const errorMessage = getErrorMessage(error, 'Failed to deploy tokens');
      setDeploymentState(prev => ({
        ...prev,
        isDeploying: false,
        deploymentError: errorMessage,
      }));
      toast.error(errorMessage);
    }
  };

  const handleRetryVerification = () => {
    setPaymentStatus(prev => ({
      ...prev,
      error: undefined,
      isVerifying: false,
      isVerified: false,
      tokensStatus: [],
    }));
    startBatchPaymentVerification();
  };

  const handleRetryDeployment = () => {
    setDeploymentState(prev => ({
      ...prev,
      deploymentError: undefined,
      deploymentStarted: false,
      isDeploying: false,
      tokensDeployment: [],
    }));
    startBatchDeployment(); // Call without parameters to use current state
  };

  const getStatusIcon = (status: PaymentStatus | string, isLoading?: boolean) => {
    if (isLoading) {
      return <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />;
    }
    
    switch (status) {
      case PaymentStatus.COMPLETED:
      case 'deployed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case PaymentStatus.PENDING:
      case 'deploying':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case PaymentStatus.FAILED:
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getCurrentStep = () => {
    if (deploymentState.deploymentCompleted) return 'completed';
    if (deploymentState.isDeploying || deploymentState.deploymentStarted) return 'deploying';
    if (deploymentState.deploymentError && paymentStatus.isVerified) return 'deployment-error';
    if (paymentStatus.isVerified) return 'ready';
    if (paymentStatus.isVerifying) return 'verifying';
    if (paymentStatus.error) return 'verification-error';
    return 'initial';
  };

  const currentStep = getCurrentStep();
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="!max-w-4xl bg-[var(--gray-night)] max-h-[90%] overflow-y-auto text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            Deploy OFT Tokens
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-6">
            <div className={`flex items-center gap-2 ${
              ['verifying', 'ready', 'deploying', 'completed', 'deployment-error'].includes(currentStep) 
                ? 'text-foreground' : 'text-gray-500'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                ['ready', 'deploying', 'completed', 'deployment-error'].includes(currentStep)
                  ? 'bg-green-500' : ['verifying'].includes(currentStep)
                  ? 'bg-blue-500' : 'bg-gray-600'
              }`}>
                {['verifying'].includes(currentStep) ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <span className="text-sm font-semibold">1</span>
                )}
              </div>
              <span className="text-sm font-medium">Verify Payments</span>
            </div>

            <div className="flex-1 h-0.5 bg-gray-600 mx-4" />

            <div className={`flex items-center gap-2 ${
              ['deploying', 'completed', 'deployment-error'].includes(currentStep) 
                ? 'text-foreground' : 'text-gray-500'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                ['completed'].includes(currentStep)
                  ? 'bg-green-500' : ['deploying'].includes(currentStep)
                  ? 'bg-blue-500' : ['deployment-error'].includes(currentStep)
                  ? 'bg-red-500' : 'bg-gray-600'
              }`}>
                {['deploying'].includes(currentStep) ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : ['deployment-error'].includes(currentStep) ? (
                  <XCircle className="w-4 h-4" />
                ) : (
                  <span className="text-sm font-semibold">2</span>
                )}
              </div>
              <span className="text-sm font-medium">Deploy Tokens</span>
            </div>
          </div>

          {/* Status Content */}
          {currentStep === 'verifying' && (
            <div className="text-center py-8">
              <RefreshCw className="w-12 h-12 animate-spin text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Verifying Payments</h3>
              <p className="text-gray-400">
                Verifying payments for {tokenIds.length} token(s) across all chains...
              </p>
            </div>
          )}

          {currentStep === 'ready' && (
            <div className="space-y-4">
              <div className="text-center py-4">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Payments Verified</h3>
                <p className="text-gray-400">All payments have been verified successfully.</p>
              </div>
            </div>
          )}

          {currentStep === 'deploying' && (
            <div className="text-center py-8">
              <RefreshCw className="w-12 h-12 animate-spin text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Deploying Tokens</h3>
              <p className="text-gray-400">
                Deploying {deploymentState.tokensDeployment.length} OFT token(s) across selected chains...
              </p>
            </div>
          )}

          {currentStep === 'completed' && (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Deployment Complete!</h3>
              <p className="text-gray-400">
                Your OFT tokens have been successfully deployed.
              </p>
            </div>
          )}

          {currentStep === 'verification-error' && (
            <div className="text-center py-8">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Verification Error</h3>
              <p className="text-red-400 mb-4">
                {paymentStatus.error}
              </p>
              <Button onClick={handleRetryVerification} variant="outline">
                Retry Verification
              </Button>
            </div>
          )}

          {currentStep === 'deployment-error' && (
            <div className="text-center py-8">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Deployment Error</h3>
              <p className="text-red-400 mb-4">
                {deploymentState.deploymentError}
              </p>
              <Button onClick={handleRetryDeployment} variant="outline">
                Retry Deployment
              </Button>
            </div>
          )}

          {/* Token Status List */}
          {(paymentStatus.tokensStatus.length > 0 || deploymentState.tokensDeployment.length > 0) && (
            <div className="space-y-3">
              <h4 className="font-semibold">Token Status:</h4>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {/* Show verification status during verification phase */}
                {currentStep === 'verifying' && paymentStatus.tokensStatus.map((token, index) => (
                  <div
                    key={token.tokenId || index}
                    className="flex items-center justify-between p-3 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(token.paymentStatus, token.verifying)}
                      <div>
                        <p className="font-medium">
                          {token.chainName || `Chain ${token.chainId}` || `Token ${index + 1}`}
                        </p>
                        <p className="text-sm text-gray-400">
                          Token ID: {token.tokenId}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm capitalize">
                        {token.verifying ? 'Verifying...' : 
                         token.verifyError ? 'Failed' :
                         token.paymentStatus.toLowerCase()}
                      </p>
                      {token.verifyError && (
                        <p className="text-xs text-red-400 max-w-32 truncate">
                          {token.verifyError}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Show deployment status during deployment phase */}
                {['deploying', 'completed', 'deployment-error'].includes(currentStep) && deploymentState.tokensDeployment.map((token, index) => (
                  <div
                    key={token.tokenId || index}
                    className="flex items-center justify-between p-3 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(
                        token.deployed ? 'deployed' : token.deployError ? 'failed' : 'deploying',
                        token.deploying
                      )}
                      <div>
                        <p className="font-medium">
                          {token.chainName || `Chain ${token.chainId}` || `Token ${index + 1}`}
                        </p>
                        <p className="text-sm text-gray-400">
                          Token ID: {token.tokenId}
                        </p>
                        {token.tokenAddress && (
                          <p className="text-xs text-blue-400">
                            Address: {token.tokenAddress.slice(0, 10)}...
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm capitalize">
                        {token.deploying ? 'Deploying...' : 
                         token.deployed ? 'Deployed' :
                         token.deployError ? 'Failed' : 'Pending'}
                      </p>
                      {token.deployError && (
                        <p className="text-xs text-red-400 max-w-32 truncate">
                          {token.deployError}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Show final verification status for ready/verification-error states */}
                {['ready', 'verification-error'].includes(currentStep) && !['deploying', 'completed', 'deployment-error'].includes(currentStep) && 
                 paymentStatus.tokensStatus.map((token, index) => (
                  <div
                    key={token.tokenId || index}
                    className="flex items-center justify-between p-3 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(token.paymentStatus)}
                      <div>
                        <p className="font-medium">
                          {token.chainName || `Chain ${token.chainId}` || `Token ${index + 1}`}
                        </p>
                        <p className="text-sm text-gray-400">
                          Token ID: {token.tokenId}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm capitalize">
                        {token.paymentStatus.toLowerCase()}
                      </p>
                      {token.paymentProgress > 0 && (
                        <p className="text-xs text-gray-400">
                          {token.paymentProgress}%
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DeployTokenModal;