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

export function useWallet() {
  const { address, isConnected } = useAccount();
  const currentChainId = useChainId();
  const { connect, status, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { fromChainIdStore } = useModalStore();

  const [wallet, setWallet] = useState<WalletInfo | undefined>();
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // 🧠 Auto switch mạng nếu không khớp
  useEffect(() => {
    const autoSwitchNetwork = async () => {
      if (
        isConnected &&
        address &&
        typeof currentChainId === "number" &&
        fromChainIdStore &&
        currentChainId !== fromChainIdStore
      ) {
        try {
          await switchChain({ chainId: fromChainIdStore });
        } catch (error: any) {
          if (error?.name === "UserRejectedRequestError") {
            console.warn("⚠️ User từ chối chuyển mạng.");
          } else {
            console.error(`❌ Không thể chuyển mạng:`, error);
          }
        }
      }
    };

    autoSwitchNetwork();
  }, [isConnected, currentChainId, fromChainIdStore, address, switchChain]);

  // 📝 Cập nhật ví đang dùng
  useEffect(() => {
    if (isDisconnecting) return;

    if (isConnected && address && typeof currentChainId === "number") {
      setWallet({
        address: address as `0x${string}`,
        source: "wagmi",
      });
      localStorage.setItem(
        "wallet",
        JSON.stringify({
          address,
          source: "wagmi",
        })
      );
    } else {
      setWallet(undefined);
      localStorage.removeItem("wallet");
    }
  }, [address, currentChainId, isConnected, isDisconnecting]);

  useEffect(() => {
    const saved = localStorage.getItem("wallet");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setWallet(parsed);
      } catch (e) {
        console.error("❌ Lỗi parse wallet từ localStorage:", e);
      }
    }
  }, []);


  const disconnectWallet = async (walletProvider?: WalletInfo["source"]) => {
    try {
      setIsDisconnecting(true);

      if (walletProvider === "phantom" && window.phantom?.solana) {
        await window.phantom.solana.disconnect();
      } else if (walletProvider === "okx" && window.okxwallet) {
        await window.okxwallet.disconnect();
      } else if (walletProvider === "wagmi" || !walletProvider) {
        await disconnect();
      } else {
        throw new Error(`Ví không được hỗ trợ: ${walletProvider}`);
      }

      setWallet(undefined);
      localStorage.removeItem("wallet");
    } catch (error) {
      console.error(`Lỗi khi ngắt kết nối ví:`, error);
      throw error;
    } finally {
      setIsDisconnecting(false);
    }
  };


  const switchNetWorkWallet = async (chainId: number, isFromChain: boolean) => {
    try {
      if (currentChainId !== chainId && isFromChain) {
        await switchChain({ chainId });
      }
    } catch (error) {
      console.error(`Lỗi khi chuyển mạng sang chuỗi ${chainId}:`, error);
      throw error;
    }
  };


  const getCurrentChain = (chainId: number) => {
    return networkConfig.chains.find((c) => c.chain.id === chainId)?.chain || null;
  };

  return {
    wallet,
    status,
    connect,
    connectors,
    currentChainId,
    isConnected,
    switchNetWorkWallet,
    disconnect: disconnectWallet,
    getCurrentChain,
    setWallet,
  };
}
