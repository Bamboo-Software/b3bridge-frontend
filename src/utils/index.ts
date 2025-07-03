import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ITokenInfo } from './interfaces/token';
import { BridgeActionType } from '@/utils/enums/bridge';
import { tokenMetaByChainAndSymbol } from "./constants/token";
import type { CryptoCurrencyEnum } from "./enums/chain";

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

export const formatTokenAmount = (amount: string | undefined, token?: ITokenInfo): string => {
  if (!amount || !token) return '0';
  const decimals = token.decimals || 18;
  const parsedAmount = Number(amount);
  if (isNaN(parsedAmount)) return '0';
  const formatted = (parsedAmount / 10 ** decimals).toFixed(6);
  return formatted === '0.000000' ? '0' : formatted;
};
export function getIsOrigin(token: ITokenInfo): boolean {
  return (
    tokenMetaByChainAndSymbol[token.chainId]?.[token.symbol as CryptoCurrencyEnum]
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
// export function getBridgeActionType(
//   fromToken: ITokenInfo,
//   toToken: ITokenInfo,
//   originTokenList: ITokenInfo[]
// ): BridgeActionType {
//   if (
//     !fromToken ||
//     !toToken ||
//     !originTokenList?.length ||
//     !fromToken.address ||
//     !toToken.address ||
//     !fromToken.chainId ||
//     !toToken.chainId
//   ) {
//     return BridgeActionType.Unknown;
//   }

//   const isFromNative = originTokenList.some(
//     (token) =>
//       token.address.toLowerCase() === fromToken.address.toLowerCase() &&
//       token.chainId === fromToken.chainId
//   );

//   const isToNative = originTokenList.some(
//     (token) =>
//       token.address.toLowerCase() === toToken.address.toLowerCase() &&
//       token.chainId === toToken.chainId
//   );

//   if (isFromNative && !isToNative) return BridgeActionType.LockMint;
//   if (isToNative && !isFromNative) return BridgeActionType.BurnUnlock;

//   return BridgeActionType.Unknown;
// }


