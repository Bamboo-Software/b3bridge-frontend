import { Address } from 'viem';
export const CONTRACT_ADDRESSES = {
  ethereum: {
     bridge: process.env.NEXT_PUBLIC_ETH_BRIDGE_CONTRACT as Address,
  },
  sei: {
    bridge:process.env.NEXT_PUBLIC_SEI_BRIDGE_CONTRACT as Address
  },

} as const;
export type SupportedChain = keyof typeof CONTRACT_ADDRESSES;
