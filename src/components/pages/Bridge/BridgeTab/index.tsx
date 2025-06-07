/* eslint-disable @next/next/no-img-element */
"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TabsContent } from "@/components/ui/tabs";
import { Token } from "@/configs/networkConfig";
import { useWallet } from "@/hooks/useWallet";
import { useModalStore } from "@/store/useModalStore";
import { formatBalance } from "@/utils";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import React, { Dispatch, SetStateAction } from "react";

interface ChainConfig {
  chain: { id: number; name: string };
  logoURL?: string;
}

interface PropBridge {
  setFromChainId: Dispatch<SetStateAction<number | undefined>>;
  setToChainId: Dispatch<SetStateAction<number | undefined>>;
  setAmount: Dispatch<SetStateAction<string>>;
  fromChain: ChainConfig | undefined;
  toChain: ChainConfig | undefined;
  fromChainId: number | undefined;
  toChainId: number | undefined;
  isBridging: boolean;
  supportedChains: ChainConfig[];
  availableTokens: Token[];
  selectedTokenConfig: Token | undefined;
  selectedToken: string;
  setSelectedToken: Dispatch<SetStateAction<string>>;
  isNativeLockPending: boolean;
  isERC20LockPending: boolean;
  amount: string;
  balance: { decimals: number; formatted: string; symbol: string; value: bigint } | undefined;
  handleBridgeClick: () => Promise<void>;
  error: string | null;
  receiverAddress: string;
  setReceiverAddress: Dispatch<SetStateAction<string>>;
}

