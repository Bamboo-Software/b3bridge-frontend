'use client'

import { createConfig, http } from 'wagmi';
import { metaMask } from '@wagmi/connectors';
import { ethChain, seiChain } from './networkConfig';

export const config = createConfig({
  chains: [ethChain, seiChain],
  connectors: [metaMask()],
  transports: {
    [ethChain.id]: http(process.env.NEXT_PUBLIC_ETH_CHAIN_RPC_URL!),
    [seiChain.id]: http(process.env.NEXT_PUBLIC_SEI_CHAIN_RPC_URL!),
  },
});

