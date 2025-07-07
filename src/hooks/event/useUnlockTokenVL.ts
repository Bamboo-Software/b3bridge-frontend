import { useEffect } from "react";
import { parseAbiItem } from "viem";
import { watchContractEvent } from "@wagmi/core";
import { wagmiConfig } from "@/utils/constants/wagmi";
import { blockChainConfig } from "@/utils/constants/chain";

export const useWatchUnlockedTokenVL = ({
  onUnlocked,
}: {
  onUnlocked: (event: {
    recipientAddr: string;
    amount: bigint;
  }) => void;
}) => {
  useEffect(() => {


    const unwatch = watchContractEvent(wagmiConfig, {
      address: blockChainConfig.ethereumBridgeAddress,
      chainId: Number(import.meta.env.VITE_ETH_CHAIN_ID),
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