/* eslint-disable @typescript-eslint/no-explicit-any */
import { http, createConfig } from '@wagmi/core'
import { appConfig } from '../app'
import type { WalletConfig } from '@/utils/interfaces/wallet'
import metamaskLogo from '@/assets/icons/metamask-logo.png'
import okxLogo from '@/assets/icons/okx-logo.svg'
import * as viemChains from 'viem/chains'
import type { Chain } from 'viem'

const isProd = appConfig?.isProd

const allChains: Chain[] = Object.values(viemChains).filter(
  (c): c is any =>
    typeof c === 'object' &&
    c !== null &&
    'id' in c &&
    'rpcUrls' in c
);

export const selectedChains = allChains.filter((chain) =>
  isProd ? !chain.testnet : !chain.testnet
) as [Chain, ...Chain[]]
export const wagmiConfig = createConfig({
  chains: selectedChains,
  transports: Object.fromEntries(
    selectedChains.map((chain) => [chain.id, http()])
  ) as Record<number, ReturnType<typeof http>>,
})


export const walletConfig: WalletConfig[] = [
  {
    connectorId: "io.metamask",
    name: "MetaMask",
    logo: metamaskLogo,
  },
  {
    connectorId: "com.okex.wallet",
    name: "OKX",
    logo: okxLogo,
  }
];

export function getWalletLogoByName(name: string): string | undefined {
  return walletConfig.find(w => w.name.toLowerCase() === name.toLowerCase())?.logo;
}

export function getWalletByConnectorId(connectorId: string): WalletConfig | undefined {
  return walletConfig.find(w => w.connectorId === connectorId);
}