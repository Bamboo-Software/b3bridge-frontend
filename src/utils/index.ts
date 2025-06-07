import { formatUnits, parseUnits } from "ethers";

export const formatBalance = (value: bigint | undefined, decimals: number = 18) => {
    if (!value) return "0";
    return formatUnits(value, decimals);
  };

  const parseAmount = (amount: string, decimals: number = 18) => {
    try {
      return parseUnits(amount, decimals);
    } catch (e) {
      return BigInt(0);
    }
  };
