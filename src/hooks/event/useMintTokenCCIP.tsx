import { useEffect } from "react";
import { parseAbiItem } from "viem";
import { watchContractEvent } from "@wagmi/core";
import { blockChainConfig, configChains } from "@/utils/constants/chain";
import { wagmiConfig } from '@/utils/constants/wallet/wagmi';

interface UseWatchMintTokenCCIPParams {
  recipient: string;
  enabled?: boolean;
  onMint?: (data: {
    receiver: string;
    tokenId: string;
    amount: bigint;
  }) => void;
}

export function useWatchMintTokenCCIP({
  recipient,
  onMint,
}: UseWatchMintTokenCCIPParams) {
  useEffect(() => {
    if (!recipient) return;

    // const bridgeAddress = getBridgeAddress("sei");

    const unwatch = watchContractEvent(wagmiConfig, {
      chainId:Number(configChains?.[1].id || import.meta.env.VITE_SEI_CHAIN_ID),
      address: blockChainConfig.seiBridgeAddress,
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

    return () => unwatch();
  }, [ recipient, onMint]);
}