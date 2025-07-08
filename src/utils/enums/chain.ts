import { mainnet, sepolia, sei, seiTestnet, bsc, bscTestnet, avalanche, avalancheFuji } from '@wagmi/core/chains'
import { appConfig } from '../constants/app';

export enum ChainId {
  Ethereum = (appConfig.isProd ? mainnet.id : sepolia.id),
  SEI = (appConfig.isProd ? sei.id : seiTestnet.id),
  BSC = (appConfig.isProd ? bsc.id : bscTestnet.id),
  AVALANCHE = (appConfig.isProd ? avalanche.id : avalancheFuji.id),
}


export enum BlockchainNameEnum {
  ethereum = 'ETH',
  sei = 'SEI',
}

export enum CryptoCurrencyEnum {
  ETH = "ETH",
  USDC = "USDC",
}


export type SUPPORTED_CHAINS_EVM =  ChainId.Ethereum | ChainId.SEI;


export enum ChainType {
  EVM = 'Evm',
  Solana = 'Solana',
}

export enum ChainTokenSource {
  Stargate = 'Stargate',
  Local = 'Local',
}
