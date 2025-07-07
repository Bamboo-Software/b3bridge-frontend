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
    },
    [CryptoCurrencyEnum.USDC]: {
      address: blockChainConfig.ethereumUsdcAddress.toLowerCase(),
      isOrigin: true,
    },
  },
  [ChainId.SEI]: {
    [CryptoCurrencyEnum.ETH]: {
      address: blockChainConfig.seiEthAddress.toLowerCase(),
      isOrigin: false,
    },
    [CryptoCurrencyEnum.USDC]: {
      address: blockChainConfig.seiUsdcAddress.toLowerCase(),
      isOrigin: false,
    },
  }
};