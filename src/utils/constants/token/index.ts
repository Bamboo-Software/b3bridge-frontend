import { blockChainConfig } from '../chain';
import usdtLogo from '@/assets/icons/usdc-logo.png';
import ethLogo from '@/assets/icons/ethereum-logo.svg';
import wethLogo from '@/assets/icons/weth-logo.png';
import { CryptoCurrencyEnum, ChainId } from '@/utils/enums/chain';


export const TokenImages: Record<string, string> = {
  [blockChainConfig.ethereumEthAddress.toLowerCase()]: ethLogo,
  [blockChainConfig.ethereumUsdcAddress.toLowerCase()]: usdtLogo,
  [blockChainConfig.seiEthAddress.toLowerCase()]: wethLogo,
  [blockChainConfig.seiUsdcAddress.toLowerCase()]: usdtLogo,
}

export const SUPPORTED_TOKENS_BY_CHAIN: Record<ChainId, CryptoCurrencyEnum[]> = {
  [ChainId.Ethereum]: [CryptoCurrencyEnum.ETH, CryptoCurrencyEnum.USDC],
  [ChainId.SEI]: [CryptoCurrencyEnum.ETH, CryptoCurrencyEnum.USDC]
};

export interface TokenMeta {
  address: string;
  isOrigin: boolean;
  // isNative: boolean;
}
export const tokenMetaByChainAndSymbol: Record<ChainId, Partial<Record<CryptoCurrencyEnum, TokenMeta>>> = {
  [ChainId.Ethereum]: {
    [CryptoCurrencyEnum.ETH]: {
      address: blockChainConfig.ethereumEthAddress.toLowerCase(),
      isOrigin: true,
      // isNative: true,
    },
    [CryptoCurrencyEnum.USDC]: {
      address: blockChainConfig.ethereumUsdcAddress.toLowerCase(),
      isOrigin: true,
      // isNative: false,
    },
  },
  [ChainId.SEI]: {
    [CryptoCurrencyEnum.wETH]: {
      address: blockChainConfig.seiEthAddress.toLowerCase(),
      isOrigin: false,
      // isNative: false,
    },
    [CryptoCurrencyEnum.wUSDC]: {
      address: blockChainConfig.seiUsdcAddress.toLowerCase(),
      isOrigin: false,
      // isNative: false,
    },
  }
};