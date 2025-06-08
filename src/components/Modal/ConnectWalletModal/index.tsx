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
  {
  id: "metamask-evm-sei",
  name: "Keplr",
  icon: "/svg/keplr-logo.svg",
},
];

export const WalletConnectModal = () => {
  const { isOpen, closeWalletModal } = useModalStore();
  const { connectors, connect, status,setWallets,setWalletManually } = useWallet();
  const [connectingId, setConnectingId] = useState<string | null>(null);
 const { wallets } = useWallet();
  const handleConnect =async  (walletId: string) => {
   if (walletId === "keplr") {
    try {
      setConnectingId(walletId);
      if (!window.keplr) {
        alert("Keplr extension not found!");
        return;
      }

      // Gợi ý chain Sei Testnet Cosmos (atlantic-2)
      await window.keplr.experimentalSuggestChain({
        chainId: "atlantic-2",
        chainName: "Sei Testnet (Cosmos)",
        rpc: "https://rpc.atlantic-2.seinetwork.io",
        rest: "https://lcd.atlantic-2.seinetwork.io",
        bip44: {
          coinType: 118,
        },
        bech32Config: {
          bech32PrefixAccAddr: "sei",
          bech32PrefixAccPub: "seipub",
          bech32PrefixValAddr: "seivaloper",
          bech32PrefixValPub: "seivaloperpub",
          bech32PrefixConsAddr: "seivalcons",
          bech32PrefixConsPub: "seivalconspub",
        },
        currencies: [
          {
            coinDenom: "SEI",
            coinMinimalDenom: "usei",
            coinDecimals: 6,
            coinGeckoId: "sei-network",
          },
        ],
        feeCurrencies: [
          {
            coinDenom: "SEI",
            coinMinimalDenom: "usei",
            coinDecimals: 6,
            coinGeckoId: "sei-network",
          },
        ],
        stakeCurrency: {
          coinDenom: "SEI",
          coinMinimalDenom: "usei",
          coinDecimals: 6,
          coinGeckoId: "sei-network",
        },
        features: ["stargate", "ibc-transfer"],
      });

      // Kích hoạt chain và lấy tài khoản
      await window.keplr.enable("atlantic-2");
      const offlineSigner = window.getOfflineSigner("atlantic-2");
      const accounts = await offlineSigner.getAccounts();

      // TODO: Lưu account vào global store nếu cần
      closeWalletModal();
    } catch (err) {
      console.error("Keplr connection failed:", err);
    } finally {
      setConnectingId(null);
    }
    return;
  }else if (walletId === "metamask-evm-sei") {
    try {
      setConnectingId(walletId);
      if (!window.ethereum) {
        alert("MetaMask not found!");
        return;
      }

      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x128C8",
            chainName: "Sei Testnet (EVM)",
            rpcUrls: ["https://evm-rpc.atlantic-2.seinetwork.io"],
            nativeCurrency: {
              name: "SEI",
              symbol: "SEI",
              decimals: 18,
            },
            blockExplorerUrls: ["https://sei.explorers.guru/"],
          },
        ],
      });

      const [account] = await window.ethereum.request({ method: "eth_requestAccounts" });
      setWallets((prev:any) => ({
        ...prev,
        [1328]: {
          address: account,
          provider: window.ethereum,
        },
      }));
      setWalletManually(1328, account, "keplr");
      closeWalletModal();
    } catch (err) {
      console.error("MetaMask connection failed:", err);
    } finally {
      setConnectingId(null);
    }
    return;
  }
    const connector = connectors.find((c) => c.id === walletId || c.name.toLowerCase().includes(walletId.toLowerCase()));
    if (!connector) {
      console.warn(`Connector not found for wallet id: ${walletId}`);
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