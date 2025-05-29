// config/index.tsx

import { cookieStorage, createStorage, http } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, arbitrum, sepolia, arbitrumSepolia, avalancheFuji, baseSepolia, bscTestnet, optimismSepolia, polygonAmoy } from '@reown/appkit/networks'
import { createConfig } from 'wagmi'
import { injected } from 'wagmi/connectors'

// Get projectId from https://cloud.reown.com
// export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID

// if (!projectId) {
//   throw new Error('Project ID is not defined')
// }

// Set up the Wagmi Adapter (Config)
// export const wagmiAdapter = new WagmiAdapter({
//   storage: createStorage({
//     storage: cookieStorage
//   }),
//   ssr: true,
//   projectId,
//   networks: [mainnet, arbitrum, sepolia, arbitrumSepolia, avalancheFuji, baseSepolia, bscTestnet, optimismSepolia, polygonAmoy],
//   connectors: [injected()]
// })

// Create wagmi config
export const config = createConfig({
  chains: [mainnet, arbitrum, sepolia, arbitrumSepolia, avalancheFuji, baseSepolia, bscTestnet, optimismSepolia, polygonAmoy],
  connectors: [injected()],
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
  },
})