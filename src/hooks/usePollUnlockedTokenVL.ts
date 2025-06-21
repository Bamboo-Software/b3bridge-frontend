import { useEffect, useRef } from "react";
import { getPublicClient } from "wagmi/actions";
import { parseAbiItem } from "viem";
import { config } from "@/configs/wagmi";
import { getBridgeAddress } from "@/utils";

export const usePollUnlockedTokenVL = ({
  recipient,
  onUnlocked,
}: {
  recipient: string;
  // enabled?: boolean;
  onUnlocked: (event: {
    recipientAddr: string;
    amount: bigint;
  }) => void;
}) => {
  const lastCheckedBlockRef = useRef<bigint | null>(null);

  useEffect(() => {
    if (!recipient) return;

    let isMounted = true;
    const chainId = Number(process.env.NEXT_PUBLIC_ETH_CHAIN_ID);
    const smETH = getBridgeAddress("ethereum");
    const publicClient = getPublicClient(config, { chainId });

    const abiEvent = parseAbiItem(
      "event UnlockedTokenVL(address indexed recipientAddr, uint256 amount)"
    );

    const pollLogs = async () => {
      if (!isMounted || !recipient) return;
      try {
        const currentBlock = await publicClient!.getBlockNumber();
        const fromBlock = lastCheckedBlockRef.current ?? (currentBlock - BigInt(50));
        lastCheckedBlockRef.current = currentBlock;

        const logs = await publicClient!.getLogs({
          address: smETH,
          event: abiEvent,
          fromBlock,
          toBlock: currentBlock,
        });

        for (const log of logs) {
          const { recipientAddr, amount } = log.args as {
            recipientAddr: string;
            amount: bigint;
          };
          if (recipientAddr.toLowerCase() === recipient.toLowerCase()) {

            onUnlocked({ recipientAddr, amount });
          }
        }
      } catch (err) {
        console.error("❌ Error polling UnlockedTokenVL logs:", err);
      }
    };

    const interval = setInterval(pollLogs, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [recipient, onUnlocked]);
};
