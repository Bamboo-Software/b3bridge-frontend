/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWallet } from "@/hooks/useWallet";
import { useCCIPBridge } from "@/hooks/useCCIPBridge";
import { ethChain, networkConfig } from "@/configs/networkConfig";
import { useBalance, useChainId } from "wagmi";
import BridgeTab, { FormData } from "./BridgeTab";
import { bridgeTabs } from "@/constants";
import HistoryTab from "./HistoryTab";
import { useModalStore } from "@/store/useModalStore";
import { useWatchMintedTokenVL } from "@/hooks/useListenMintedTokenVL";
import { toast } from "sonner";
import { useWatchUnlockedTokenVL } from "@/hooks/usePollUnlockedTokenVL";
import { useWatchMintTokenCCIP } from "@/hooks/usePollMintTokenCCIP";
import { useWatchUnlockTokenCCIP } from "@/hooks/usePollUnlockTokenCCIP";
import { useForm } from "react-hook-form";
import { formatLength } from "@/utils";
import { useBridgeStatusStore } from "@/store/useBridgeStatusStore";
import { formatUnits } from "ethers";
import { CustomToastBridged } from "@/components/Modal/ToastBridged";
interface ChainConfig {
  chain: { id: number; name: string };
  logoURL?: string;
}


export default function BridgePage() {
  const { wallet } = useWallet();
  const {  error,state } = useCCIPBridge();
  const [fromChainId, setFromChainId] = useState<number | undefined>(undefined);
  const [toChainId, setToChainId] = useState<number | undefined>(undefined);
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState<string>("");
  const [receiverAddress, setReceiverAddress] = useState<string>("");
  const [selectedTab, setSelectedTab] = useState("bridge");
  const triggerReset = useBridgeStatusStore((state) => state.triggerReset);
  const setFromChainIdStore = useModalStore.getState().setFromChainIdStore;
  const selectedTokenConfig = useMemo(
    () => networkConfig.tokensList.find((t) => t.symbol === selectedToken),
    [selectedToken]
  );
  const address = wallet ? wallet?.address : undefined;
// Initialize react-hook-form
  const {
  register,
  control,
  handleSubmit,
  formState: { errors, isValid },
  setValue,
  watch,
  reset
} = useForm<FormData>({
  defaultValues: {
    fromChainId: fromChainId?.toString() || "",
    toChainId: toChainId?.toString() || "",
    amount: formatLength(amount) || "",
    selectedToken: selectedToken || "",
    receiverAddress: receiverAddress || "",
    },
    mode: "onChange",
});
  const formValues = watch();
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
  const handleMinted = useCallback(
  ({ recipientAddr, token, amount }: any) => {
    if (!recipientAddr) return;
    toast.custom((t) => (
      <CustomToastBridged
        t={t}
        title="🎉 Token Minted on SEI"
        content={
          <>
            <p><strong>Recipient:</strong> {recipientAddr}</p>
            <p><strong>Token:</strong> {token}</p>
            <p><strong>Amount:</strong> {formatUnits(amount, 18).toString()}</p>
          </>
        }
      />
    ));

    triggerReset();
  },
  [triggerReset]
);
    useWatchMintedTokenVL({
      // recipient: recipient,
    onMinted:handleMinted,
    });

  const handleUnlocked = useCallback(
  ({ recipientAddr, amount }: { recipientAddr: string; amount: bigint }) => {
    if (!wallet?.address) return;

    toast.custom((t) => (
      <CustomToastBridged
        t={t}
        title="🔓 Token Unlocked"
        content={
          <>
            <p><strong>Recipient:</strong> {wallet.address}</p>
            <p><strong>Amount:</strong> {formatUnits(amount, 18).toString()}</p>
          </>
        }
      />
    ));

    triggerReset();
  },
  [wallet?.address, triggerReset]
);

useWatchUnlockedTokenVL({
  onUnlocked: handleUnlocked,
});

 const handleMintedCCIP = useCallback(
  ({ tokenId, amount }: { tokenId: string; amount: bigint }) => {
    if (!wallet?.address) return;

    toast.custom((t) => (
      <CustomToastBridged
        t={t}
        title="✅ Token Minted (CCIP)"
        content={
          <>
            <p><strong>Token ID:</strong> {tokenId}</p>
            <p><strong>Amount:</strong> {formatUnits(amount, 6).toString()}</p>
          </>
        }
      />
    ));

    triggerReset();
  },
  [wallet?.address, triggerReset]
);

useWatchMintTokenCCIP({
  chainId: Number(process.env.NEXT_PUBLIC_SEI_CHAIN_ID),
  recipient: wallet?.address ?? "",
  onMint: handleMintedCCIP,
});

  const handleUnlockedCCIP = useCallback(
  ({ token, amount }: { token: string; amount: bigint }) => {
    if (!wallet?.address) return;

    toast.custom((t) => (
      <CustomToastBridged
        t={t}
        title="🔓 Token Unlocked (CCIP)"
        content={
          <>
            <p><strong>Token:</strong> {token}</p>
            <p><strong>Amount:</strong> {formatUnits(amount, 6).toString()}</p>
          </>
        }
      />
    ));

    triggerReset();
  },
  [wallet?.address, triggerReset]
);


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
  useEffect(() => {
    if (error) {
      toast.custom((t) => (
        <CustomToastBridged
          t={t}
          title="❌ Bridge Error"
          content={
            <div>
              <p className="text-red-400">{typeof error === "string" ? error : "An unknown error occurred."}</p>
            </div>
          }
        />
      ));
    }
  }, [error]);

  return (
    <div className="w-full max-w-lg mx-auto font-manrope">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl rounded-2xl border border-green-500/40 shadow-2xl p-6"
      >
        <Tabs defaultValue={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-2 bg-gray-800/60 border border-green-500/40 rounded-full p-1 h-12 mb-2">
            {bridgeTabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white rounded-full transition-all"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="font-manrope max-h-[calc(85vh-100px)]  overflow-y-auto px-4 custom-scrollbar">
          <BridgeTab
            setFromChainId={setFromChainId}
            formValues={formValues}
            setToChainId={setToChainId}
            setAmount={setAmount}
            fromChain={fromChain}
              toChain={toChain}
              handleSubmit={handleSubmit}
              control={control}
              setValue={setValue}
              reset={reset}
              errors={errors}
            supportedChains={supportedChains}
            availableTokens={availableTokens}
            setSelectedToken={setSelectedToken}
            state={state}
            balance={balance}
              error={error}
              isValid={isValid}
            selectedTokenConfig={selectedTokenConfig}
            setReceiverAddress={setReceiverAddress}
          />
          <HistoryTab />

          </div>
        </Tabs>
      </motion.div>
    </div>
  );
}
