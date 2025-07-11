import { presaleContractAbi } from '@/utils/constants/chain';
import type { ICampaignAddresses, IContributorInfo, ICampaignBasicInfo } from '@/utils/interfaces/launchpad';
import { type Address, type Abi, erc20Abi } from 'viem';
import { useReadContract, useReadContracts } from 'wagmi';
import { writeContract, waitForTransactionReceipt } from '@wagmi/core';
import { useState } from 'react';
import { wagmiConfig } from '@/utils/constants/wallet/wagmi';

const abi = presaleContractAbi as Abi;

// Các hàm đọc contract, thêm chainId vào parameter
export function useCampaignBasicInfo(contractAddress: Address, chainId: number) {
  const { data: rawData, isLoading, error } = useReadContract({
    address: contractAddress,
    abi,
    functionName: 'getCampaignInfoBasic',
    chainId,
  });

  const data: ICampaignBasicInfo | undefined = rawData ? {
    finalized: (rawData as readonly unknown[])[0] as boolean,
    cancelled: (rawData as readonly unknown[])[1] as boolean,
    tokensDeposited: (rawData as readonly unknown[])[2] as boolean,
    useNativeToken: (rawData as readonly unknown[])[3] as boolean,
    targetAmount: (rawData as readonly unknown[])[4] as bigint,
    softCap: (rawData as readonly unknown[])[5] as bigint,
    startTime: (rawData as readonly unknown[])[6] as bigint,
    endTime: (rawData as readonly unknown[])[7] as bigint,
    totalTokens: (rawData as readonly unknown[])[8] as bigint,
    minContribution: (rawData as readonly unknown[])[9] as bigint,
    maxContribution: (rawData as readonly unknown[])[10] as bigint,
    totalRaised: (rawData as readonly unknown[])[11] as bigint,
  } : undefined;

  return { data, isLoading, error };
}

export function useCampaignAddresses(contractAddress: Address, chainId: number) {
  const { data: rawData, isLoading, error } = useReadContract({
    address: contractAddress,
    abi,
    functionName: 'getCampaignInfoAddresses',
    chainId,
  });

  const data: ICampaignAddresses | undefined = rawData ? {
    userWallet: (rawData as readonly Address[])[0],
    systemWallet: (rawData as readonly Address[])[1],
    paymentToken: (rawData as readonly Address[])[2],
    presaleTokenAddress: (rawData as readonly Address[])[3],
  } : undefined;

  return { data, isLoading, error };
}

export function useMultipleCampaignContributors(
  contracts: { contractAddress: Address; chainId: number }[]
) {
  const calls = contracts.map(({ contractAddress, chainId }) => ({
    address: contractAddress,
    abi,
    functionName: 'getContributors',
    chainId,
  }));

  const { data, isLoading, error } = useReadContracts({ contracts: calls });

  const contributors = data?.map(r =>
    Array.isArray(r.result)
      ? (r.result as IContributorInfo[]).map(contributor => ({
          wallet: contributor.wallet,
          amount: contributor.amount,
          timestamp: contributor.timestamp,
        }))
      : []
  ) ?? [];

  return {
    data: contributors,
    loading: isLoading,
    error,
  };
}

export function useCampaignOwner(contractAddress: Address, chainId: number) {
  const { data, isLoading, error } = useReadContract({
    address: contractAddress,
    abi,
    functionName: 'owner',
    chainId,
  });

  return {
    data: data as Address | undefined,
    isLoading,
    error
  };
}

export function useUserContribution(contractAddress: Address, userAddress?: Address, chainId?: number) {
  const { data, isLoading, error } = useReadContract({
    address: contractAddress,
    abi,
    functionName: 'contributions',
    args: userAddress ? [userAddress] : undefined,
    chainId,
    query: {
      enabled: !!userAddress,
    },
  });

  return {
    data: (data as bigint) || 0n,
    isLoading,
    error
  };
}

export function useUserContributionTime(contractAddress: Address, userAddress?: Address, chainId?: number) {
  const { data, isLoading, error } = useReadContract({
    address: contractAddress,
    abi,
    functionName: 'contributionTimes',
    args: userAddress ? [userAddress] : undefined,
    chainId,
    query: {
      enabled: !!userAddress,
    },
  });

  return {
    data: (data as bigint) || 0n,
    isLoading,
    error
  };
}

