import { http, createConfig } from '@wagmi/core'
import { mainnet, sepolia, sei, seiTestnet, type Chain } from '@wagmi/core/chains'
import { appConfig } from '../app'
import type { WalletConfig } from '@/utils/interfaces/wallet'
import metamaskLogo from '@/assets/icons/metamask-logo.png'
import okxLogo from '@/assets/icons/okx-logo.svg'
const isProd = appConfig?.isProd
export const selectedChains = (isProd ? [mainnet, sei] : [sepolia, seiTestnet]) as [Chain, ...Chain[]]

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