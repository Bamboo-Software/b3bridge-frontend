import { useState, useEffect } from "react";
import {
  useAccount,
  useChainId,
  useConnect,
  useDisconnect,
  useSwitchChain,
} from "wagmi";
import { injected } from "wagmi/connectors";
import { networkConfig } from "@/configs/networkConfig";

interface WalletInfo {
  address: `0x${string}`;
  source: "wagmi" | "manual" | "keplr";
}

interface WalletData {
  [chainId: number]: WalletInfo | undefined;
}

export function useWallet() {
  const { address, isConnected } = useAccount();
  const currentChainId = useChainId();
  const { connect, status, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const [wallets, setWallets] = useState<WalletData>({});
  console.log("🚀 ~ useWallet ~ wallets:", wallets)
const [keplrAddress, setKeplrAddress] = useState<string | null>(null);
  // Khi kết nối thành công qua wagmi thì lưu vào state
  // useEffect(() => {
  //   if (isConnected && address && currentChainId) {
  //     setWallets((prev) => ({
  //       ...prev,
  //       [currentChainId]: {
  //         address: address as `0x${string}`,
  //         source: "wagmi",
  //       },
  //     }));
  //   }
  // }, [address, currentChainId, isConnected]);
useEffect(() => {
  setWallets(prev => {
    let newWallets = { ...prev };

    if (isConnected && address && typeof currentChainId === "number") {
      const existing = newWallets[currentChainId];
      if (!(existing?.address === address && existing.source === "wagmi")) {
        newWallets[currentChainId] = {
          address: address as `0x${string}`,
          source: "wagmi",
        };
      }
    }

    if (keplrAddress) {
      const existingKeplr = newWallets[1328];
      if (!(existingKeplr?.address === keplrAddress && existingKeplr.source === "keplr")) {
        newWallets[1328] = {
          address: keplrAddress as `0x${string}`,
          source: "keplr",
        };
      }
    }

    return newWallets;
  });
}, [address, currentChainId, isConnected, keplrAddress]);



  const connectWallet = async (chainId: number) => {
    try {
      if (currentChainId !== chainId) {
        await switchChain({ chainId });
      }
      await connect({ connector: injected() });
    } catch (error) {
      console.error(`Failed to connect wallet on chain ${chainId}:`, error);
      throw error;
    }
  };

  const disconnectWallet = async (chainId: number) => {
    try {
      if (currentChainId === chainId) {
        await disconnect();
      }
      setWallets((prev) => {
        const newWallets = { ...prev };
        delete newWallets[chainId];
        return newWallets;
      });
    } catch (error) {
      console.error(`Failed to disconnect wallet on chain ${chainId}:`, error);
    }
  };

  const getCurrentChain = (chainId: number) => {
    return networkConfig.chains.find((c) => c.chain.id === chainId)?.chain || null;
  };

  const setWalletManually = (chainId: number, address: `0x${string}`, source: "manual" | "keplr" = "manual") => {
    setWallets((prev) => ({
      ...prev,
      [chainId]: {
        address,
        source,
      },
    }));
  };

  return {
    wallets,             
    status,
    connect,
    connectors,
    currentChainId,
    isConnected,
    connectWallet,
    disconnect: disconnectWallet,
    getCurrentChain,
    setWalletManually,
    setWallets,
    setKeplrAddress,
    keplrAddress
  };
}