export function useCampaignTargetAmount(contractAddress: Address, chainId: number) {
  const { data, isLoading, error } = useReadContract({
    address: contractAddress,
    abi,
    functionName: 'targetAmount',
    chainId,
  });

  return { data: data as bigint | undefined, isLoading, error };
}

export function useCampaignTotalRaised(contractAddress: Address, chainId: number) {
  const { data, isLoading, error } = useReadContract({
    address: contractAddress,
    abi,
    functionName: 'totalRaised',
    chainId,
  });

  return { data: data as bigint | undefined, isLoading, error };
}

export function useCampaignSoftCap(contractAddress: Address, chainId: number) {
  const { data, isLoading, error } = useReadContract({
    address: contractAddress,
    abi,
    functionName: 'softCap',
    chainId,
  });

  return { data: data as bigint | undefined, isLoading, error };
}

export function useMultipleCampaignTargetAmount(
  contracts: { contractAddress: Address; chainId: number }[]
) {
  const calls = contracts.map(({ contractAddress, chainId }) => ({
    address: contractAddress,
    abi,
    functionName: 'targetAmount',
    chainId,
  }));

  const { data, isLoading, error } = useReadContracts({ contracts: calls });

  return {
    data: data?.map(r => r.result as bigint | undefined) ?? [],
    loading: isLoading,
    error,
  };
}

export function useMultipleCampaignTotalRaised(
  contracts: { contractAddress: Address; chainId: number }[]
) {
  const calls = contracts.map(({ contractAddress, chainId }) => ({
    address: contractAddress,
    abi,
    functionName: 'totalRaised',
    chainId,
  }));

  const { data, isLoading, error } = useReadContracts({ contracts: calls });

  return {
    data: data?.map(r => r.result as bigint | undefined) ?? [],
    loading: isLoading,
    error,
  };
}

export function useMultipleCampaignSoftCap(
  contracts: { contractAddress: Address; chainId: number }[]
) {
  const calls = contracts.map(({ contractAddress, chainId }) => ({
    address: contractAddress,
    abi,
    functionName: 'softCap',
    chainId,
  }));

  const { data, isLoading, error } = useReadContracts({ contracts: calls });

  return {
    data: data?.map(r => r.result as bigint | undefined) ?? [],
    loading: isLoading,
    error,
  };
}

export function useCampaignStatus(contractAddress: Address, chainId: number) {
  const { data: finalized, isLoading: finalizedLoading } = useReadContract({
    address: contractAddress,
    abi,
    functionName: 'finalized',
    chainId,
  });

  const { data: cancelled, isLoading: cancelledLoading } = useReadContract({
    address: contractAddress,
    abi,
    functionName: 'cancelled',
    chainId,
  });

  const { data: tokensDeposited, isLoading: tokensDepositedLoading } = useReadContract({
    address: contractAddress,
    abi,
    functionName: 'tokensDeposited',
    chainId,
  });

  const isLoading = finalizedLoading || cancelledLoading || tokensDepositedLoading;

  return {
    finalized: finalized as boolean,
    cancelled: cancelled as boolean,
    tokensDeposited: tokensDeposited as boolean,
    isLoading,
  };
}

// ===== WRITE FUNCTIONS USING WAGMI CORE =====

