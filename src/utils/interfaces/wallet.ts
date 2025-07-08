
import type { ChainType } from '../enums/chain';
import type { WalletName } from '../enums/wallet';

export interface WalletConfig {
  name: WalletName;
  logo: string; 
  chainKeys: {
    [key in ChainType]: string;
  };
}
