import { useState, useEffect } from "react";
import {
  useAccount,
  useChainId,
  useConnect,
  useDisconnect,
  useSwitchChain,
} from "wagmi";
import { injected } from "wagmi/connectors";
import { networkConfig, seiTestnet } from "@/configs/networkConfig";

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

    return newWallets;
  });
}, [address, currentChainId, isConnected]);

const connectKeplrEVM = async (chainId: number) => {
  try {
    if (!window.keplr) {
      throw new Error("Keplr extension not found");
    }

    const chain = networkConfig.chains.find((c) => c.chain.id === chainId);
    if (!chain) throw new Error("Invalid chain ID");

    await window.keplr.enable(seiTestnet.id);

    const ethAddress = await window.keplr.getKey(seiTestnet.id).then((res: any) => res.ethAddress);
    if (!ethAddress) throw new Error("Failed to get ethAddress from Keplr");

    setWallets((prev) => ({
      ...prev,
      [chainId]: {
        address: ethAddress as `0x${string}`,
        source: "keplr",
      },
    }));
  } catch (error) {
    console.error("Failed to connect Keplr EVM:", error);
    throw error;
  }
};


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
    connectKeplrEVM,
    // keplrAddress
  };
}
