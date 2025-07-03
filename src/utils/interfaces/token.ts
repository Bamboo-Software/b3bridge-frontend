import type { Address } from 'viem'

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

