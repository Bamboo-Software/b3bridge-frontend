import { useEffect, useRef } from "react";
import { getPublicClient } from "wagmi/actions";
import { parseAbiItem } from "viem";
import { getBridgeAddress } from "@/utils";
import { config } from "@/configs/wagmi";

interface UsePollMintTokenCCIPParams {
  chainId: number;
  recipient: string;
  enabled?: boolean;
  onMint?: (data: {
    messageId: string;
    sourceChainSelector: bigint;
    receiver: string;
    tokenId: string;
    amount: bigint;
  }) => void;
}

export function usePollMintTokenCCIP({
  chainId,
  recipient,
  // enabled = true,
  onMint,
}: UsePollMintTokenCCIPParams) {
  const lastCheckedBlockRef = useRef<bigint | null>(null);

  useEffect(() => {
    if (!recipient) return;

    const bridgeAddress = getBridgeAddress("sei");
    const publicClient = getPublicClient(config, { chainId: 1328 });

    const abiEvent = parseAbiItem(
      "event MintTokenCCIP(bytes32 indexed messageId, uint64 indexed sourceChainSelector, address receiver, bytes32 tokenId, uint256 amount)"
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
          const { messageId, sourceChainSelector, receiver, tokenId, amount } = log.args as any;
          if (receiver.toLowerCase() === recipient.toLowerCase()) {
            onMint?.({ messageId, sourceChainSelector, receiver, tokenId, amount });
          }
        }
      } catch (err) {
        console.error("Polling MintTokenCCIP error:", err);
      }
    };

    const interval = setInterval(poll, 10000);
    return () => clearInterval(interval);
  }, [recipient, chainId, onMint]);
}
