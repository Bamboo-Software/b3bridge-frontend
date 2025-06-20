/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWallet } from "@/hooks/useWallet";
import { useCCIPBridge } from "@/hooks/useCCIPBridge";
import { networkConfig, ethChain } from "@/configs/networkConfig";
import { useBalance, useChainId } from "wagmi";
import BridgeTab from "./BridgeTab";
import { bridgeTabs } from "@/constants";
import HistoryTab from "./HistoryTab";
import { useModalStore } from "@/store/useModalStore";
import { usePollMintedTokenVL } from "@/hooks/useListenMintedTokenVL";
import { toast } from "sonner";
import { usePollUnlockedTokenERC20VL } from "@/hooks/usePollUnlockedTokenERC20VL";
import { usePollUnlockedTokenVL } from "@/hooks/usePollUnlockedTokenVL";
import { usePollMintTokenCCIP } from "@/hooks/usePollMintTokenCCIP";
import { usePollUnlockTokenCCIP } from "@/hooks/usePollUnlockTokenCCIP";
import { useForm } from "react-hook-form";
import { formatLength } from "@/utils";
import { useBridgeStatusStore } from "@/store/useBridgeStatusStore";

interface ChainConfig {
  chain: { id: number; name: string };
  logoURL?: string;
}


export default function BridgePage() {
  const { wallet } = useWallet();
  const { isBridging, isNativeLockPending, isERC20LockPending, error,state,setState } = useCCIPBridge();
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
    toast.success(`Token minted: ${amount.toString()} at ${token}`);
    // setState((prev) => ({ ...prev, nativeLockHash: undefined  }));
    triggerReset();
  }, [triggerReset]);
    usePollMintedTokenVL({
      recipient: recipient,
    onMinted:handleMinted,
    });

  const handleUnlocked = useCallback(({ amount }: { amount: bigint }) => {
  if (!wallet?.address) return;

  console.log("🎉 Native unlocked", amount);
  toast.success(`Token unlocked: ${amount.toString()}`);
  triggerReset();
}, [wallet?.address, triggerReset]);

usePollUnlockedTokenVL({
  recipient: wallet?.address ?? "",
  onUnlocked: handleUnlocked,
});

  const handleMintedCCIP = useCallback(({ tokenId, amount }: { tokenId: string; amount: bigint }) => {
  if (!wallet?.address) return;

  console.log("✅ Minted:", tokenId, amount);
  toast.success(`Token minted: ${amount.toString()} (Token ID: ${tokenId})`);
  triggerReset();
}, [wallet?.address, triggerReset]);

usePollMintTokenCCIP({
  chainId: 1329,
  recipient: wallet?.address ?? "",
  onMint: handleMintedCCIP,
});

  const handleUnlockedCCIP = useCallback(({ token, amount }: { token: string; amount: bigint }) => {
  if (!wallet?.address) return;

  console.log("🔓 Unlocked:", token, amount);
  toast.success(`Token unlocked: ${amount.toString()} from ${token}`);
  triggerReset();
}, [wallet?.address, triggerReset]);


usePollUnlockTokenCCIP({
  chainId: 11155111,
  user: wallet?.address ?? "",
  // enabled: true,
  onUnlock: handleUnlockedCCIP,
});

useEffect(() => {
  if (address && fromChainId && selectedTokenConfig) {
    setFromChainIdStore(fromChainId);
    refetchBalance();
  }
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [address, fromChainId, selectedToken, selectedTokenConfig, refetchBalance]);


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
          <div className="font-manrope h-[calc(70vh-100px)] overflow-y-auto px-4 custom-scrollbar">
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
