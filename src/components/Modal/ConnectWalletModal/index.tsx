// components/WalletConnectModal.tsx
"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useWallet } from "@/hooks/useWallet";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState } from "react";
const walletIcons: Record<string, string> = {
  "metaMaskSDK": "/svg/metamask-icon.svg",
  "app.phantom": "/svg/phantom-wallet.svg",
  "com.okex.wallet": "/svg/okx-logo.svg",
  "walletConnect": "/svg/phantom-wallet.svg",
};
type Props = {
  open: boolean;
  onClose: () => void;
};

export const WalletConnectModal = ({ open, onClose }: Props) => {
  const { connectors, connect, status, chainId } = useWallet();
  const [connectingId, setConnectingId] = useState<string | null>(null);

  const handleConnect = (connector: typeof connectors[0]) => {
    setConnectingId(connector.id);
    connect({ connector, chainId });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-black border-none">
        <DialogHeader>
          <DialogTitle className="text-white">Select Wallet</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4">
          {connectors.map((connector) => (
            <Button
              key={connector.id}
              onClick={() => handleConnect(connector)}
              className="px-5 py-2.5 text-lg font-semibold bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full shadow-lg hover:shadow-green-500/50 transition-all duration-300"
            >
              <Image
                src={walletIcons[connector.id]}
                width={20}
                height={20}
                alt={`${connector.name} logo`}
              />
              {status === "pending" && connectingId === connector.id ? (
                <span className="ml-2">Connecting...</span>
              ) : (
                <span>{connector.name}</span>
              )}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
