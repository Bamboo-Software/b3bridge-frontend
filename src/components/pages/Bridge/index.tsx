/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWallet } from "@/hooks/useWallet";
import { useBridge } from "@/hooks/useCCIPBridge";
import { networkConfig } from "@/configs/networkConfig";
import { parseUnits } from "viem";
import { useBalance } from "wagmi";
import BridgeTab from "./BridgeTab";
import { bridgeTabs } from "@/constants";
import HistoryTab from "./HistoryTab";
import { useModalStore } from "@/store/useModalStore";

interface ChainConfig {
  chain: { id: number; name: string };
  logoURL?: string;
}

interface Token {
  symbol: string;
  address: { [chainId: number]: string };
  decimals: number;
  logoURL: string;
}

export default function BridgePage() {
  const { wallets, connectWallet } = useWallet();
  const { isBridging, isNativeLockPending, isERC20LockPending, error, handleBridge } = useBridge();
  const { openWalletModal } = useModalStore();
  const [amount, setAmount] = useState("");
  const [fromChainId, setFromChainId] = useState<number | undefined>(undefined);
  const [toChainId, setToChainId] = useState<number | undefined>(undefined);
  const [selectedToken, setSelectedToken] = useState<string>("");
  const [receiverAddress, setReceiverAddress] = useState<string>("");
  const [selectedTab, setSelectedTab] = useState("bridge");

  const selectedTokenConfig = useMemo(
    () => networkConfig.tokensList.find((t) => t.symbol === selectedToken),
    [selectedToken]
  );

  const address = fromChainId ? wallets[fromChainId] : undefined;

  const { data: balance, refetch: refetchBalance } = useBalance({
    address: address as `0x${string}` | undefined,
    chainId: fromChainId,
    token: selectedToken !== "ETH" ? (fromChainId ? selectedTokenConfig?.address[fromChainId] as `0x${string}` | undefined : undefined) : undefined,
  });

  const availableTokens = useMemo(() => {
    if (!fromChainId) return []; // Trả về mảng rỗng nếu chưa chọn chain From
    return networkConfig.tokensList.filter((token) => {
      if (token.symbol === "ETH") return true;
      return token.address[fromChainId] !== undefined;
    });
  }, [fromChainId]);

  // Đồng bộ receiverAddress với địa chỉ ví
  // useEffect(() => {
  //   if (address && !receiverAddress) {
  //     setReceiverAddress(address);
  //   }
  // }, [address, receiverAddress]);

  // Refetch balance khi chain hoặc token thay đổi
  useEffect(() => {
    if (address && fromChainId && selectedTokenConfig) {
      refetchBalance();
    }
  }, [address, fromChainId, selectedToken, selectedTokenConfig, refetchBalance]);

  const parseAmount = (amount: string, decimals: number = 18) => {
    try {
      return parseUnits(amount, decimals);
    } catch (e) {
      return BigInt(0);
    }
  };

  const handleBridgeClick = async () => {
    if (!address || !fromChainId) {
      if (fromChainId) {
        await connectWallet(fromChainId);
        openWalletModal();
      }
      return;
    }

    if (!toChainId || !wallets[toChainId]) {
      if (toChainId) {
        await connectWallet(toChainId);
        openWalletModal();
      }
      return;
    }

    if (!amount || !fromChainId || !toChainId || !receiverAddress || !selectedTokenConfig) {
      console.error("Missing required bridge parameters");
      return;
    }

    const tokenAddress = selectedToken !== "ETH" ? (selectedTokenConfig.address[fromChainId] as `0x${string}`) || "" : "";
    const decimals = selectedTokenConfig.decimals || 18;
    const amountInWei = parseAmount(amount, decimals);

    try {
      await handleBridge(fromChainId, toChainId, amount, tokenAddress, receiverAddress as `0x${string}`, {
        isOFT: false,
      });
    } catch (err) {
      console.error("Bridge failed:", err);
    }
  };

  const fromChain = fromChainId ? networkConfig.chains.find((c) => c.chain.id === fromChainId) : undefined;
  const toChain = toChainId ? networkConfig.chains.find((c) => c.chain.id === toChainId) : undefined;
  const supportedChains: ChainConfig[] = networkConfig.chains;

  return (
    <div className="w-full max-w-lg mx-auto font-poppins">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl rounded-2xl border border-green-500/40 shadow-2xl p-6"
      >
        <Tabs defaultValue="bridge" onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-2 bg-gray-800/60 border border-green-500/40 rounded-full p-1 h-12 mb-8">
            {bridgeTabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="text-lg font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white rounded-full transition-all"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <BridgeTab
            setFromChainId={setFromChainId}
            setToChainId={setToChainId}
            setAmount={setAmount}
            fromChain={fromChain}
            toChain={toChain}
            fromChainId={fromChainId}
            toChainId={toChainId}
            isBridging={isBridging}
            supportedChains={supportedChains}
            availableTokens={availableTokens}
            selectedToken={selectedToken}
            setSelectedToken={setSelectedToken}
            isNativeLockPending={isNativeLockPending}
            isERC20LockPending={isERC20LockPending}
            amount={amount}
            balance={balance}
            handleBridgeClick={handleBridgeClick}
            error={error}
            selectedTokenConfig={selectedTokenConfig}
            receiverAddress={receiverAddress}
            setReceiverAddress={setReceiverAddress}
          />
          <HistoryTab />
        </Tabs>
      </motion.div>
    </div>
  );
}