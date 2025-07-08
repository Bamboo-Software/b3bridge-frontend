import type { Address } from 'viem'
import type { ChainType } from '../enums/chain'
import type { EntryStatus } from '../enums/entry'

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
  tokenAddress: string;
  chainType: ChainType;
  chainId: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  logoUrl: string;
  status: EntryStatus;
  isVerified: boolean;
  tags: string[];
  category: string;
  createdAt: string;
}
