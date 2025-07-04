/* eslint-disable @typescript-eslint/no-explicit-any */
import { http, createConfig, webSocket } from '@wagmi/core'
import { appConfig } from '../app'
import type { WalletConfig } from '@/utils/interfaces/wallet'
import metamaskLogo from '@/assets/icons/metamask-logo.png'
import okxLogo from '@/assets/icons/okx-logo.svg'
import * as viemChains from 'viem/chains'
import type { Chain } from 'viem'
import { CHAIN_ENV_KEYS } from '../chain'

const isProd = appConfig?.isProd

const allChains: Chain[] = Object.values(viemChains).filter(
  (c): c is any =>
    typeof c === 'object' &&
    c !== null &&
    'id' in c &&
    'rpcUrls' in c
);

export const selectedChains = allChains.filter((chain) =>
  isProd ? !chain.testnet : chain.testnet
) as [Chain, ...Chain[]]

const transportsConfig: Record<number, ReturnType<typeof http> | ReturnType<typeof webSocket>> = {};

selectedChains.forEach((chain) => {
  const envKey = CHAIN_ENV_KEYS[chain.id];
  let transport = null;

  if (envKey) {
    const wsUrl = import.meta.env[`VITE_${envKey}_CHAIN_WS_URL`];
    const httpUrl = import.meta.env[`VITE_${envKey}_CHAIN_RPC_URL`];

    if (wsUrl) {
      transport = webSocket(wsUrl);
    } else if (httpUrl) {
      transport = http(httpUrl);
    }
  }

  if (!transport) {
    const defaultWsUrl = chain.rpcUrls?.default?.webSocket?.[0];
    const defaultHttpUrl = chain.rpcUrls?.default?.http?.[0];

    if (defaultWsUrl) {
      transport = webSocket(defaultWsUrl);
    } else if (defaultHttpUrl) {
      transport = http(defaultHttpUrl);
    }
  }

  if (transport) {
    transportsConfig[chain.id] = transport;
  }
});
export const wagmiConfig = createConfig({
  chains: selectedChains,
  transports: transportsConfig
});

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