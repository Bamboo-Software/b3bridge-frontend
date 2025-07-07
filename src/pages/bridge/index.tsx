/* eslint-disable @typescript-eslint/no-explicit-any */


import CustomToastBridged from "@/components/ToastBridgedLocal";
import BridgeFormWrap from "./components/BridgeFormWrap";

import {  useWatchMintTokenCCIP } from "@/hooks/event/useMintTokenCCIP";

import { useCallback } from "react";
import { toast } from "sonner";
import { formatUnits } from "viem";
import { useWatchMintedTokenVL } from "@/hooks/event/useMintTokenVL";
import { useAccount } from "wagmi";
import { useWatchUnlockTokenCCIP } from "@/hooks/event/useUnlockTokenCCIP";
import { useWatchUnlockedTokenVL } from "@/hooks/event/useUnlockTokenVL";


const BridgePage = () => {

  const { address }=useAccount()
  const handleMinted = useCallback(
    ({ recipientAddr, token, amount }: any) => {
      if (!address) return;
    if (!recipientAddr) return;
    toast.custom((t) => (
      <CustomToastBridged
        t={t}
        title="🎉 Token Minted on SEI"
        content={
          <>
            <p><strong>Recipient:</strong> {recipientAddr}</p>
            <p><strong>Token:</strong> {token}</p>
            <p><strong>Amount:</strong> {formatUnits(amount, 18).toString()}</p>
          </>
        }
      />
    ));

  },
  [address]
);
    useWatchMintedTokenVL({
      // recipient: recipient,
    onMinted:handleMinted,
    });

  const handleUnlocked = useCallback(
  ({ amount }: { recipientAddr: string; amount: bigint }) => {
    if (!address) return;

    toast.custom((t) => (
      <CustomToastBridged
        t={t}
        title="🔓 Token Unlocked"
        content={
          <>
            <p><strong>Recipient:</strong> {address}</p>
            <p><strong>Amount:</strong> {formatUnits(amount, 18).toString()}</p>
          </>
        }
      />
    ));

  },
  [address]
);

useWatchUnlockedTokenVL({
  onUnlocked: handleUnlocked,
});

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
            <p><strong>Amount:</strong> {formatUnits(amount, 6).toString()}</p>
          </>
        }
      />
    ));

  },
  [address]
);

useWatchMintTokenCCIP({
  recipient: address ?? "",
  onMint: handleMintedCCIP,
});

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
            <p><strong>Amount:</strong> {formatUnits(amount, 6).toString()}</p>
          </>
        }
      />
    ));

  },
  [address]
);


useWatchUnlockTokenCCIP({
  chainId: Number(import.meta.env.VITE_ETH_CHAIN_ID),
  user: address ?? "",
  onUnlock: handleUnlockedCCIP
});



  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <BridgeFormWrap />
          <div className="mt-2 text-center text-sm text-muted-foreground">
            <footer className="fixed bottom-0 left-0 w-full bg-background border-t text-center text-sm text-muted-foreground py-2 z-50">
            <p>Powered by B3Bridge Protocol - Secure, Fast, and Reliable</p>
          </footer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BridgePage;