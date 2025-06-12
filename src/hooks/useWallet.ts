import { useState, useEffect } from "react";
import {
  useAccount,
  useChainId,
  useConnect,
  useDisconnect,
  useSwitchChain,
} from "wagmi";
import { networkConfig } from "@/configs/networkConfig";
import { useModalStore } from "@/store/useModalStore";
declare global {
  interface Window {
    keplr?: any;
    phantom?: any;
    okxwallet?: any;
    getOfflineSigner?: any;
  }
}
interface WalletInfo {
  address: `0x${string}`;
  source: "wagmi" | "manual" | "keplr" | "phantom" | "okx";
}

interface WalletData {
  [chainId: number]: WalletInfo | undefined;
}

export function useWallet() {
  const { address, isConnected } = useAccount();
  const currentChainId = useChainId();
  const { connect, status, connectors } = useConnect();
  const {fromChainIdStore}=useModalStore()
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const [wallets, setWallets] = useState<WalletData>({});
  const [isDisconnecting, setIsDisconnecting] = useState(false);


  useEffect(() => {
    setWallets((prev) => {
      let newWallets = { ...prev };
      if (isDisconnecting) {
        return newWallets;
      }
      if (isConnected && address && typeof currentChainId === "number") {
        const existing = newWallets[currentChainId];
        if (!(existing?.address === address && existing.source === "wagmi")) {
          newWallets[currentChainId] = {
            address: address as `0x${string}`,
            source: "wagmi",
          };
        }
      } else {
        if (typeof currentChainId === "number") {
          delete newWallets[currentChainId];
        }
      }

      return newWallets;
    });
  }, [address, currentChainId, isConnected, isDisconnecting]);

  const disconnectWallet = async (chainId: number, walletProvider?: WalletInfo["source"]) => {
    try {
      setIsDisconnecting(true);
      if (walletProvider === "phantom" && window.phantom?.solana) {
        await window.phantom.solana.disconnect();
      } else if (walletProvider === "okx" && window.okxwallet) {
        await window.okxwallet.disconnect();
      } else if (walletProvider === "wagmi" || !walletProvider) {
        if (currentChainId === chainId) {
          await disconnect();
        }
      } else {
        throw new Error(`Ví không được hỗ trợ: ${walletProvider}`);
      }
      setWallets((prev) => {
        const newWallets = { ...prev };
        delete newWallets[chainId];
        return newWallets;
      });
    } catch (error) {
      console.error(`Lỗi khi ngắt kết nối ví trên chuỗi ${chainId}:`, error);

      throw error;
    } finally {
      setIsDisconnecting(false);
    }
  };

  // Hàm chuyển mạng
 const switchNetWorkWallet = async (chainId: number, isFromChain: boolean) => {
  try {
    setIsDisconnecting(false);

    if (currentChainId !== chainId && isFromChain) {
      await switchChain({ chainId });
    }
  } catch (error) {
    console.error(`Lỗi khi chuyển mạng sang chuỗi ${chainId}:`, error);
    throw error;
  }
};

  // Lấy thông tin chuỗi hiện tại
  const getCurrentChain = (chainId: number) => {
    return networkConfig.chains.find((c) => c.chain.id === chainId)?.chain || null;
  };

  return {
    wallets,
    status,
    connect,
    connectors,
    currentChainId,
    isConnected,
    switchNetWorkWallet,
    disconnect: disconnectWallet,
    getCurrentChain,
    setWallets,
  };
}