
import { useEffect, useRef } from "react";
import { getPublicClient } from "wagmi/actions";
import { parseAbiItem } from "viem";
import { getBridgeAddress } from "@/utils";
import { config } from "@/configs/wagmi";

export const usePollMintedTokenVL = ({
  recipient,
  onMinted,
  onAfterMinted,
}: {
  recipient: string;
  enabled?: boolean;
  onMinted: (event: { recipientAddr: string; token: string; amount: bigint }) => void;
  onAfterMinted?: () => void;
}) => {
  const lastCheckedBlockRef = useRef<bigint | null>(null);

  useEffect(() => {
    if (!recipient) return;

    const smSEI = getBridgeAddress("sei");
    const publicClient = getPublicClient(config, { chainId: 1328 });
    const abiEvent = parseAbiItem(
      "event MintedTokenVL(address recipientAddr, address token, uint256 amount)"
    );

    const pollLogs = async () => {
      try {
        const currentBlock = await publicClient!.getBlockNumber();
        const fromBlock = lastCheckedBlockRef.current ?? currentBlock - BigInt(50);
        lastCheckedBlockRef.current = currentBlock;

        const logs = await publicClient!.getLogs({
          address: smSEI,
          event: abiEvent,
          fromBlock,
          toBlock: currentBlock,
        });

        for (const log of logs) {
          const { recipientAddr, token, amount } = log.args as {
            recipientAddr: string;
            token: string;
            amount: bigint;
          };

          if (recipientAddr.toLowerCase() === recipient.toLowerCase()) {
            console.log("✅ MintedTokenVL matched:", { token, amount });
            onMinted({ recipientAddr, token, amount });

            onAfterMinted?.();
          }
        }
      } catch (err) {
        console.error("❌ Error polling MintedTokenVL logs:", err);
      }
    };

    const interval = setInterval(pollLogs, 10000);
    return () => clearInterval(interval);
  }, [recipient, onMinted, onAfterMinted]);
};
