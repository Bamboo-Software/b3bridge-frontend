import { useEffect } from "react";
import { watchContractEvent } from "@wagmi/core";
import { parseAbiItem } from "viem";
import { getBridgeAddress } from "@/utils";
import { config } from "@/configs/wagmi";

export const useWatchMintedTokenVL = ({
  onMinted,
  onAfterMinted,
}: {
  enabled?: boolean;
  onMinted: (event: { recipientAddr: string; token: string; amount: bigint }) => void;
  onAfterMinted?: () => void;
}) => {
  useEffect(() => {

    const smSEI = getBridgeAddress("sei");

    const unwatch = watchContractEvent(config, {
      address: smSEI,
      abi: [
        parseAbiItem(
          "event MintedTokenVL(address recipientAddr, address token, uint256 amount)"
        ),
      ],
      eventName: "MintedTokenVL",
      chainId: Number(process.env.NEXT_PUBLIC_SEI_CHAIN_ID),
      onLogs: (logs) => {
        for (const log of logs) {
          const { recipientAddr, token, amount } = log.args as {
            recipientAddr: string;
            token: string;
            amount: bigint;
          };

          onMinted({ recipientAddr, token, amount });
          onAfterMinted?.();
        }
      },
      onError(error) {
        console.error("❌ Error watching MintedTokenVL:", error);
      },
    });

    return () => unwatch?.();
  }, [onMinted, onAfterMinted]);
};
