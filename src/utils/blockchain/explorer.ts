import type { Chain } from 'viem';
import { selectedChains } from '../constants/wallet/wagmi';

export function getLayerZeroScanLink(txHash: string): string {
  const baseUrl = import.meta.env.VITE_LAYER_ZERO_SCAN_URL || "";
  return `${baseUrl}/${txHash}`;
}

export function getAddressExplorerLink(address: string, chainId: number): string {
  const chain = selectedChains.find((c: Chain) => c.id === chainId);
  const baseUrl = chain?.blockExplorers?.default?.url;
  return baseUrl ? `${baseUrl}/address/${address}` : '';
}