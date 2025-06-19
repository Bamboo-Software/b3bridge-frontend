'use client'

import { http, createConfig, webSocket } from 'wagmi'
import {
  mainnet,
  sepolia,
} from 'wagmi/chains'
import { metaMask } from '@wagmi/connectors';
import { seiTestnet } from './networkConfig';
export const config = createConfig({
  chains: [
    mainnet,
    sepolia,
    seiTestnet
  ],
  connectors: [metaMask()
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [seiTestnet.id]: http(seiTestnet.rpcUrls.default.http[0])
  }
})
