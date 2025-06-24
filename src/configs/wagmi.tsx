'use client'

import { createConfig, http, webSocket, fallback } from 'wagmi';
import { metaMask } from '@wagmi/connectors';
import { ethChain, seiChain } from './networkConfig';

export const config = createConfig({
  chains: [ethChain, seiChain],
  connectors: [metaMask()],
  transports: {
    [ethChain.id]: fallback([
      webSocket(process.env.NEXT_PUBLIC_ETH_CHAIN_WS_URL!),
      http(process.env.NEXT_PUBLIC_ETH_CHAIN_RPC_URL!),
    ]),
    [seiChain.id]: fallback([
      webSocket(process.env.NEXT_PUBLIC_SEI_CHAIN_WS_URL!),
      http(process.env.NEXT_PUBLIC_SEI_CHAIN_RPC_URL!),
    ]),
  },
});
