import { readContract } from '@wagmi/core'
import { erc20Abi, zeroAddress, type Address } from 'viem'

import { getChainNameByChainId, isEvmChain } from './chain'
import { wagmiConfig } from '../constants/wagmi'
import { BlockchainNameEnum, ChainTokenSource, type SUPPORTED_CHAINS_EVM } from '../enums/chain'
import { TokenImages } from '../constants/token'


export async function getTokenSymbolAndDecimals(
  tokenAddress: `0x${string}`,
  chainId: SUPPORTED_CHAINS_EVM
) {
  const native = getChainNameByChainId(chainId);
  console.log("🚀 ~ native:", native)
  if (!tokenAddress || tokenAddress === zeroAddress) {
    if (native) {
      return native;
    }
    console.warn('Invalid or native token address but no mapping found');
    return null;
  }
  try {
    const [symbol, decimals] = await Promise.all([
      readContract(wagmiConfig, {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'symbol',
        chainId,
        args: [],
      }),
      readContract(wagmiConfig, {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'decimals',
        chainId,
        args: [],
      }),
    ]);

    return {
      symbol,
      decimals: Number(decimals),
    };
  } catch (err) {
    console.error('Failed to read token info:', err);
    return null;
  }
}


export async function getTokenData(chainId: SUPPORTED_CHAINS_EVM, tokenAddress: Address) {
  let tokenData: BlockchainNameEnum | { symbol: string; decimals: number } | null = null;

  if (isEvmChain(chainId)) {
    tokenData = await getTokenSymbolAndDecimals(tokenAddress, chainId);
  }
  if (tokenData && typeof tokenData === 'object' && 'symbol' in tokenData && 'decimals' in tokenData) {
    return {
      symbol: tokenData.symbol,
      decimals: tokenData.decimals,
      logo: TokenImages[tokenAddress.toLowerCase()] || '',
    };
  }

  return {
    symbol: typeof tokenData === 'string' ? tokenData : '',
    decimals: 18,
    logo: TokenImages[tokenAddress.toLowerCase()] || '',
  };
}


export  function getTokenImage({source, symbol, chainId, tokenAddress}: {
  symbol?:string,
  source?: ChainTokenSource,
  chainId?: SUPPORTED_CHAINS_EVM, 
  tokenAddress: Address
}) {
  if(source === ChainTokenSource.Stargate && symbol) {
    const baseURLImage = import.meta.env.VITE_STARGATE_BASE_IMAGE_URL 
    return `${baseURLImage}/tokens/${symbol.toLowerCase()}.svg`
  } else if(source === ChainTokenSource.Local && chainId) {
    return  TokenImages[tokenAddress]
  } return ""
}

