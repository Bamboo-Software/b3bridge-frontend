'use client'

import { createConfig, http } from 'wagmi';
import { metaMask } from '@wagmi/connectors';
import { ethChain, seiChain } from './networkConfig';

export const config = createConfig({
  chains: [ethChain, seiChain],
  connectors: [metaMask()],
  transports: {
    [ethChain.id]: http(ethChain.rpcUrls.default.http[0]),
    [seiChain.id]: http(seiChain.rpcUrls.default.http[0]),
  },
});

