import { useEffect } from "react";
import { parseAbiItem } from "viem";
import { watchContractEvent } from "@wagmi/core";
import { config } from "@/configs/wagmi";
import { getBridgeAddress } from "@/utils";

export const useWatchUnlockedTokenVL = ({
  onUnlocked,
}: {
  onUnlocked: (event: {
    recipientAddr: string;
    amount: bigint;
  }) => void;
}) => {
  useEffect(() => {

    const chainId = Number(process.env.NEXT_PUBLIC_ETH_CHAIN_ID);
    const contractAddress = getBridgeAddress("ethereum");

    const unwatch = watchContractEvent(config, {
      address: contractAddress,
      chainId,
      abi: [parseAbiItem("event UnlockedTokenVL(address indexed recipientAddr, uint256 amount)")],
      eventName: "UnlockedTokenVL",
      onLogs: (logs) => {
        for (const log of logs) {
          const { recipientAddr, amount } = log.args as {
            recipientAddr: string;
            amount: bigint;
          };

          onUnlocked({ recipientAddr, amount });
        }
      }
    });

    return () => {
      unwatch(); // Clean up when component unmounts or recipient changes
    };
  }, [onUnlocked]);
};
