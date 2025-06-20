/* eslint-disable @next/next/no-img-element */
"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TabsContent } from "@/components/ui/tabs";
import {  networkConfig, SEI_BRIDGE_ABI, seiChain, SEPOLIA_BRIDGE_ABI, ethChain, Token, chainSelectors } from "@/configs/networkConfig";
import { useWallet } from "@/hooks/useWallet";
import { useModalStore } from "@/store/useModalStore";
import { formatBalance, formatLength, getBridgeAddress } from "@/utils";
import { motion } from "framer-motion";
import { useForm, Controller, UseFormReset, UseFormSetValue } from "react-hook-form";
import React, { useEffect, useMemo, useState } from "react";
import { formatEther, isAddress, parseUnits } from "ethers";
import { useReadContract } from "wagmi";
import {  useCCIPBridge } from "@/hooks/useCCIPBridge";
import { config } from "@/configs/wagmi";
import { readContract } from "@wagmi/core";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { useBridgeStatusStore } from "@/store/useBridgeStatusStore";

export interface ChainConfig {
  chain: Chain
  logoURL: string
}

export interface Chain {
  id: number
  name: string
  nativeCurrency: NativeCurrency
  rpcUrls: RpcUrls
  blockExplorers: BlockExplorers
  contracts: Contracts
  testnet: boolean
}

export interface NativeCurrency {
  name: string
  symbol: string
  decimals: number
}

export interface RpcUrls {
  default: Default
}

export interface Default {
  http: string[]
}

export interface BlockExplorers {
  default: Default2
}

export interface Default2 {
  name: string
  url: string
  apiUrl: string
}

export interface Contracts {
  multicall3: Multicall3
  ensRegistry: EnsRegistry
  ensUniversalResolver: EnsUniversalResolver
}

export interface Multicall3 {
  address: string
  blockCreated: number
}

export interface EnsRegistry {
  address: string
}

export interface EnsUniversalResolver {
  address: string
  blockCreated: number
}


interface PropBridge {
  setFromChainId: (chainId: number | undefined) => void;
  setToChainId: (chainId: number | undefined) => void;
  setAmount: (amount: string) => void;
  fromChain: any;
  toChain: any;
  fromChainId: number | undefined;
  toChainId: number | undefined;
  isBridging: boolean;
  supportedChains: any;
  availableTokens: Token[];
  selectedTokenConfig: Token | undefined;
  selectedToken: string;
  setSelectedToken: (token: string) => void;
  isNativeLockPending: boolean;
  isERC20LockPending: boolean;
  amount: string;
  state:{
  isBridging: boolean;
  error: string | null;
  nativeLockHash?: `0x${string}`;
  erc20LockHash?: `0x${string}`;
  burnHash?: `0x${string}`;
}
  balance: { decimals: number; formatted: string; symbol: string; value: bigint } | undefined;
  error: string | null;
  receiverAddress: string;
  setReceiverAddress: (address: string) => void;
}

interface FormData {
  fromChainId: string;
  toChainId: string;
  amount: string;
  selectedToken: string;
  receiverAddress: string;
}


