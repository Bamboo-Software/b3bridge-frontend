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

  useEffect(() => {
    if (!recipient) return;

    const smETH = getBridgeAddress("ethereum"); // Giả sử bạn dùng "eth" để lấy địa chỉ bridge
    const publicClient = getPublicClient(config, { chainId: 11155111 }); // mainnet hoặc testnet tùy
    const abiEvent = parseAbiItem(
      "event UnlockedTokenERC20VL(address indexed recipientAddr, address tokenAddr, uint256 amount)"
    );

    const pollLogs = async () => {
      try {
        const currentBlock = await publicClient!.getBlockNumber();
        const fromBlock = lastCheckedBlockRef.current ?? (currentBlock - BigInt("50"));
        lastCheckedBlockRef.current = currentBlock;

        const logs = await publicClient!.getLogs({
          address: smETH,
          event: abiEvent,
          fromBlock,
          toBlock: currentBlock,
        });

        for (const log of logs) {
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
      } catch (err) {
        console.error("❌ Error polling UnlockedTokenERC20VL logs:", err);
      }
    };

    const interval = setInterval(pollLogs, 4000);
    return () => clearInterval(interval);
  }, [recipient, onUnlocked]);
};
