import { WalletName, WalletType } from '@/utils/enums/wallet';
import type { WalletConfig } from '@/utils/interfaces/wallet';
import metamaskLogo from '@/assets/icons/metamask-logo.png'
import okxLogo from '@/assets/icons/okx-logo.svg'
import { ChainType } from '@/utils/enums/chain';

export const walletConfig: WalletConfig[] = [
  {
    name: WalletName.METAMASK,
    logo: metamaskLogo,
    chainKeys: 
      {
        [ChainType.EVM]: "io.metamask",
        [ChainType.Solana]: "MetaMask",
      }
    
  },
  {
    name:  WalletName.OKX,
    logo: okxLogo,
    chainKeys: 
      {
        [ChainType.EVM]: "com.okex.wallet",
        [ChainType.Solana]: "OKX Wallet",
      }
    
  }
];

export function getWalletLogoByName(name: string): string | undefined {
  return walletConfig.find(w => w.name.toLowerCase() === name.toLowerCase())?.logo;
}

export function getWalletByKey(key: string): WalletConfig | undefined {
  return walletConfig.find(w =>
    Object.values(w.chainKeys).includes(key)
  );
}

export const getWalletType = (walletName: WalletName): WalletType => {
  switch (walletName) {
    case WalletName.METAMASK:
    case WalletName.OKX:
      return WalletType.EOA;


    default:
      return WalletType.EOA; // fallback nếu không khớp
  }
};