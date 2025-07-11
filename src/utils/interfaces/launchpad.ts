/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Address } from 'viem';
import type { Category, DeploymentStatus, PaymentStatus, PresaleStatus } from '../enums/presale';
import type { ChainType } from '../enums/chain';

// raw data from contract
export interface IContributorInfo {
  wallet: Address;
  amount: bigint;
  timestamp: bigint;
}

export interface ICampaignBasicInfo {
  finalized: boolean;
  cancelled: boolean;
  tokensDeposited: boolean;
  useNativeToken: boolean;
  targetAmount: bigint;
  softCap: bigint;
  startTime: bigint;
  endTime: bigint;
  totalTokens: bigint;
  minContribution: bigint;
  maxContribution: bigint;
  totalRaised: bigint;
}

export interface ICampaignAddresses {
  userWallet: Address;
  systemWallet: Address;
  paymentToken: Address;
  presaleTokenAddress: Address;
}

// Payment verification response interface
export interface PresalePaymentVerificationResponse {
  presaleChainId: string;
  chainId: string;
  chainType: string;
  chainName: string;
  systemWalletAddress: string;
  paymentTokenAddress: string;
  paymentTokenSymbol: string;
  requiredAmount: string;
  amount: string;
  lastPaymentTxHash: string;
  lastPaymentAmount: string;
  lastPaymentTime: string;
  totalPaymentsReceived: number;
  readyForDeployment: boolean;
  paymentStatus: PaymentStatus;
  paymentProgress: number;
  estimatedConfirmationTime: number;
  deploymentStatus: DeploymentStatus;
  createdAt: string;
  updatedAt: string;
}

// Presale Supported Chain interface (updated to use OftToken interface)
export interface PresaleSupportedChain {
  id: string;
  presaleId: string;
  oftTokenId: string;
  oftToken: any;
  chainType: ChainType;
  chainId: string;
  contractAddress: string;
  tokenAddress: string;
  systemWalletAddress: string;
  userWalletAddress: string;
  paymentTokenAddress: string;
  softCap: string;
  hardCap: string;
  totalTokens: string;
  presaleRate: string;
  listingRate: string;
  minContribution: string;
  maxContribution: string;
  routerAddress: string;
  pairAddress: string;
  totalRaised: string;
  totalContributors: number;
  createTxHash: string;
  createBlockNumber: string;
  createGasUsed: string;
  createGasPrice: string;
  createCost: string;
  finalizeTxHash: string;
  finalizeBlockNumber: string;
  finalizeGasUsed: string;
  isFinalized: boolean;
  status: DeploymentStatus;
  deployError: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// Presale detail response interface (full detail)
export interface PresaleDetailResponse {
  id: string;
  userId: string;
  title: string;
  description: string;
  bannerUrl: string;
  softCap: string;
  hardCap: string;
  presaleRate: string;
  listingRate: string;
  startTime: string;
  endTime: string;
  minContribution: string;
  maxContribution: string;
  liquidityPercent: number;
  liquidityLockDays: number;
  vestingEnabled: boolean;
  vestingFirstReleasePercent: number;
  vestingCycleDays: number;
  vestingEachCyclePercent: number;
  whitelistEnabled: boolean;
  publicStartTime: string;
  fundRecipientAddress: string;
  fundRecipientChainType: ChainType;
  fundRecipientChainId: string;
  totalRaised: string;
  totalContributors: number;
  firstCreateTxHash: string;
  firstCreateBlockNumber: string;
  firstCreateGasUsed: string;
  firstCreateGasPrice: string;
  firstCreateCost: string;
  isFinalized: boolean;
  finalizeTime: string;
  status: PresaleStatus;
  cancelReason: string;
  tags: string[];
  category: Category;
  createdAt: string;
  updatedAt: string;
  supportedChains: PresaleSupportedChain[];
}

// Presale list item interface (simplified for list view)
export interface PresaleListItem {
  id: string;
  title: string;
  description: string;
  bannerUrl: string;
  softCap: string;
  hardCap: string;
  totalRaised: string;
  startTime: string;
  endTime: string;
  status: PresaleStatus;
  category: Category;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  supportedChains: PresaleSupportedChain[];
}

// Presale list response interface
export interface PresaleListResponse {
  total: number;
  items: PresaleListItem[];
}



// Presale Component internal state interfaces
export interface PresalePaymentVerificationStatus {
  isVerified: boolean;
  isVerifying: boolean;
  allChainsReady: boolean;
  chainsStatus: Array<{
    chainId: string;
    chainName: string;
    paymentStatus: PaymentStatus;
    readyForDeployment: boolean;
    paymentProgress: number;
    requiredAmount: string;
    amount: string;
  }>;
  error?: string;
}

export interface PresaleChainDeploymentStatus {
  chainId: string;
  chainName: string;
  status: DeploymentStatus;
  contractAddress?: string;
  tokenAddress?: string;
  deployError?: string;
  createTxHash?: string;
  isFinalized: boolean;
}

export type ContributorRow = {
  address: string;
  [chainKey: string]: string | number;
};