import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ITokenInfo } from './interfaces/token';
import { BridgeActionType } from '@/utils/enums/bridge';
import { tokenMetaByChainAndSymbol } from "./constants/token";
import type { CryptoCurrencyEnum } from "./enums/chain";
import type { Chain } from 'viem';
import { selectedChains } from './constants/wallet/wagmi';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function shortenAddress(address: string, chars = 4) {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatNumber(
  value: string | number,
  minimumFractionDigits?: number,
  maximumFractionDigits?: number
) {
  const num = typeof value === "string" ? Number(value) : value;
  if (isNaN(num)) return value;
  return num.toLocaleString("en", {
    minimumFractionDigits: minimumFractionDigits || 0,
    maximumFractionDigits: maximumFractionDigits || 6,
  });
}

export function parseFormattedNumber(formattedValue: string | number): number {
  if (typeof formattedValue === 'number') return formattedValue;
  if (!formattedValue || typeof formattedValue !== 'string') return 0;
  
  const cleanedValue = formattedValue.replace(/,/g, '');
  const parsedNumber = Number(cleanedValue);
  
  return isNaN(parsedNumber) ? 0 : parsedNumber;
}

export const formatTokenAmount = (amount: string | undefined, token?: ITokenInfo,
  minimumFractionDigits?: number, 
  maximumFractionDigits?: number, 
): string => {
  if (!amount || !token) return '0';
  const decimals = token.decimals || 18;
  const parsedAmount = Number(amount);
  if (isNaN(parsedAmount)) return '0';
  const formatted = formatNumber(parsedAmount / 10 ** decimals, minimumFractionDigits, maximumFractionDigits);
  return formatted.toString() 
};
export function getIsOrigin(token: ITokenInfo): boolean {
  return (
    tokenMetaByChainAndSymbol[token?.chainId]?.[token?.symbol as CryptoCurrencyEnum]
      ?.isOrigin ?? false
  );
}
export function getBridgeActionType(
  fromToken: ITokenInfo & { isOrigin: boolean },
  toToken: ITokenInfo & { isOrigin: boolean }
): BridgeActionType {
  if (!fromToken || !toToken) return BridgeActionType.Unknown;

  const isFromOrigin = fromToken.isOrigin;
  const isToOrigin = toToken.isOrigin;

  if (isFromOrigin && !isToOrigin) return BridgeActionType.LockMint;
  if (!isFromOrigin && isToOrigin) return BridgeActionType.BurnUnlock;

  return BridgeActionType.Unknown;
}

export function getTxExplorerLink(txHash: string, chainId: number): string {
  const chain = selectedChains.find((c: Chain) => c.id === chainId);
  const baseUrl = chain?.blockExplorers?.default?.url;
  return baseUrl ? `${baseUrl}/tx/${txHash}` : '';
}
export function getCCIPExplorerLink(messageId: string): string {
  return `${import.meta.env.VITE_CCIP_EXPLORER}/${messageId}`;
}
export const formatInputNumberDecimals = (value: string | number) => {
  if(!value) return ""
  const rawValue =String(value).replace(/[^0-9.]/g, '');
  let formattedValue = rawValue.replace(/(\..*)\./g, '$1');
  if (formattedValue.includes('.')) {
    const [intPart, decPart] = formattedValue.split('.');
    formattedValue = intPart + '.' + decPart.slice(0, 5);
  }
  return formattedValue
}

export function shortenUrl(url: string, maxLength = 32): string {
  if (!url) return "";
  if (url.length <= maxLength) return url;
  const prefix = url.slice(0, 18);
  const suffix = url.slice(-8);
  return `${prefix}...${suffix}`;
}