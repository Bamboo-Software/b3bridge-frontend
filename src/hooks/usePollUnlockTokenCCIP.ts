import { useEffect } from "react";
import { parseAbiItem } from "viem";
import { watchContractEvent } from "@wagmi/core";
import { getBridgeAddress } from "@/utils";
import { config } from "@/configs/wagmi";

interface UseWatchUnlockTokenCCIPParams {
  chainId: number;
  user: string;
  enabled?: boolean;
  onUnlock?: (data: {
    user: string;
    token: string;
    amount: bigint;
    balanceBefore: bigint;
    balanceAfter: bigint;
  }) => void;
}

export function useWatchUnlockTokenCCIP({
  chainId,
  user,
  enabled = true,
  onUnlock,
}: UseWatchUnlockTokenCCIPParams) {
  useEffect(() => {
    if (!user || !enabled || chainId !== Number(process.env.NEXT_PUBLIC_ETH_CHAIN_ID)) return;

    const bridgeAddress = getBridgeAddress("ethereum");

    const unwatch = watchContractEvent(config, {
      chainId,
      address: bridgeAddress,
      abi: [
        parseAbiItem(
          "event UnlockTokenCCIP(address user, address token, uint256 amount, uint256 balanceBefore, uint256 balanceAfter)"
        ),
      ],
      eventName: "UnlockTokenCCIP",
      onLogs: (logs) => {
        for (const log of logs) {
          const { user: u, token, amount, balanceBefore, balanceAfter } = log.args as {
            user: string;
            token: string;
            amount: bigint;
            balanceBefore: bigint;
            balanceAfter: bigint;
          };

          if (u.toLowerCase() === user.toLowerCase()) {
            onUnlock?.({ user: u, token, amount, balanceBefore, balanceAfter });
          }
        }
      },
    });

    return () => {
      unwatch(); // Clean up subscription on unmount or param change
    };
  }, [chainId, user, enabled, onUnlock]);
}
