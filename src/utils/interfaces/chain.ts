import type { ChainTokenSource, ChainType } from '../enums/chain'

export interface IChainInfo {
  id: number
  chainKey?: string
  name?: string
  logo?: string
  chainType?: ChainType
  nativeCurrency?: {
    name: string
    symbol: string
    decimals: number
  }
  rpcUrls?: {
    default: {
      http: string[]
    }
  }
  blockExplorers?: {
    default: {
      name: string
      url: string
      apiUrl?: string
    }
  }
  source?: ChainTokenSource
}


export interface IStargateChain {
  chainId: number
  chainKey: string
  chainType: string,
  name: string,
  nativeCurrency:{
     name: string
    symbol: string
    decimals: number
  }
  shortName: string
}

export interface LaunchpadSupportedChain {
  key: string;
  name: string;
  chainId: string;
  chainType: string;
  icon: string;
  rpcUrl: string;
  lzEndpoint: string;
}