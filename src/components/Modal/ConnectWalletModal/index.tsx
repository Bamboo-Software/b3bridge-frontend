/* eslint-disable @next/next/no-img-element */
"use client";

declare global {
  interface Window {
    keplr?: any;
    getOfflineSigner?: any;
  }
}
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useWallet } from "@/hooks/useWallet";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useModalStore } from "@/store/useModalStore";

const FIXED_WALLETS = [
  {
    id: "metaMaskSDK",
    name: "MetaMask",
    icon: "/svg/metamask-icon.svg",
  },
  {
    id: "app.phantom",
    name: "Phantom",
    icon: "/svg/phantom-wallet.svg",
  },
  {
    id: "com.okex.wallet",
    name: "OKX Wallet",
    icon: "/svg/okx-logo.svg",
  },
  {
    id: "walletConnect",
    name: "Wallet Connect",
    icon: "/images/walletconnect-logo.png",
  },
  // {
  //   id: "sei-testnet",
  //   name: "MetaMask (Sei Testnet)",
  //   icon: "/svg/metamask-icon.svg",
  // },
  // {
  //   id: "app.phantom",
  //   name: "Phantom",
  //   icon: "/svg/phantom-wallet.svg",
  // },
  // {
  //   id: "com.okex.wallet",
  //   name: "OKX Wallet",
  //   icon: "/svg/okx-logo.svg",
  // },
  // {
  // {
  //   id: "keplr-sei",
  //   name: "Keplr (Sei EVM)",
  //   icon: "/svg/keplr-icon.svg",
  // },
];

export const WalletConnectModal = () => {
  const { isOpen, closeWalletModal } = useModalStore();
  const { connectors, connect, status,connectKeplrEVM } = useWallet();
  const [connectingId, setConnectingId] = useState<string | null>(null);
 const { wallets,connectWallet } = useWallet();
  const handleConnect = async (walletId: string) => {
  //    if (walletId === "keplr-sei") {
  //   try {
  //     setConnectingId(walletId);
  //     await connectKeplrEVM(1328);
  //     closeWalletModal();
  //   } catch (err) {
  //     console.error("Keplr connection failed:", err);
  //   } finally {
  //     setConnectingId(null);
  //   }
  //   return;
  // }
  // if (walletId === "sei-testnet") {
  //   try {
  //     setConnectingId(walletId);
  //     await connectWallet(1328);
  //     closeWalletModal();
  //   } catch (err) {
  //     console.error("MetaMask connection failed:", err);
  //   } finally {
  //     setConnectingId(null);
  //   }
  //   return;
  // }

  const connector = connectors.find(
    (c) => c.id === walletId || c.name.toLowerCase().includes(walletId.toLowerCase())
  );
  if (!connector) {
    console.warn(`No connector found for wallet id: ${walletId}`);
    return;
  }

  setConnectingId(connector.id);
  connect({ connector });
};
      useEffect(() => {
      if (wallets) closeWalletModal()
    },[wallets,closeWalletModal])
  return (
    <Dialog open={isOpen} onOpenChange={closeWalletModal}>
      <DialogContent className="bg-black border-none">
        <DialogHeader>
          <DialogTitle className="text-white">Select Wallet</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4">
          {FIXED_WALLETS.map((wallet) => (
            <Button
              key={wallet.id}
              onClick={() => handleConnect(wallet.id)}
              className="flex items-center gap-2 px-5 py-2.5 text-lg font-semibold bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full shadow-lg hover:shadow-green-500/50 transition-all duration-300"
            >
              <img
                src={wallet.icon}
                width={20}
                height={20}
                alt={`${wallet.name} logo`}
              />
              {status === "pending" && connectingId === wallet.id ? (
                <span>Connecting...</span>
              ) : (
                <span>{wallet.name}</span>
              )}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};