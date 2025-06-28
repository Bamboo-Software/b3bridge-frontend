import { CONTRACT_ADDRESSES, SupportedChain } from "@/configs/contracts";
import { formatUnits, parseUnits } from "ethers";
export const formatBalance = (value: bigint | undefined, decimals: number = 18) => {
    if (!value) return "0";
    return formatUnits(value, decimals);
  };

export  const parseAmount = (amount: string, decimals: number = 18) => {
    try {
      return parseUnits(amount, decimals);
    } catch (e) {
      return BigInt(0);
    }
  };
export function formatLength(balance: string, detailed = false): string {
  const value = parseFloat(balance);

  if (isNaN(value)) return '0';
  // if (value < 0.0001) return '< 0.0001';

  return value.toFixed(detailed ? 6 : 4).replace(/\.?0+$/, '');
}


export function getBridgeAddress(chain: SupportedChain) {
  return CONTRACT_ADDRESSES[chain]?.bridge;
}