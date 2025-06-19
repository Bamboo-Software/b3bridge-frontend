'use client'

import { http, createConfig, webSocket } from 'wagmi'
import {
  mainnet,
} from 'wagmi/chains'
import { metaMask } from '@wagmi/connectors';
import { seiTestnet, sepoliaTestnet } from './networkConfig';
export const config = createConfig({
  chains: [
    // mainnet,
    sepoliaTestnet,
    seiTestnet
  ],
  connectors: [metaMask()
  ],
  transports: {
    // [mainnet.id]: http(),
    [sepoliaTestnet.id]: http(sepoliaTestnet.rpcUrls.default.http[0]),
    [seiTestnet.id]: http(seiTestnet.rpcUrls.default.http[0])
  }
})
