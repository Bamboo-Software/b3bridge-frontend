/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from "react";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";
import { toast } from "sonner";

import CustomToastBridged from "@/components/ToastBridgedLocal";
import { useWatchMintedTokenVL } from "./useMintTokenVL";
import { useWatchUnlockedTokenVL } from "./useUnlockTokenVL";
import { useWatchMintTokenCCIP } from "./useMintTokenCCIP";
import { useWatchUnlockTokenCCIP } from "./useUnlockTokenCCIP";
// import { ChainTokenSource } from "@/utils/enums/chain";
// import { CCIPTransactionStatus } from "@/utils/enums/transaction";
// import { useTransactionStore } from "../useTransactionStore";
import { useBridgeStatusStore } from "@/stores/bridge/useBridgeStatusStore";

export const useWatchTokenEvents = () => {
  const { address } = useAccount();
  const triggerUpdateState = useBridgeStatusStore((s) => s.triggerUpdateState);
  // const allTx = useTransactionStore((state) => state.allTx);
  // const setAllTx = useTransactionStore((state) => state.setAllTx);

  const handleMintedVL = useCallback(
    ({ recipientAddr, token, amount }: any) => {
      if (!address) return;
      toast.custom((t) => (
        <CustomToastBridged
          t={t}
          title="🎉 Token Minted on SEI"
          content={
            <>
              <p><strong>Recipient:</strong> {recipientAddr}</p>
              <p><strong>Token:</strong> {token}</p>
              <p><strong>Amount:</strong> {formatUnits(amount, 18)}</p>
            </>
          }
        />
      ));
       triggerUpdateState();
    },
    [address,triggerUpdateState]
  );

  const handleUnlockedVL = useCallback(
    ({ recipientAddr, amount }: { recipientAddr: string; amount: bigint }) => {
      if (!address) return;

      toast.custom((t) => (
        <CustomToastBridged
          t={t}
          title="🔓 Token Unlocked"
          content={
            <>
              <p><strong>Recipient:</strong> {recipientAddr}</p>
              <p><strong>Amount:</strong> {formatUnits(amount, 18)}</p>
            </>
          }
        />
      ));
      triggerUpdateState();
    },
    [address,triggerUpdateState]
  );

  const handleMintedCCIP = useCallback(
    ({ tokenId, amount }: { tokenId: string; amount: bigint }) => {
      if (!address) return;

      toast.custom((t) => (
        <CustomToastBridged
          t={t}
          title="✅ Token Minted (CCIP)"
          content={
            <>
              <p><strong>Token ID:</strong> {tokenId}</p>
              <p><strong>Amount:</strong> {formatUnits(amount, 6)}</p>
            </>
          }
        />
      ));
      triggerUpdateState()
    },
    [address,triggerUpdateState]
  );

  const handleUnlockedCCIP = useCallback(
    ({ token, amount }: { token: string; amount: bigint }) => {
      if (!address) return;

      toast.custom((t) => (
        <CustomToastBridged
          t={t}
          title="🔓 Token Unlocked (CCIP)"
          content={
            <>
              <p><strong>Token:</strong> {token}</p>
              <p><strong>Amount:</strong> {formatUnits(amount, 6)}</p>
            </>
          }
        />
      ));
      triggerUpdateState()
    },
    [address, triggerUpdateState]
  );

  useWatchMintedTokenVL({ onMinted: handleMintedVL });
  useWatchUnlockedTokenVL({ onUnlocked: handleUnlockedVL });
  useWatchMintTokenCCIP({ recipient: address ?? "", onMint: handleMintedCCIP });
  useWatchUnlockTokenCCIP({
    chainId: Number(import.meta.env.VITE_ETH_CHAIN_ID),
    user: address ?? "",
    onUnlock: handleUnlockedCCIP,
  });
};
