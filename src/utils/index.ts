import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ITokenInfo } from './interfaces/token';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function shortenAddress(address: string, chars = 4) {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatNumber(value: string | number) {
  return value.toLocaleString('en', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  });
}

export function formatTokenAmount(amount: string | number, token?: ITokenInfo) {
  if(isNaN(Number(amount)) || !amount || !token) return undefined
  const value = Number(amount) / (10 ** token?.decimals);
  return value.toString();
}