"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useForm, Controller, UseFormHandleSubmit, Control, FieldErrors, UseFormReset, UseFormSetValue } from "react-hook-form";
import { useWallet } from "@/hooks/useWallet";
import { useCCIPBridge } from "@/hooks/useCCIPBridge";
import { useModalStore } from "@/store/useModalStore";
import { useBridgeStatusStore } from "@/store/useBridgeStatusStore";
import { formatEther, isAddress, parseUnits } from "ethers";
import { config } from "@/configs/wagmi";
import { readContract } from "@wagmi/core";
import { useReadContract } from "wagmi";
import { networkConfig, SEI_BRIDGE_ABI, seiChain, ETH_BRIDGE_ABI, ethChain, Token, chainSelectors } from "@/configs/networkConfig";
import { getBridgeAddress } from "@/utils";
import TokenAmountInput from "./TokenAmountInput";
import ReceiverAddressInput from "./ReceiverAddressInput";
import TransactionInfo from "./TransactionInfo";
import TransactionButton from "./TransactionButton";
import { TabsContent } from "@/components/ui/tabs";
import { ChainSelector } from "./ChainSelector";
import { CustomToastBridged } from "@/components/Modal/ToastBridged";
import { toast } from "sonner";

export interface FormData {
  fromChainId: string;
  toChainId: string;
  amount: string;
  selectedToken: string;
  receiverAddress: string;
}

interface ChainConfig {
  chain: {
    id: number;
    name: string;
    nativeCurrency: { name: string; symbol: string; decimals: number };
  };
  logoURL: string;
}

interface PropBridge {
  setFromChainId: (chainId: number | undefined) => void;
  setToChainId: (chainId: number | undefined) => void;
  formValues: FormData;
  setAmount: (amount: string) => void;
  fromChain: any;
  toChain: any;
  isValid: boolean;
  handleSubmit: UseFormHandleSubmit<FormData, undefined>;
  control: Control<FormData, any>;
  setValue: UseFormSetValue<FormData>;
  reset: UseFormReset<FormData>;
  errors: FieldErrors<FormData>;
 supportedChains: any;
  availableTokens: Token[];
  selectedTokenConfig: Token | undefined;
  setSelectedToken: (token: string) => void;
  state: {
    isBridging: boolean;
    error: string | null;
    nativeLockHash?: `0x${string}`;
    erc20LockHash?: `0x${string}`;
    burnHash?: `0x${string}`;
  };
  balance: { decimals: number; formatted: string; symbol: string; value: bigint } | undefined;
  error: string | null;
  setReceiverAddress: (address: string) => void;
}

