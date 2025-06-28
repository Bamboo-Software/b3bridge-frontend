import { Chain } from "viem/chains";
import { Address } from "viem";

export type AddressMap = {
  [chainId: number]: Address | undefined;
};

export type Token = {
  symbol: string;
  address: AddressMap;
  wrappedFrom?: string;
  logoURL: string;
  tags?: string[];
  decimals?: number;
};

export type NetworkConfig = {
  chains: {
    chain: Chain;
    logoURL?: string;
  }[];
  tokensList: Token[];
  chainSelectors: {
    [chainId: number]: string;
  };
};