const ChainSelector = ({
  label,
  chainId,
  onChange,
  supportedChains,
  disabledChains,
  selectedChain,
  reset,
  setValue
}: {
  setValue?: UseFormSetValue<FormData>
  label: string;
  chainId: number | undefined;
  onChange: (chainId: string) => void;
  supportedChains: ChainConfig[];
  disabledChains: number[];
    selectedChain: ChainConfig | undefined;
  reset?: UseFormReset<FormData>
}) => {
  const { wallet,disconnect,switchNetWorkWallet } = useWallet();
  const walletInfo = wallet ? wallet : undefined;
  const { setFromChainIdStore, setToChainIdStore } = useModalStore();
  return (
    <div className="space-y-2 font-manrope">
      <div className="flex justify-between items-center">
        <label className="text-lg font-semibold text-gray-200">{label}</label>
        {label !== "To" && walletInfo?.address && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-gray-400 font-bold focus:outline-none">
                {`${walletInfo.address.slice(0, 6)}...${walletInfo.address.slice(-4)}`}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={() => {
                  reset?.()
                  disconnect()
                }}
                className="text-red-500 cursor-pointer"
              >
                Disconnect
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          )}
      </div>
      <Select
          value={chainId?.toString() || ""}
          onValueChange={(val) => {
          const selectedChainId = Number(val);
          const isFromChain = label !== "To";

          onChange(val);

          if (isFromChain) {
            setFromChainIdStore(selectedChainId);
            setValue?.("selectedToken", "");
          } else {
            setToChainIdStore(selectedChainId);
          }
          switchNetWorkWallet(selectedChainId, isFromChain);
        }}
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
        <SelectContent className="bg-gray-800/70 hover:bg-none">
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
  error,
  selectedTokenConfig,
  receiverAddress,
  state,
  setReceiverAddress,
}: PropBridge) => {
  const { wallet} = useWallet();
  const { handleBridge,erc20LockHash,setState,burnWrappedHash, burnHash,nativeLockHash } = useCCIPBridge();
  const { openWalletModal, setFromChainIdStore } = useModalStore();
  const isDisabled = isBridging || isNativeLockPending || isERC20LockPending;
  const smETH = getBridgeAddress("ethereum");
  const smSEI = getBridgeAddress("sei");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [seiTokenId, setSeiTokenId] = useState<bigint | null>(null);
  const [isFetchingTokenId, setIsFetchingTokenId] = useState(false);
  const [tokenIdError, setTokenIdError] = useState<string | null>(null);
  const recipient = useMemo(() => wallet?.address ?? "", [wallet]);


useEffect(() => {
  if (!startTime) return;

  const interval = setInterval(() => {
    const secondsPassed = Math.floor((Date.now() - startTime) / 1000);
    setElapsedTime(secondsPassed);
  }, 1000);

  return () => clearInterval(interval);
}, [startTime]);

const formatElapsed = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

// Initialize react-hook-form
const {
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
  const isSeiChain = Number(formValues.fromChainId) === 1328;
  const isSepoliaChain = Number(formValues.fromChainId) === 11155111;
  
  // State to store the selected chain selector
  const [toChainSelector, setToChainSelector] = useState<string>("");
  
  // Update toChainSelector when toChainId changes
  useEffect(() => {
    if (formValues.toChainId) {
      const selector = chainSelectors[Number(formValues.toChainId)];
      setToChainSelector(selector);
    } else {
      setToChainSelector("");
    }
  }, [formValues.toChainId]);


  const isNativeRelatedToken = (tokenSymbol: string): boolean | undefined => {
  const token = networkConfig.tokensList.find(t => t.symbol === tokenSymbol);
  if (!token) return false;

  const isETH = token.symbol === "ETH" && token.tags?.includes("native");
  const isWrappedETH = token.wrappedFrom === "ETH" && token.tags?.includes("wrapped");

  return isETH || isWrappedETH;
};



  // Sync form values with parent state
  useEffect(() => {
    setFromChainId(formValues.fromChainId ? Number(formValues.fromChainId) : undefined);
    setToChainId(formValues.toChainId ? Number(formValues.toChainId) : undefined);
    setAmount(formValues.amount);
    setSelectedToken(formValues.selectedToken);
    setReceiverAddress(formValues.receiverAddress);
  }, [formValues, setFromChainId, setFromChainIdStore, setToChainId, setAmount, setSelectedToken, setReceiverAddress]);
  
  // Fetch tokenId for SEI chain
  useEffect(() => {
    if (!isSeiChain || !selectedTokenConfig || !selectedToken || !formValues.fromChainId) {
      console.warn('⚠️ fetchTokenId not called due to missing conditions:', {
        isSeiChain,
        selectedTokenConfig,
        selectedToken,
        fromChainId: formValues.fromChainId
      });
      setSeiTokenId(null);
      setTokenIdError(null);
      return;
    }
    
    const fetchTokenId = async () => {
      setIsFetchingTokenId(true);
      setTokenIdError(null);
      
      try {
        const token = networkConfig.tokensList.find(t => t.symbol.toLowerCase() === selectedToken.toLowerCase());
        if (!token) {
          throw new Error(`Token ${selectedToken} not found in tokenConfig`);
        }
        
        const tokenAddressSource = token.address[seiChain.id];
        
        if (!tokenAddressSource || !/^0x[a-fA-F0-9]{40}$/.test(tokenAddressSource)) {
          throw new Error(`Invalid token address for ${selectedToken}: ${tokenAddressSource}`);
        }
        
        const id = await readContract(config, {
          address: smETH as `0x${string}`,
          abi: SEPOLIA_BRIDGE_ABI.abi,
          functionName: 'tokenAddressToId',
          args: [tokenAddressSource as `0x${string}`],
          chainId: ethChain.id,
      });
      
      setSeiTokenId(id as bigint);
    } catch (err: any) {
      console.error(`❌ Failed to fetch tokenId for ${selectedToken}:`, {
        error: err.message,
        stack: err.stack,
        token: selectedToken,
        smETH,
        chainId: ethChain.id,
      });
      setTokenIdError(
        err.message.includes('revert')
        ? `Token ${selectedToken} not supported by the bridge contract.`
        : `Failed to fetch token ID for ${selectedToken}. Please check token configuration or contract.`
      );
      setSeiTokenId(null);
    } finally {
      setIsFetchingTokenId(false);
    }
  };
  
  fetchTokenId();
  }, [isSeiChain, selectedToken, smETH, selectedTokenConfig, formValues.fromChainId, smSEI]);
  const isNativeToken = isNativeRelatedToken(formValues.selectedToken);

if (isNativeToken) {
  // Bỏ qua fee CCIP
  console.log("🟢 Native or wrapped native token. Không cần ccipFee.");
} else {
  // Tính fee CCIP
  console.log("🟡 ERC20 or wrapped ERC20. Cần tính ccipFee.");
}
// Calculate parsed amount
  const parsedAmount = useMemo(() => {
    return parseUnits(formValues.amount || "0", selectedTokenConfig?.decimals || 18);
  }, [formValues.amount, selectedTokenConfig]);

  // Construct bridgeConfig based on chain direction
  const bridgeConfig = useMemo(() => {
    if (isNativeToken) return null;
    if (isSeiChain) {
      if (!seiTokenId || !formValues.amount?.trim()) {
        return null;
      }
      return {
        address: smSEI as `0x${string}`,
        abi: SEI_BRIDGE_ABI.abi,
        functionName: "getFeeCCIP",
        args: [parsedAmount, seiTokenId],
      };
    }
    if (isSepoliaChain) {
      const receiver = formValues.receiverAddress?.trim();
      const tokenAddress = selectedTokenConfig?.address[Number(formValues.fromChainId)];
      if (!formValues.toChainId || !formValues.amount?.trim() || !receiver || !tokenAddress) {
        return null;
      }
      return {
        address: smETH as `0x${string}`,
        abi: SEPOLIA_BRIDGE_ABI.abi,
      functionName: "getFeeCCIP",
      args: [toChainSelector, receiver, "0x", 0, tokenAddress, parsedAmount],
    };
  }
  
  return null;
}, [
  isSeiChain,
  isSepoliaChain,
  seiTokenId,
  parsedAmount,
  isNativeToken,
  smETH,
  smSEI,
  toChainSelector,
  formValues.receiverAddress,
  selectedTokenConfig,
  formValues.fromChainId,
  formValues.toChainId,
  formValues.amount,
]);

  const isError = !!error;
  const shouldRead =
     !isNativeToken && 
  !!bridgeConfig?.address &&
  !!bridgeConfig?.args &&
  (isSeiChain || isAddress(formValues.receiverAddress || "0x")) &&
  !isFetchingTokenId &&
    !tokenIdError;

 const contractOptions = useMemo(() => {
    if (!shouldRead || !bridgeConfig) return null;
  return {
    address: bridgeConfig.address,
    abi: bridgeConfig.abi,
    functionName: bridgeConfig.functionName,
    args: bridgeConfig.args,
  };
}, [bridgeConfig, shouldRead]);

  const { data: ccipFee, isLoading: isFeeLoading } = useReadContract(contractOptions ?? {});
 const onSubmit = async (data: FormData) => {
  if (!formValues.fromChainId || !wallet) return;

  if (isValid && data.toChainId && data.amount && data.receiverAddress) {
    const tokenAddress =
      data.selectedToken !== "ETH" && selectedTokenConfig
        ? selectedTokenConfig.address[Number(data.fromChainId)] || ""
        : "";

        setState({ isBridging: true, error: null });
        

    try {
      await handleBridge(
        Number(data.fromChainId),
        Number(data.toChainId),
        data.amount,
        balance,
        tokenAddress,
        data.receiverAddress,
        toChainSelector,
        ccipFee as bigint,
        { isOFT: false }
      );
      setStartTime(Date.now());
    } catch (err) {
      console.error("❌ Bridge thất bại:", err);
      setState({ isBridging: false, error: "Lỗi không xác định" });
    }
  }
};

  const handleButtonClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!formValues.fromChainId) return;

    if (!wallet) {
      event.preventDefault();
      openWalletModal();
    }
  };


  const isButtonEnabled = () => {
    if (elapsedTime > 0) return false;
    if (!formValues.fromChainId || tokenIdError) return false;
    if (!wallet) return true;
    return !isDisabled || isError;
  };

  const getButtonText = () => {
    if (error === "Giao dịch đã bị hủy bởi người dùng") return "Giao dịch đã bị hủy";
    if (isError) return "Retry Bridge";
    if (isDisabled || elapsedTime > 0) return "Bridging...";
    if (!formValues.fromChainId) return "Select Source Chain";
    if (!wallet) return "Connect Wallet";
    if (tokenIdError) return "Error Fetching Token ID";
    return "Bridge";
  };
  
  const {
  shouldResetForm,
  shouldResetTimer,
  clearResetFlags,
} = useBridgeStatusStore();