const BridgeTab: React.FC<PropBridge> = ({
  setFromChainId,
  setToChainId,
  setAmount,
  fromChain,
  toChain,
  handleSubmit,
  control,
  setValue,
  reset,
  supportedChains,
  availableTokens,
  setSelectedToken,
  balance,
  isValid,
  error,
  formValues,
  selectedTokenConfig,
  errors,
  setReceiverAddress,
}) => {
  const { wallet } = useWallet();
  const { isBridging, isNativeLockPending, isERC20LockPending, handleBridge, erc20LockHash, setState, burnWrappedHash, burnHash, nativeLockHash } = useCCIPBridge();
  const { openWalletModal } = useModalStore();
  const { shouldResetForm, shouldResetTimer, clearResetFlags } = useBridgeStatusStore();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [seiTokenId, setSeiTokenId] = useState<string | null>(null);
  const [isFetchingTokenId, setIsFetchingTokenId] = useState(false);
  const [tokenIdError, setTokenIdError] = useState<string | null>(null);
  const smETH = getBridgeAddress("ethereum");
  const smSEI = getBridgeAddress("sei");
  const isDisabled = isBridging || isNativeLockPending || isERC20LockPending;
  const isSeiChain = Number(formValues.fromChainId) === Number(process.env.NEXT_PUBLIC_SEI_CHAIN_ID);
  const isSepoliaChain = Number(formValues.fromChainId) === Number(process.env.NEXT_PUBLIC_ETH_CHAIN_ID);
  const [toChainSelector, setToChainSelector] = useState<string>("");

  useEffect(() => {
    if (formValues.toChainId) {
      const selector = chainSelectors[Number(formValues.toChainId)];
      setToChainSelector(selector);
    } else {
      setToChainSelector("");
    }
  }, [formValues.toChainId]);

  useEffect(() => {
    if (!startTime) return;
    const interval = setInterval(() => {
      const secondsPassed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedTime(secondsPassed);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  useEffect(() => {
    const currentFrom = formValues.fromChainId ? Number(formValues.fromChainId) : undefined;
    if (fromChain?.chain.id !== currentFrom) setFromChainId(currentFrom);
    const currentTo = formValues.toChainId ? Number(formValues.toChainId) : undefined;
    if (toChain?.chain.id !== currentTo) setToChainId(currentTo);
    if (formValues.amount !== balance?.formatted) setAmount(formValues.amount);
    if (formValues.selectedToken) setSelectedToken(formValues.selectedToken);
    if (formValues.receiverAddress) setReceiverAddress(formValues.receiverAddress);
  }, [
    formValues.fromChainId,
    formValues.toChainId,
    formValues.amount,
    formValues.selectedToken,
    formValues.receiverAddress,
    fromChain,
    toChain,
    balance,
    setFromChainId,
    setToChainId,
    setAmount,
    setSelectedToken,
    setReceiverAddress,
  ]);

  useEffect(() => {
    if (!isSeiChain || !selectedTokenConfig || !formValues.selectedToken || !formValues.fromChainId) {
      setSeiTokenId(null);
      setTokenIdError(null);
      return;
    }
    const fetchTokenId = async () => {
      setIsFetchingTokenId(true);
      setTokenIdError(null);
      try {
        const token = networkConfig.tokensList.find(t => t.symbol.toLowerCase() === formValues.selectedToken.toLowerCase());
        if (!token) throw new Error(`Token ${formValues.selectedToken} not found in tokenConfig`);
        const tokenAddressSource = token.address[seiChain.id];
        if (!tokenAddressSource || !/^0x[a-fA-F0-9]{40}$/.test(tokenAddressSource)) {
          throw new Error(`Invalid token address for ${formValues.selectedToken}: ${tokenAddressSource}`);
        }
        const id = await readContract(config, {
          address: smETH as `0x${string}`,
          abi: ETH_BRIDGE_ABI.abi,
          functionName: "tokenAddressToId",
          args: [tokenAddressSource as `0x${string}`],
          chainId: ethChain.id,
        });
        setSeiTokenId(id as string);
      } catch (err: any) {
        console.error(`❌ Failed to fetch tokenId for ${formValues.selectedToken}:`, {
          error: err.message,
          stack: err.stack,
          token: formValues.selectedToken,
          smETH,
          chainId: ethChain.id,
        });
        setTokenIdError(
          err.message.includes("revert")
            ? `Token ${formValues.selectedToken} not supported by the bridge contract.`
            : `Failed to fetch token ID for ${formValues.selectedToken}. Please check token configuration or contract.`
        );
        setSeiTokenId(null);
      } finally {
        setIsFetchingTokenId(false);
      }
    };
    fetchTokenId();
  }, [isSeiChain, formValues.selectedToken, smETH, selectedTokenConfig, formValues.fromChainId, smSEI]);

  useEffect(() => {
    if (shouldResetForm) {
      reset({
        fromChainId: "",
        toChainId: "",
        amount: "",
        selectedToken: "",
        receiverAddress: "",
      });
      setState({ isBridging: false, error: null, nativeLockHash: undefined, erc20LockHash: undefined, burnWrappedHash: undefined, burnHash: undefined });
    }
    
    if (shouldResetTimer) {
      setStartTime(null);
      setElapsedTime(0);
    }
    if (shouldResetForm || shouldResetTimer) clearResetFlags();
  }, [shouldResetForm, shouldResetTimer, clearResetFlags, reset, setState]);

  const isNativeRelatedToken = (tokenSymbol: string): boolean |undefined => {
    const token = networkConfig.tokensList.find(t => t.symbol === tokenSymbol);
    if (!token) return false;
    const isETH = token.symbol === "ETH" && token.tags?.includes("native");
    const isWrappedETH = token.wrappedFrom === "ETH" && token.tags?.includes("wrapped");
    return isETH || isWrappedETH;
  };

  const isNativeToken = isNativeRelatedToken(formValues.selectedToken);
  const parsedAmount = useMemo(() => parseUnits(formValues.amount || "0", selectedTokenConfig?.decimals || 18), [formValues.amount, selectedTokenConfig]);

  const bridgeConfig = useMemo(() => {
    if (isNativeToken) return null;
    if (isSeiChain) {
      if (!seiTokenId || !formValues.amount?.trim()) return null;
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
      if (!formValues.toChainId || !formValues.amount?.trim() || !receiver || !tokenAddress) return null;
      return {
        address: smETH as `0x${string}`,
        abi: ETH_BRIDGE_ABI.abi,
        functionName: "getFeeCCIP",
        args: [tokenAddress, toChainSelector, smSEI, receiver, parsedAmount, 0],
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

  const shouldRead = !isNativeToken && !!bridgeConfig?.address && !!bridgeConfig?.args && (isSeiChain || isAddress(formValues.receiverAddress || "0x")) && !isFetchingTokenId && !tokenIdError;

  const contractOptions = useMemo(() => {
    if (!shouldRead || !bridgeConfig) return undefined;
    return {
      address: bridgeConfig.address,
      abi: bridgeConfig.abi,
      functionName: bridgeConfig.functionName,
      args: bridgeConfig.args,
    };
  }, [bridgeConfig, shouldRead]);

  const { data: ccipFee } = useReadContract(contractOptions);

  const onSubmit = async (data: FormData) => {
    if (!formValues.fromChainId || !wallet) return;
    if (isValid && data.toChainId && data.amount && data.receiverAddress) {
      const tokenAddress = data.selectedToken !== "ETH" && selectedTokenConfig ? selectedTokenConfig.address[Number(data.fromChainId)] || "" : "";
      setState((prev) => ({ ...prev, isBridging: true, error: null }));
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
        let errorMessage = "An unknown error occurred.";
        if (err instanceof Error) {
          if ("shortMessage" in err) {
            errorMessage = (err as any).shortMessage;
          }
          else if ("reason" in err) {
            errorMessage = (err as any).reason;
          }
          else {
            errorMessage = err.message;
          }
        }
        toast.custom((t) => (
          <CustomToastBridged
            t={t}
            title="❌ Bridge Error"
            content={<p className="text-red-400">{errorMessage}</p>}
          />
        ));
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
                  name="fromChainId"
                  label="From"
                  control={control}
                  reset={reset}
                  supportedChains={supportedChains}
                  disabledChains={[]}
                  selectedChain={fromChain}
                />
                {errors.fromChainId && (
                  <p className="font-manrope text-red-500 text-sm mt-1">{errors.fromChainId.message}</p>
                )}
              </div>
            )}
          />
          <TokenAmountInput
            control={control}
            setValue={setValue}
            balance={balance}
            isDisabled={isDisabled}
            availableTokens={availableTokens}
            selectedTokenConfig={selectedTokenConfig}
            formValues={formValues}
            errors={errors}
          />
          <Controller
            name="toChainId"
            control={control}
            rules={{ required: "Please select destination chain" }}
            render={({ field }) => (
              <div>
                <ChainSelector
                  name="toChainId"
                  label="To"
                  control={control}
                  reset={reset}
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
          <ReceiverAddressInput control={control} isDisabled={isDisabled} errors={errors} />
          <TransactionInfo
            ccipFee={ccipFee as bigint}
            elapsedTime={elapsedTime}
            formValues={formValues}
            fromChain={fromChain}
          />
          <TransactionButton
            isDisabled={isDisabled}
            wallet={wallet}
            formValues={formValues}
            tokenIdError={tokenIdError}
            error={error}
            
            elapsedTime={elapsedTime}
            erc20LockHash={erc20LockHash}
            nativeLockHash={nativeLockHash}
            burnWrappedHash={burnWrappedHash}
            burnHash={burnHash}
            handleButtonClick={handleButtonClick}
          />
        </form>
      </TabsContent>
    </div>
  );
};

export default React.memo(BridgeTab);