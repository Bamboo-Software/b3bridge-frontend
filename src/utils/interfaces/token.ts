import type { Address } from 'viem'
import type { ChainType } from '../enums/chain'

export interface ITokenInfo {
  chainId: number
  address: Address
  symbol: string
  decimals: number
  logo: string
  chainKey: string
  priceUsd?: string
  isOrigin?: boolean,
}

export interface ITokenStargateInfo {
  isBridgeable: boolean,
  chainKey: string,
  address: string,
  decimals: number,
  symbol: string,
  name: string,
  price: {
    usd: number
  }
}

export interface ITokenOFT {
  id: string;
  chainId: string;
  chainType: ChainType;
  chainName: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  description: string;
  website: string;
  logoUrl: string;
  whitepaper: string;
  telegram: string;
  twitter: string;
  discord: string;
  github: string;
  status: string;
  category: string;
  tags: string[];
  systemWalletAddress: string;
  paymentTokenAddress: string;
  paymentTokenSymbol: string;
  deployFee: string;
  deployTxHash: string;
  platformFee: string;
  estimatedDeploymentTime: number;
  oftVersion: string;
  sendFee: number;
  receiveFee: number;
  minGasToTransfer: number;
  createdAt: string;
  updatedAt: string;
}
export interface CreateTokenPayload {
  name: string;
  symbol: string;
  decimals: number;
  description?: string;
  website?: string;
  whitepaper?: string;
  telegram?: string;
  twitter?: string;
  discord?: string;
  github?: string;
  category?: string;
  tags?: string[];
  targetChains: string[];
  tokenType: "OFT";
  totalSupply: string;
  logo: string;
  chainFields?: Record<
    string,
    {
      totalSupply: string;
      transactions?: {
        native?: {
          gasEstimate: number;
          gasPrice: number;
        };
        oft?: {
          gasEstimate: number;
          gasPrice: number;
        };
      };
    }
  >;
}
export interface BaseApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T
}
export interface ITokenGroup {
  groupId: string;
  tokens: ITokenOFT[];
  totalTokensInGroup: number;
  name: string;
  symbol: string;
  decimals: number;
  description: string;
  logoUrl: string;
  category: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface IGetListTokenResponse {
  total: number;
  totalTokens: number;
  items: ITokenGroup[];
}