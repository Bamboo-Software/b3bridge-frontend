import { useEffect } from "react";
import { parseAbiItem } from "viem";
import { watchContractEvent } from "@wagmi/core";
import { getBridgeAddress } from "@/utils";
import { config } from "@/configs/wagmi";

interface UseWatchMintTokenCCIPParams {
  chainId: number;
  recipient: string;
  enabled?: boolean;
  onMint?: (data: {
    receiver: string;
    tokenId: string;
    amount: bigint;
  }) => void;
}

export function useWatchMintTokenCCIP({
  chainId,
  recipient,
  onMint,
}: UseWatchMintTokenCCIPParams) {
  useEffect(() => {
    if (!recipient) return;

    const bridgeAddress = getBridgeAddress("sei");

    const unwatch = watchContractEvent(config, {
      chainId,
      address: bridgeAddress,
      abi: [
        parseAbiItem(
          "event MintTokenCCIP(address receiver, bytes32 tokenId, uint256 amount)"
        ),
      ],
      eventName: "MintTokenCCIP",
      onLogs: (logs) => {
        for (const log of logs) {
          const { receiver, tokenId, amount } = log.args as {
            receiver: string;
            tokenId: string;
            amount: bigint;
          };

          if (receiver.toLowerCase() === recipient.toLowerCase()) {
            onMint?.({ receiver, tokenId, amount });
          }
        }
      },
    });

    return () => unwatch(); // Cleanup
  }, [chainId, recipient, onMint]);
}
