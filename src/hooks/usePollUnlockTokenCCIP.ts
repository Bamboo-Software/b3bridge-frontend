// hooks/usePollUnlockTokenCCIP.ts
import { useEffect, useRef } from "react";
import { getPublicClient } from "wagmi/actions";
import { parseAbiItem } from "viem";
import { getBridgeAddress } from "@/utils";
import { config } from "@/configs/wagmi";

interface UsePollUnlockTokenCCIPParams {
  chainId: number;
  user: string;
  onUnlock?: (data: {
    user: string;
    token: string;
    amount: bigint;
    balanceBefore: bigint;
    balanceAfter: bigint;
  }) => void;
}

export function usePollUnlockTokenCCIP({ chainId, user, onUnlock }: UsePollUnlockTokenCCIPParams) {
  const lastCheckedBlockRef = useRef<bigint | null>(null);

  useEffect(() => {
    if (!user) return;

    const bridgeAddress = getBridgeAddress("ethereum");
    const publicClient = getPublicClient(config, { chainId:11155111 });

    const abiEvent = parseAbiItem(
  "event UnlockTokenCCIP(address user, address token, uint256 amount, uint256 balanceBefore, uint256 balanceAfter)"
);


    const poll = async () => {
      try {
        const currentBlock = await publicClient!.getBlockNumber();
        const fromBlock = lastCheckedBlockRef.current ?? (currentBlock - BigInt(50));
        lastCheckedBlockRef.current = currentBlock;

        const logs = await publicClient!.getLogs({
          address: bridgeAddress,
          event: abiEvent,
          fromBlock,
          toBlock: currentBlock,
        });

        for (const log of logs) {
          const { user: u, token, amount, balanceBefore, balanceAfter } = log.args as any;
          if (u.toLowerCase() === user.toLowerCase()) {
            onUnlock?.({ user: u, token, amount, balanceBefore, balanceAfter });
          }
        }
      } catch (err) {
        console.error("Polling UnlockTokenCCIP error:", err);
      }
    };

    const interval = setInterval(poll, 4000);
    return () => clearInterval(interval);
  }, [user, chainId, onUnlock]);
}
