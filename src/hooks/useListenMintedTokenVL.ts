// // hooks/useListenMintedTokenVL.ts
// import { useEffect } from "react";
// import { watchContractEvent } from "@wagmi/core";
// import { config } from "@/configs/wagmi";
// import { SEI_BRIDGE_ABI } from "@/configs/networkConfig";
// import { getBridgeAddress } from "@/utils";

// export const useListenMintedTokenVL = ({
//   recipient,
//   onMinted,
// }: {
//   recipient: string;
//   onMinted: (event: { recipientAddr: string; token: string; amount: bigint }) => void;
// }) => {
//   const smSEI = getBridgeAddress("sei");
//   console.log("🚀 ~ smSEI:", smSEI)

//   useEffect(() => {
//     if (!recipient) return;
//     console.log("aaaa")
//     const unwatch = watchContractEvent(config, {
//       address: smSEI as `0x${string}`,
//       abi: SEI_BRIDGE_ABI.abi,
//       eventName: "MintedTokenVL",
//       chainId: 1328,
//       onLogs(logs) {
//         console.log("🚀 ~ onLogs ~ logs:", logs)
//     //     logs.forEach((log) => {
//     //       const { recipientAddr, token, amount } = log.args as {
//     //         recipientAddr: string;
//     //         token: string;
//     //         amount: bigint;
//     //       };

//     //       if (recipientAddr.toLowerCase() === recipient.toLowerCase()) {
//     //         console.log("✅ Minted event matched:", { token, amount });
//     //         onMinted({ recipientAddr, token, amount });
//     //       }
//     //     });
//       },
//     });

//     return () => unwatch(); // cleanup listener khi unmount
//   }, [recipient, onMinted, smSEI]);
// };



// hooks/usePollMintedTokenVL.ts
import { useEffect, useRef } from "react";
import { getPublicClient } from "wagmi/actions";
import { parseAbiItem } from "viem";
import { getBridgeAddress } from "@/utils";
import { config } from "@/configs/wagmi";

export const usePollMintedTokenVL = ({
  recipient,
  onMinted,
}: {
  recipient: string;
  onMinted: (event: { recipientAddr: string; token: string; amount: bigint }) => void;
}) => {
  const lastCheckedBlockRef = useRef<bigint | null>(null);

  useEffect(() => {
    if (!recipient) return;

    const smSEI = getBridgeAddress("sei");
    const publicClient = getPublicClient(config,{ chainId: 1328 });
    const abiEvent = parseAbiItem(
      "event MintedTokenVL(address recipientAddr, address token, uint256 amount)"
    );
    console.log("🚀 ~ useEffect ~ publicClient:", publicClient)

    const pollLogs = async () => {
      try {
        const currentBlock = await publicClient!.getBlockNumber();
        const fromBlock = lastCheckedBlockRef.current ?? (currentBlock - BigInt("50"));
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
          }
        }
      } catch (err) {
        console.error("❌ Error polling MintedTokenVL logs:", err);
      }
    };

    const interval = setInterval(pollLogs, 4000);
    return () => clearInterval(interval);
  }, [recipient, onMinted]);
};