const ChainSelector = ({
  label,
  chainId,
  onChange,
  supportedChains,
  disabledChains,
  selectedChain,
}: {
  label: string;
  chainId: number | undefined;
  onChange: (chainId: number | undefined) => void;
  supportedChains: ChainConfig[];
  disabledChains: number[];
  selectedChain: ChainConfig | undefined;
}) => {
  const { wallets, keplrAddress } = useWallet();
  console.log("🚀 ~ keplrAddress:", keplrAddress)
  console.log("🚀 ~ wallets:", wallets)
  const walletInfo = chainId ? wallets[chainId] : undefined;
  const displayAddress =
  label === "From"
    ? chainId === 1328
      ? keplrAddress
      : walletInfo?.address
    : label === "To"
      ? chainId === 1328
        ? keplrAddress
        : walletInfo?.address
      : undefined;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-lg font-semibold text-gray-200">{label}</label>
        {displayAddress && (
          <span className="text-gray-400 font-bold">
            {`${displayAddress.slice(0, 6)}...${displayAddress.slice(-4)}`}
          </span>
        )}
      </div>
      <Select
        value={chainId?.toString() || ""}
        onValueChange={(v) => onChange(v ? Number(v) : undefined)}
      >
        <SelectTrigger className="w-full border font-manrope font-bold border-green-500/40 bg-gray-800/70 rounded-xl text-lg text-gray-400 focus:ring-2 focus:ring-green-500/60 hover:bg-gray-700/70 transition-all duration-200 flex items-center justify-between px-4 py-2">
          <SelectValue placeholder="Select a chain" className="bg-gray-800/70">
            {selectedChain && (
              <div className="flex items-center gap-2">
                <img
                  src={selectedChain.logoURL || "/default-chain.png"}
                  alt={`${selectedChain.chain.name} logo`}
                  width={20}
                  height={20}
                  className="rounded-full"
                />
                <span className="font-manrope font-bold text-gray-100">{selectedChain.chain.name}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent  className="bg-gray-800/70 hover:bg-none">
          {supportedChains.map((chain) => (
            <SelectItem
              key={chain.chain.id}
              value={chain.chain.id.toString()}
               className="bg-gray-800/70 font-manrope font-bold text-gray-100 hover:bg-none"
              disabled={disabledChains.includes(chain.chain.id)}
            >
              <div className="flex items-center gap-2">
                <img
                  src={chain.logoURL || "/default-chain.png"}
                  alt={`${chain.chain.name} logo`}
                  width={20}
                  height={20}
                  className="rounded-full"
                />
                <span className="font-manrope font-bold text-gray-400">{chain.chain.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

const BridgeTab = ({
  setFromChainId,
  setToChainId,
  setAmount,
  fromChain,
  toChain,
  fromChainId,
  toChainId,
  isBridging,
  supportedChains,
  availableTokens,
  selectedToken,
  setSelectedToken,
  isNativeLockPending,
  isERC20LockPending,
  amount,
  balance,
  handleBridgeClick,
  error,
  selectedTokenConfig,
  receiverAddress,
}: PropBridge) => {
  const { wallets } = useWallet();
  const isDisabled = isBridging || isNativeLockPending || isERC20LockPending;
  const { openWalletModal } = useModalStore();
 
  const isButtonEnabled = () => {
    if (!fromChainId) return false;
    if (!wallets[fromChainId]) return true
    if (!toChainId) return false; 
    if (!wallets[toChainId]) return true;
    return !!amount && !isDisabled && fromChainId !== toChainId && !!receiverAddress;
  };

  const getButtonText = () => {
    if (!fromChainId) return "Select Source Chain";
    if (!wallets[fromChainId]) return "Connect Wallet";
    if (!toChainId) return "Select Destination Chain";
    if (!wallets[toChainId]) return "Connect Wallet";
    if (fromChainId === toChainId) return "Select Different Networks";
    if (!amount) return "Enter Amount";
    return "Bridge";
  };

  const handleButtonClick = async () => {
    try {
      if (!fromChainId) return;
      if (!wallets[fromChainId]) {

        openWalletModal();
        return;
      }
      if (!toChainId) return;
      if (!wallets[toChainId]) {

         openWalletModal();
        return;
      }

      await handleBridgeClick();
    } catch (error) {
      console.error("Action failed:", error);
    }
  };

  return (
    <TabsContent value="bridge" className="space-y-6">
      <ChainSelector
        label="From"
        chainId={fromChainId}
        onChange={setFromChainId}
        supportedChains={supportedChains}
        disabledChains={toChainId ? [toChainId] : []}
        selectedChain={fromChain}
      />

      <div className="bg-gray-800/70 rounded-xl p-5 border border-green-500/40 shadow-lg hover:border-green-500/60 transition-colors duration-200 space-y-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-lg text-gray-400 font-medium">Token</span>
          <span className="text-lg text-gray-400 font-medium">
            Balance: {balance ? formatBalance(balance.value, selectedTokenConfig?.decimals || 18) : "0"} {selectedToken}
          </span>
        </div>
        <div className="flex gap-3 items-center">
          <Input
            type="number"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isDisabled}
            className="border-0 bg-transparent text-2xl text-gray-100 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 flex-1"
            aria-label="Amount to bridge"
          />
          <Select
            value={selectedToken}
            onValueChange={(token) => {
              setSelectedToken(token);
              setAmount("");
            }}
            disabled={isDisabled}
          >
            <SelectTrigger className="w-[120px] font-manrope font-bold border border-green-500/40 bg-gray-800/70 rounded-xl text-lg text-gray-100 focus:ring-2 focus:ring-green-500/60 hover:bg-gray-700/70 transition-all duration-200">
              <SelectValue>
                <div className="flex items-center gap-2">
                  {selectedTokenConfig && (
                    <>
                      <img
                        src={selectedTokenConfig.logoURL || "/default-token.png"}
                        alt={`${selectedTokenConfig.symbol} logo`}
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                      <span>{selectedTokenConfig.symbol}</span>
                    </>
                  )}
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {availableTokens.map((token) => (
                <SelectItem key={token.symbol} value={token.symbol}>
                  <div className="flex items-center gap-2">
                    <img
                      src={token.logoURL || "/default-token.png"}
                      alt={`${token.symbol} logo`}
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                    <span>{token.symbol}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            className="ml-2 h-7 text-xs text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded-lg transition-all"
            onClick={() =>
              balance && setAmount(formatBalance(balance.value, selectedTokenConfig?.decimals || 18))
            }
            disabled={isDisabled}
            aria-label="Set maximum amount"
          >
            MAX
          </Button>
        </div>
      </div>

      <div className="flex justify-center my-2">
        <motion.div
          className="bg-gray-800 rounded-full p-3 border border-green-500/40 shadow-lg"
          whileHover={{ scale: 1.1, rotate: 360 }}
          transition={{ duration: 0.3 }}
        >
          <ArrowDown className="h-5 w-5 text-green-400" />
        </motion.div>
      </div>

      <ChainSelector
        label="To"
        chainId={toChainId}
        onChange={setToChainId}
        supportedChains={supportedChains}
        disabledChains={fromChainId ? [fromChainId] : []}
        selectedChain={toChain}
      />


      <motion.div
        className="space-y-3 text-lg bg-gray-800/70 rounded-xl p-5 border border-green-500/40 shadow-lg hover:border-green-500/60 transition-colors"
        whileHover={{ scale: 1.02 }}
      >
        {[
          { label: "Transaction fees", value: "0.002 ETH" }, // TODO: Replace with dynamic fee
          { label: "Estimated time", value: "~15 minutes" }, // TODO: Replace with dynamic time
          { label: "Conversion rate", value: `1 ${selectedToken} = 1 ${selectedToken}` },
          {
            label: "Quantity received",
            value: amount ? `${amount} ${selectedToken}` : `0.0 ${selectedToken}`,
          },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between">
            <span className="text-gray-400 font-medium">{label}:</span>
            <span
              className={label === "Quantity received" ? "font-semibold text-green-400" : "font-medium"}
            >
              {value}
            </span>
          </div>
        ))}
      </motion.div>

      <Button
        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-green-500/50 transition-all duration-300 py-3 text-lg mt-2"
        disabled={!isButtonEnabled()}
        onClick={handleButtonClick}
      >
        {getButtonText()}
      </Button>

      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500">
          {error}
        </div>
      )}
    </TabsContent>
  );
};

export default BridgeTab;