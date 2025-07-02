import { EVM_CHAIN_IDS ,  blockChainConfig, chainImages, } from '../constants/chain';
import { wagmiConfig } from '../constants/wagmi';
import {  ChainId, ChainTokenSource, CryptoCurrencyEnum, type SUPPORTED_CHAINS_EVM } from '../enums/chain';

export function getChainDataLocal(chainId: SUPPORTED_CHAINS_EVM) {
  let chain = null

  if(isEvmChain(chainId)) chain = wagmiConfig.chains.find(c => c.id === chainId)

  return {
    name: chain?.name,
    id: chain?.id,
    logo: chainImages[chainId] || '',
  }
}

export function getChainImage({chainId, chainKey, source}: {
  chainId?: SUPPORTED_CHAINS_EVM,
  chainKey?: string,
  source?: ChainTokenSource
}) {
  if(source === ChainTokenSource.Stargate && chainKey) {
    const baseURLImage = import.meta.env.VITE_STARGATE_BASE_IMAGE_URL 
    return `${baseURLImage}/networks/${chainKey}.svg`
  } else if(source === ChainTokenSource.Local &&  chainId) {
    const chain = getChainDataLocal(chainId)
    return chain.logo
  } return ""
}

export function isEvmChain(chainId: number| string): boolean {
  return EVM_CHAIN_IDS.has(chainId);
}

export function getTokenAddressByChainIdAndTokenName(
  chainId: ChainId,
  tokenName: CryptoCurrencyEnum
): string {
  switch (chainId) {
    case ChainId.SEI:
      switch (tokenName) {
        case CryptoCurrencyEnum.USDC:
          return blockChainConfig.seiUsdcAddress;
        case CryptoCurrencyEnum.ETH:
          return blockChainConfig.seiEthAddress;
        default:
          throw new Error(`Unsupported token ${tokenName} on Avalanche`);
      }
    case ChainId.Ethereum:
      switch (tokenName) {
        case CryptoCurrencyEnum.ETH:
          return blockChainConfig.ethereumEthAddress;
        case CryptoCurrencyEnum.USDC:
          return blockChainConfig.ethereumUsdcAddress;
        default:
          throw new Error(`Unsupported token ${tokenName} on Ethereum`);
    }
    default:
      throw new Error(`Unsupported chain ID ${chainId}`);
  }
}

export function getTokenNameByChainIdAndTokenAddress(
  chainId: ChainId,
  tokenAddress: string
): CryptoCurrencyEnum {
  switch (chainId) {
    case ChainId.SEI:
      if (tokenAddress.toLowerCase() === blockChainConfig.seiUsdcAddress.toLowerCase()) {
        return CryptoCurrencyEnum.USDC;
      }
      if (tokenAddress.toLowerCase() === blockChainConfig.seiEthAddress.toLowerCase()) {
        return CryptoCurrencyEnum.ETH;
      }
      break;

    case ChainId.Ethereum:
      if (tokenAddress.toLowerCase() === blockChainConfig.ethereumUsdcAddress.toLowerCase()) {
        return CryptoCurrencyEnum.USDC;
      }
      if (tokenAddress.toLowerCase() === blockChainConfig.ethereumEthAddress.toLowerCase()) {
        return CryptoCurrencyEnum.ETH;
      }
      break;
  }

  throw new Error(`Unsupported token address ${tokenAddress} on chain ${chainId}`);
}

export function getCrossChainTokenAddress(
  fromChainId?: ChainId,
  toChainId?: ChainId,
  fromTokenAddress?: string
): string| undefined {
  if(!fromChainId || !toChainId || !fromTokenAddress) return undefined
  const tokenName = getTokenNameByChainIdAndTokenAddress(fromChainId, fromTokenAddress);
  return getTokenAddressByChainIdAndTokenName(toChainId, tokenName);
}
