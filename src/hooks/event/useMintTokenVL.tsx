import { useEffect } from "react";
import { watchContractEvent } from "@wagmi/core";
import { parseAbiItem } from "viem";
import { blockChainConfig } from "@/utils/constants/chain";
import { wagmiConfig } from '@/utils/constants/wallet/wagmi';

export const useWatchMintedTokenVL = ({
  onMinted,
  onAfterMinted,
}: {
  enabled?: boolean;
  onMinted: (event: { recipientAddr: string; token: string; amount: bigint }) => void;
  onAfterMinted?: () => void;
}) => {
  useEffect(() => {


    const unwatch = watchContractEvent(wagmiConfig, {
      address:  blockChainConfig.seiBridgeAddress,
      abi: [
        parseAbiItem(
          "event MintedTokenVL(address recipientAddr, address token, uint256 amount)"
        ),
      ],
      eventName: "MintedTokenVL",
      chainId: Number(import.meta.env.VITE_SEI_CHAIN_ID),
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