useEffect(() => {
  if (shouldResetForm) {
    reset({
      fromChainId: "",
      toChainId: "",
      amount: "",
      selectedToken: "",
      receiverAddress: "",
    });
    setState((prev) => ({ ...prev, nativeLockHash: undefined  }));
    setState((prev) => ({ ...prev, erc20LockHash: undefined  }));
    setState((prev) => ({ ...prev, burnWrappedHash: undefined  }));
    setState((prev) => ({ ...prev, burnHash: undefined  }));
  }

  if (shouldResetTimer) {
    setStartTime(null);
    setElapsedTime(0);
  }

  if (shouldResetForm || shouldResetTimer) {
    clearResetFlags();
  }
}, [shouldResetForm,setState,clearResetFlags, shouldResetTimer, reset, setStartTime, setElapsedTime]);

  return (
    <div className="font-manrope">
      <TabsContent value="bridge" className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Controller
            name="fromChainId"
            control={control}
            rules={{ required: "Please select source chain" }}
            render={({ field }) => (
              <div>
                <ChainSelector
                  setValue={setValue}
                  label="From"
                  chainId={Number(field.value) || undefined}
                  onChange={field.onChange}
                  reset={reset}
                  supportedChains={supportedChains}
                  disabledChains={formValues.toChainId ? [Number(formValues.toChainId)] : []}
                  selectedChain={fromChain}
                />
                {errors.fromChainId && (
                  <p className="font-manrope text-red-500 text-sm mt-1">{errors.fromChainId.message}</p>
                )}
              </div>
            )}
          />

          {/* Token and Amount Input */}
          <div className="bg-gray-800/70 rounded-xl p-5 border border-green-500/40 shadow-lg hover:border-green-500/60 transition-colors duration-200 space-y-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg text-gray-400 font-medium">Token</span>
              <span className="text-lg text-gray-400 font-medium">
                Balance: {balance && formValues.fromChainId ? formatLength(formatBalance(balance.value, selectedTokenConfig?.decimals || 18)) : "0"} {balance && formValues.fromChainId ? (balance?.symbol || selectedToken):""}
              </span>
            </div>
            <div className="flex gap-3 items-center">
              <Controller
                name="amount"
                control={control}
                rules={{
                  required: "Please enter an amount",
                  validate: (value) =>
                    Number(value) > 0 ? true : "Amount must be greater than 0",
                }}
                render={({ field }) => (
                  <Input
                    type="number"
                    placeholder="0.0"
                    {...field}
                    disabled={isDisabled}
                    className="border-0 bg-transparent text-2xl font-bold text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 flex-1"
                    aria-label="Amount to bridge"
                  />
                )}
              />
              <Controller
                name="selectedToken"
                control={control}
                rules={{ required: "Please select a token" }}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      setValue("amount", "");
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
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-2 h-7 text-xs text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded-lg transition-all"
                onClick={() =>
                  balance &&
                  setValue("amount", formatLength(formatBalance(balance.value, selectedTokenConfig?.decimals || 18)))
                }
                disabled={isDisabled}
                aria-label="Set maximum amount"
              >
                MAX
              </Button>
            </div>
            {errors.amount && <p className="font-manrope text-red-500 text-sm mt-1">{errors.amount.message}</p>}
          </div>
          <Controller
            name="toChainId"
            control={control}
            rules={{ required: "Please select destination chain" }}
            render={({ field }) => (
              <div>
                <ChainSelector
                  label="To"
                  chainId={Number(field.value) || undefined}
                  onChange={field.onChange}
                  supportedChains={supportedChains}
                  disabledChains={formValues.fromChainId ? [Number(formValues.fromChainId)] : []}
                  selectedChain={toChain}
                />
                {errors.toChainId && (
                  <p className="font-manrope text-red-500 text-sm mt-1">{errors.toChainId.message}</p>
                )}
              </div>
            )}
          />

          {/* Receiver Address Input */}
          <Controller
            name="receiverAddress"
            control={control}
            rules={{
              required: "Please enter a receiver address",
              pattern: {
                value: /^0x[a-fA-F0-9]{40}$/,
                message: "Invalid wallet address",
              },
            }}
            render={({ field }) => (
              <div className="space-y-2">
                <label className="text-lg font-semibold text-gray-200">Receiver Address</label>
                <Input
                  {...field}
                  placeholder="0x..."
                  disabled={isDisabled}
                  className="border border-green-500/40 bg-gray-800/70 rounded-xl text-lg text-gray-100 focus:ring-2 focus:ring-green-500/60 font-bold"
                />
                {errors.receiverAddress && (
                  <p className="font-manrope text-red-500 text-sm mt-1">{errors.receiverAddress.message}</p>
                )}
              </div>
            )}
          />

          {/* Transaction Info */}
          <motion.div
            className="space-y-3 text-lg bg-gray-800/70 text-gray-200 rounded-xl p-5 border border-green-500/40 shadow-lg hover:border-green-500/60 transition-colors"
            whileHover={{ scale: 1.02 }}
          >
            {[
              {
                label: 'Transaction Fee',
                value: isDisabled
                  ? 'Bridging...'
                  : tokenIdError
                  ? 'Error fetching token ID'
                  : isFetchingTokenId || isFeeLoading
                  ? 'Calculating...'
                  : ccipFee != null
                  ? `${formatLength(formatEther(ccipFee as bigint), true)} ${fromChain?.chain?.nativeCurrency?.symbol}`
                        : ` ${formValues.amount} ${ fromChain ?fromChain?.chain?.nativeCurrency?.symbol : ""}`
              },
              {
                label: "Estimated Time",
                value: elapsedTime > 0 ? formatElapsed(elapsedTime) : "",
              },
              {
                label: "Amount Received",
                value: formValues.amount ? `${formValues.amount} ${selectedToken}` : `0.0 ${selectedToken}`,
              },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between">
                <span className="text-gray-400 font-medium">{label}:</span>
                <span
                  className={label === "Amount Received" ? "font-semibold text-green-400" : "font-medium"}
                >
                  {value}
                </span>
              </div>
            ))}
          </motion.div>
          {(erc20LockHash || nativeLockHash || burnWrappedHash || burnHash) && (
  <Button
    type="button"
    className="w-full px-5 py-2.5 text-lg font-semibold bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full shadow-lg hover:shadow-green-500/50 transition-all duration-300 border-none"
      onClick={() => {
        const hash =
          erc20LockHash || nativeLockHash || burnWrappedHash || burnHash;

        const isSeiTx = !!(burnWrappedHash || burnHash);
        const url = isSeiTx
          ? `https://seitrace.com/tx/${hash}?chain=atlantic-2`
          : `https://sepolia.etherscan.io/tx/${hash}`;

        window.open(url, "_blank");
      }}
    >
      View transaction
    </Button>
  )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-green-500/50 transition-all duration-300 py-3 text-lg mt-2"
            disabled={!isButtonEnabled()}
            onClick={handleButtonClick}
          >
            {getButtonText()}
          </Button>

          {(error || tokenIdError) && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500 font-manrope">
              {error || tokenIdError}
            </div>
          )}
        </form>
      </TabsContent>
    </div>
  );
                  
};


export default BridgeTab;