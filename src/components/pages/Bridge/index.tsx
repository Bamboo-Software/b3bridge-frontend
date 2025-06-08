/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWallet } from "@/hooks/useWallet";
import { useBridge } from "@/hooks/useCCIPBridge";
import { networkConfig } from "@/configs/networkConfig";
import { parseUnits, formatUnits } from "viem";
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
  const [fromChainId, setFromChainId] = useState<number | undefined>(networkConfig.chains[0]?.chain.id);
  const [toChainId, setToChainId] = useState<number | undefined>(undefined);
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState<string>(networkConfig.tokensList[0]?.symbol || "ETH");
  const [receiverAddress, setReceiverAddress] = useState<string>("");
  const [selectedTab, setSelectedTab] = useState("bridge");

  const selectedTokenConfig = useMemo(
    () => networkConfig.tokensList.find((t) => t.symbol === selectedToken),
    [selectedToken]
  );

  const address = fromChainId ? wallets[fromChainId]?.address : undefined;

  const availableTokens = useMemo(() => {
    if (!fromChainId) return [];
    return networkConfig.tokensList.filter((token) => {
      if (token.symbol === "ETH") return true;
      return token.address[fromChainId] !== undefined;
    });
  }, [fromChainId]);

  const { data: balance, refetch: refetchBalance } = useBalance({
    address: address as `0x${string}` | undefined,
    chainId: fromChainId,
    token:
      selectedToken !== "ETH" && fromChainId && selectedTokenConfig
        ? (selectedTokenConfig.address[fromChainId] as `0x${string}`)
        : undefined,
  });

  useEffect(() => {
    if (address && fromChainId && selectedTokenConfig) {
      refetchBalance();
    }
  }, [address, fromChainId, selectedToken, selectedTokenConfig, refetchBalance]);

  const handleBridgeClick = async (data: {
    fromChainId: number;
    toChainId: number;
    amount: string;
    tokenAddress: string;
    receiverAddress: `0x${string}`;
    balance: {
    decimals: number;
    formatted: string;
    symbol: string;
    value: bigint;
} | undefined
  }) => {
    console.log("🚀 ~ BridgePage ~  data.fromChainId",
    data.fromChainId,
    data.toChainId,
      data.amount,
    balance,
    data.tokenAddress,
    data.receiverAddress)
    try {
      await handleBridge(
        data.fromChainId,
        data.toChainId,
        data.amount,
        balance,
        data.tokenAddress,
        data.receiverAddress,
        { isOFT: false }
      );
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

// export const formatBalance = (value: bigint | undefined, decimals: number = 18) => {
//   if (!value) return "0";
//   return formatUnits(value, decimals);
// };