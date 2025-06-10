'use client'

import { http, createConfig } from 'wagmi'
import {
  mainnet,
  arbitrum,
  sepolia,
  arbitrumSepolia,
  avalancheFuji,
  baseSepolia,
  bscTestnet,
  optimismSepolia,
  polygonAmoy,
} from 'wagmi/chains'
import { metaMask, walletConnect } from 'wagmi/connectors';
import { seiTestnet } from './networkConfig';
export const config = createConfig({
  chains: [
    mainnet,
    arbitrum,
    sepolia,
    arbitrumSepolia,
    avalancheFuji,
    baseSepolia,
    bscTestnet,
    optimismSepolia,
    polygonAmoy,
    seiTestnet
  ],
  connectors: [metaMask(),walletConnect({projectId:process.env.NEXT_PUBLIC_PROJECT_ID as string})
  ],
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [sepolia.id]: http(),
    [arbitrumSepolia.id]: http(),
    [avalancheFuji.id]: http(),
    [baseSepolia.id]: http(),
    [bscTestnet.id]: http(),
    [optimismSepolia.id]: http(),
    [polygonAmoy.id]: http(),
    [seiTestnet.id]: http(seiTestnet.rpcUrls.default.http[0])
  }
})