export function useApproveERC20() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const approveAsync = async (tokenAddress: Address, spender: Address, amount: bigint, chainId: number) => {
    try {
      setIsPending(true);
      setError(null);

      const hash = await writeContract(
        wagmiConfig,
        {
          address: tokenAddress,
          abi: erc20Abi,
          functionName: 'approve',
          args: [spender, amount],
          chainId,
        }
      );

      await waitForTransactionReceipt(wagmiConfig, {
        hash,
        chainId,
      });

      return hash;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return {
    approveAsync,
    isPending,
    error,
  };
}

export function useContribute() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const contributeAsync = async (contractAddress: Address, amount: bigint, chainId: number, value?: bigint) => {
    try {
      setIsPending(true);
      setError(null);

      const hash = await writeContract(
        wagmiConfig,
        {
          address: contractAddress,
          abi: abi,
          functionName: 'contribute',
          args: [amount],
          value: value,
          chainId,
        }
      );

      await waitForTransactionReceipt(wagmiConfig, {
        hash,
        chainId,
      });

      return hash;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return {
    contributeAsync,
    isPending,
    error,
  };
}

export function useClaimTokens() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const claimTokensAsync = async (contractAddress: Address, chainId: number) => {
    try {
      setIsPending(true);
      setError(null);

      const hash = await writeContract(
        wagmiConfig,
        {
          address: contractAddress,
          abi: abi,
          functionName: 'claimTokens',
          chainId,
        }
      );

      await waitForTransactionReceipt(wagmiConfig, {
        hash,
        chainId,
      });

      return hash;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return {
    claimTokensAsync,
    isPending,
    error,
  };
}

export function useFinalizeCampaign() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const finalizeCampaignAsync = async (contractAddress: Address, chainId: number) => {
    try {
      setIsPending(true);
      setError(null);

      const hash = await writeContract(
        wagmiConfig,
        {
          address: contractAddress,
          abi: abi,
          functionName: 'finalizeCampaign',
          chainId,
        }
      );

      await waitForTransactionReceipt(wagmiConfig, {
        hash,
        chainId,
      });

      return hash;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return {
    finalizeCampaignAsync,
    isPending,
    error,
  };
}

export function useCancelCampaign() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const cancelCampaignAsync = async (contractAddress: Address, chainId: number) => {
    try {
      setIsPending(true);
      setError(null);

      const hash = await writeContract(
        wagmiConfig,
        {
          address: contractAddress,
          abi: abi,
          functionName: 'cancelCampaign',
          chainId,
        }
      );

      await waitForTransactionReceipt(wagmiConfig, {
        hash,
        chainId,
      });

      return hash;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return {
    cancelCampaignAsync,
    isPending,
    error,
  };
}

export function useDepositTokens() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const depositTokensAsync = async (contractAddress: Address, chainId: number) => {
    try {
      setIsPending(true);
      setError(null);

      const hash = await writeContract(
        wagmiConfig,
        {
          address: contractAddress,
          abi: abi,
          functionName: 'depositTokens',
          chainId,
        }
      );

      await waitForTransactionReceipt(wagmiConfig, {
        hash,
        chainId,
      });

      return hash;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return {
    depositTokensAsync,
    isPending,
    error,
  };
}

export function useRefund() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refundAsync = async (contractAddress: Address, chainId: number) => {
    try {
      setIsPending(true);
      setError(null);

      const hash = await writeContract(
        wagmiConfig,
        {
          address: contractAddress,
          abi: abi,
          functionName: 'refund',
          chainId,
        }
      );

      await waitForTransactionReceipt(wagmiConfig, {
        hash,
        chainId,
      });

      return hash;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return {
    refundAsync,
    isPending,
    error,
  };
}

export function useWithdrawFunds() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const withdrawFundsAsync = async (contractAddress: Address, chainId: number) => {
    try {
      setIsPending(true);
      setError(null);

      const hash = await writeContract(
        wagmiConfig,
        {
          address: contractAddress,
          abi: abi,
          functionName: 'withdrawFunds',
          chainId,
        }
      );

      await waitForTransactionReceipt(wagmiConfig, {
        hash,
        chainId,
      });

      return hash;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return {
    withdrawFundsAsync,
    isPending,
    error,
  };
}

export function useWithdrawUnsoldTokens() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const withdrawUnsoldTokensAsync = async (contractAddress: Address, chainId: number) => {
    try {
      setIsPending(true);
      setError(null);

      const hash = await writeContract(
        wagmiConfig,
        {
          address: contractAddress,
          abi: abi,
          functionName: 'withdrawUnsoldTokens',
          chainId,
        }
      );

      await waitForTransactionReceipt(wagmiConfig, {
        hash,
        chainId,
      });

      return hash;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return {
    withdrawUnsoldTokensAsync,
    isPending,
    error,
  };
}


export function isContributor(contributors: IContributorInfo[], userAddress: Address) {
  return contributors.some(contributor =>
    contributor.wallet.toLowerCase() === userAddress.toLowerCase()
  );
}