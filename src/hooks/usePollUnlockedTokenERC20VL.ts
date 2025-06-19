// hooks/usePollUnlockedTokenERC20VL.ts
import { useEffect, useRef } from "react";
import { getPublicClient } from "wagmi/actions";
import { parseAbiItem } from "viem";
import { config } from "@/configs/wagmi";
import { getBridgeAddress } from "@/utils";

export const usePollUnlockedTokenERC20VL = ({
  recipient,
  onUnlocked,
}: {
  recipient: string;
  onUnlocked: (event: {
    recipientAddr: string;
    tokenAddr: string;
    amount: bigint;
  }) => void;
}) => {
  const lastCheckedBlockRef = useRef<bigint | null>(null);
  const retryRef = useRef(false);

  useEffect(() => {
    if (!recipient) return;

    const smETH = getBridgeAddress("ethereum");
    const publicClient = getPublicClient(config, { chainId: 11155111 });
    const abiEvent = parseAbiItem(
      "event UnlockedTokenERC20VL(address indexed recipientAddr, address tokenAddr, uint256 amount)"
    );

    const pollLogs = async () => {
      if (retryRef.current) return; // Backoff: skip this round

      try {
        const currentBlock = await publicClient!.getBlockNumber();
        const fromBlock =
          lastCheckedBlockRef.current ?? currentBlock - BigInt(20);
        lastCheckedBlockRef.current = currentBlock;

        const logs = await publicClient!.getLogs({
          address: smETH,
          event: abiEvent,
          fromBlock,
          toBlock: currentBlock,
        });

        for (const log of logs) {
          if (!log.args) continue; // skip invalid log

          const { recipientAddr, tokenAddr, amount } = log.args as {
            recipientAddr: string;
            tokenAddr: string;
            amount: bigint;
          };

          if (recipientAddr.toLowerCase() === recipient.toLowerCase()) {
            console.log("✅ UnlockedTokenERC20VL matched:", { tokenAddr, amount });
            onUnlocked({ recipientAddr, tokenAddr, amount });
          }
        }
      } catch (err: any) {
        console.error("❌ Error polling UnlockedTokenERC20VL logs:", err);

        // Backoff 30s if 429 (rate limited)
        if (err?.status === 429 || err?.message?.includes("429")) {
          retryRef.current = true;
          setTimeout(() => {
            retryRef.current = false;
          }, 30000);
        }
      }
    };

    const interval = setInterval(pollLogs, 10000);
    return () => clearInterval(interval);
  }, [recipient, onUnlocked]);
};
