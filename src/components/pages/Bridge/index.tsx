/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWallet } from "@/hooks/useWallet";
import { useCCIPBridge } from "@/hooks/useCCIPBridge";
import { ethChain, networkConfig } from "@/configs/networkConfig";
import { useBalance, useChainId } from "wagmi";
import BridgeTab from "./BridgeTab";
import { bridgeTabs } from "@/constants";
import HistoryTab from "./HistoryTab";
import { useModalStore } from "@/store/useModalStore";
import { useWatchMintedTokenVL } from "@/hooks/useListenMintedTokenVL";
import { toast } from "sonner";
import { usePollUnlockedTokenERC20VL } from "@/hooks/usePollUnlockedTokenERC20VL";
import { useWatchUnlockedTokenVL } from "@/hooks/usePollUnlockedTokenVL";
import { useWatchMintTokenCCIP } from "@/hooks/usePollMintTokenCCIP";
import { useWatchUnlockTokenCCIP } from "@/hooks/usePollUnlockTokenCCIP";
import { useForm } from "react-hook-form";
import { formatLength } from "@/utils";
import { useBridgeStatusStore } from "@/store/useBridgeStatusStore";
import { formatUnits } from "ethers";

interface ChainConfig {
  chain: { id: number; name: string };
  logoURL?: string;
}


export default function BridgePage() {
  const { wallet } = useWallet();
  const {  error,state,setState } = useCCIPBridge();
  const [fromChainId, setFromChainId] = useState<number | undefined>(undefined);
  const [toChainId, setToChainId] = useState<number | undefined>(undefined);
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState<string>("");
  const [receiverAddress, setReceiverAddress] = useState<string>("");
  const [selectedTab, setSelectedTab] = useState("bridge");
  const recipient = useMemo(() => wallet?.address ?? "", [wallet]);
  const triggerReset = useBridgeStatusStore((state) => state.triggerReset);
  const setFromChainIdStore = useModalStore.getState().setFromChainIdStore;
  const selectedTokenConfig = useMemo(
    () => networkConfig.tokensList.find((t) => t.symbol === selectedToken),
    [selectedToken]
  );
  const address = wallet ? wallet?.address : undefined;

  const availableTokens = useMemo(() => {
    if (!fromChainId) return [];
    return networkConfig.tokensList.filter((token) => {
      if (token.symbol === "ETH") {
        return fromChainId === ethChain.id;
      }
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
  const handleMinted = useCallback(({ recipientAddr, token, amount }: any) => {
    if (!recipientAddr) return;
    console.log("🎉 Minted on SEI!", { recipientAddr, token, amount });
    toast.success(`Token minted: ${formatUnits(amount, 6).toString()} at ${token}`);
    triggerReset();
  }, [triggerReset]);
    useWatchMintedTokenVL({
      recipient: recipient,
    onMinted:handleMinted,
    });

  const handleUnlocked = useCallback(
  ({ recipientAddr, amount }: { recipientAddr: string; amount: bigint }) => {
    if (!wallet?.address) return;

    toast.success(`Token unlocked: ${formatUnits(amount, 6).toString()}`);
    triggerReset();
  },
  [wallet?.address, triggerReset]
);

useWatchUnlockedTokenVL({
  recipient: wallet?.address ?? "",
  onUnlocked: handleUnlocked,
});

 const handleMintedCCIP = useCallback(({ tokenId, amount }: { tokenId: string; amount: bigint }) => {
  if (!wallet?.address) return;

  console.log("✅ Minted:", tokenId, amount);
  toast.success(`Token minted: ${formatUnits(amount, 6).toString()} (Token ID: ${tokenId})`);
  triggerReset();
}, [wallet?.address, triggerReset]);

useWatchMintTokenCCIP({
  chainId: Number(process.env.NEXT_PUBLIC_SEI_CHAIN_ID),
  recipient: wallet?.address ?? "",
  onMint: handleMintedCCIP,
});

  const handleUnlockedCCIP = useCallback(({ token, amount }: { token: string; amount: bigint }) => {
  if (!wallet?.address) return;

  console.log("🔓 Unlocked:", token, formatUnits(amount, 6));
  toast.success(`Token unlocked: ${formatUnits(amount, 6).toString()} from ${token}`);
  triggerReset();
}, [wallet?.address, triggerReset]);


useWatchUnlockTokenCCIP({
  chainId: Number(process.env.NEXT_PUBLIC_ETH_CHAIN_ID),
  user: wallet?.address ?? "",
  onUnlock: handleUnlockedCCIP
});

useEffect(() => {
  if (address && fromChainId && selectedTokenConfig) {
    setFromChainIdStore(fromChainId);
    refetchBalance();
  }
}, [address, fromChainId, selectedToken, selectedTokenConfig,setFromChainIdStore, refetchBalance]);


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
        <Tabs defaultValue={selectedTab} onValueChange={setSelectedTab}>
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
          <div className="font-manrope h-[calc(80vh-100px)] overflow-y-auto px-4 custom-scrollbar">
          <BridgeTab
            setFromChainId={setFromChainId}
            setToChainId={setToChainId}
            setAmount={setAmount}
            fromChain={fromChain}
            toChain={toChain}
            fromChainId={fromChainId}
            toChainId={toChainId}
            supportedChains={supportedChains}
            availableTokens={availableTokens}
            selectedToken={selectedToken}
            setSelectedToken={setSelectedToken}
            amount={amount}
            state={state}
            balance={balance}
            error={error}
            selectedTokenConfig={selectedTokenConfig}
            receiverAddress={receiverAddress}
            setReceiverAddress={setReceiverAddress}
          />
          <HistoryTab />

          </div>
        </Tabs>
      </motion.div>
    </div>
  );
}
