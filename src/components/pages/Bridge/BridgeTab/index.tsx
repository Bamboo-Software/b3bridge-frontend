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
import { useForm, Controller } from "react-hook-form";
import React, { useEffect } from "react";

interface ChainConfig {
  chain: { id: number; name: string };
  logoURL?: string;
}

interface PropBridge {
  setFromChainId: (chainId: number | undefined) => void;
  setToChainId: (chainId: number | undefined) => void;
  setAmount: (amount: string) => void;
  fromChain: ChainConfig | undefined;
  toChain: ChainConfig | undefined;
  fromChainId: number | undefined;
  toChainId: number | undefined;
  isBridging: boolean;
  supportedChains: ChainConfig[];
  availableTokens: Token[];
  selectedTokenConfig: Token | undefined;
  selectedToken: string;
  setSelectedToken: (token: string) => void;
  isNativeLockPending: boolean;
  isERC20LockPending: boolean;
  amount: string;
  balance: { decimals: number; formatted: string; symbol: string; value: bigint } | undefined;
  handleBridgeClick: (data: {
    fromChainId: number;
    toChainId: number;
    balance: {
    decimals: number;
    formatted: string;
    symbol: string;
    value: bigint;
} | undefined;
    amount: string;
    tokenAddress: string;
    receiverAddress: `0x${string}`;
  }) => Promise<void>;
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
}: {
  label: string;
  chainId: number | undefined;
  onChange: (chainId: string) => void;
  supportedChains: ChainConfig[];
  disabledChains: number[];
  selectedChain: ChainConfig | undefined;
}) => {
  const { wallets, keplrAddress } = useWallet();
  const walletInfo = chainId ? wallets[chainId] : undefined;
  const displayAddress =
    label === "From" && chainId === 1328
      ? keplrAddress
      : label === "From"
      ? walletInfo?.address
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
      <Select value={chainId?.toString() || ""} onValueChange={onChange}>
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
  handleBridgeClick,
  error,
  selectedTokenConfig,
  receiverAddress,
  setReceiverAddress,
}: PropBridge) => {
  const { wallets, connectWallet } = useWallet();
  const { openWalletModal } = useModalStore();
  const isDisabled = isBridging || isNativeLockPending || isERC20LockPending;

  // Initialize react-hook-form
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<FormData>({
    defaultValues: {
      fromChainId: fromChainId?.toString() || "",
      toChainId: toChainId?.toString() || "",
      amount: amount || "",
      selectedToken: selectedToken || "ETH",
      receiverAddress: receiverAddress || "",
    },
    mode: "onChange",
  });

  // Watch form values
  const formValues = watch();

  // Sync form values with parent state
  useEffect(() => {
    setFromChainId(formValues.fromChainId ? Number(formValues.fromChainId) : undefined);
    setToChainId(formValues.toChainId ? Number(formValues.toChainId) : undefined);
    setAmount(formValues.amount);
    setSelectedToken(formValues.selectedToken);
    setReceiverAddress(formValues.receiverAddress);
  }, [formValues, setFromChainId, setToChainId, setAmount, setSelectedToken, setReceiverAddress]);

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    if (!formValues.fromChainId || !formValues.toChainId) return;

    if (!wallets[Number(formValues.fromChainId)]) {
      await connectWallet(Number(formValues.fromChainId));
      openWalletModal();
      return;
    }

    const tokenAddress =
      data.selectedToken !== "ETH" && selectedTokenConfig
        ? selectedTokenConfig.address[Number(data.fromChainId)] || ""
        : "";

    try {
      await handleBridgeClick({
        fromChainId: Number(data.fromChainId),
        toChainId: Number(data.toChainId),
        amount: data.amount,
        balance,
        tokenAddress,
        receiverAddress: data.receiverAddress as `0x${string}`,
      });
    } catch (err) {
      console.error("Bridge failed:", err);
    }
  };

  const isButtonEnabled = () => {
    if (!formValues.fromChainId || !formValues.toChainId) return false;
    if (!wallets[Number(formValues.fromChainId)]) return true;
    return (
      isValid &&
      formValues.amount &&
      !isDisabled &&
      Number(formValues.fromChainId) !== Number(formValues.toChainId) &&
      !!formValues.receiverAddress
    );
  };

  const getButtonText = () => {
    if (!formValues.fromChainId) return "Chọn chuỗi nguồn";
    if (!wallets[Number(formValues.fromChainId)]) return "Kết nối ví";
    if (!formValues.toChainId) return "Chọn chuỗi đích";
    if (Number(formValues.fromChainId) === Number(formValues.toChainId)) return "Chọn chuỗi khác nhau";
    if (!formValues.amount) return "Nhập số lượng";
    if (!formValues.receiverAddress) return "Nhập địa chỉ nhận";
    return "Bridge";
  };

  return (
    <TabsContent value="bridge" className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* From Chain Selector */}
        <Controller
          name="fromChainId"
          control={control}
          rules={{ required: "Vui lòng chọn chuỗi nguồn" }}
          render={({ field }) => (
            <div>
              <ChainSelector
                label="From"
                chainId={Number(field.value) || undefined}
                onChange={field.onChange}
                supportedChains={supportedChains}
                disabledChains={formValues.toChainId ? [Number(formValues.toChainId)] : []}
                selectedChain={fromChain}
              />
              {errors.fromChainId && (
                <p className="text-red-500 text-sm mt-1">{errors.fromChainId.message}</p>
              )}
            </div>
          )}
        />

        {/* Token and Amount Input */}
        <div className="bg-gray-800/70 rounded-xl p-5 border border-green-500/40 shadow-lg hover:border-green-500/60 transition-colors duration-200 space-y-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg text-gray-400 font-medium">Token</span>
            <span className="text-lg text-gray-400 font-medium">
              Số dư: {balance ? formatBalance(balance.value, selectedTokenConfig?.decimals || 18) : "0"} {selectedToken}
            </span>
          </div>
          <div className="flex gap-3 items-center">
            <Controller
              name="amount"
              control={control}
              rules={{
                required: "Vui lòng nhập số lượng",
                validate: (value) =>
                  Number(value) > 0 ? true : "Số lượng phải lớn hơn 0",
              }}
              render={({ field }) => (
                <Input
                  type="number"
                  placeholder="0.0"
                  {...field}
                  disabled={isDisabled}
                  className="border-0 bg-transparent text-2xl text-gray-100 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 flex-1"
                  aria-label="Số lượng để bridge"
                />
              )}
            />
            <Controller
              name="selectedToken"
              control={control}
              rules={{ required: "Vui lòng chọn token" }}
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
              variant="ghost"
              size="sm"
              className="ml-2 h-7 text-xs text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded-lg transition-all"
              onClick={() =>
                balance &&
                setValue("amount", formatBalance(balance.value, selectedTokenConfig?.decimals || 18))
              }
              disabled={isDisabled}
              aria-label="Đặt số lượng tối đa"
            >
              MAX
            </Button>
          </div>
          {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>}
        </div>

        {/* Arrow Down */}
        <div className="flex justify-center my-2">
          <motion.div
            className="bg-gray-800 rounded-full p-3 border border-green-500/40 shadow-lg"
            whileHover={{ scale: 1.1, rotate: 360 }}
            transition={{ duration: 0.3 }}
          >
            <ArrowDown className="h-5 w-5 text-green-400" />
          </motion.div>
        </div>

        {/* To Chain Selector */}
        <Controller
          name="toChainId"
          control={control}
          rules={{ required: "Vui lòng chọn chuỗi đích" }}
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
                <p className="text-red-500 text-sm mt-1">{errors.toChainId.message}</p>
              )}
            </div>
          )}
        />

        {/* Receiver Address Input */}
        <Controller
          name="receiverAddress"
          control={control}
          rules={{
            required: "Vui lòng nhập địa chỉ nhận",
            pattern: {
              value: /^0x[a-fA-F0-9]{40}$/,
              message: "Địa chỉ ví không hợp lệ",
            },
          }}
          render={({ field }) => (
            <div className="space-y-2">
              <label className="text-lg font-semibold text-gray-200">Địa chỉ nhận</label>
              <Input
                {...field}
                placeholder="0x..."
                disabled={isDisabled}
                className="border border-green-500/40 bg-gray-800/70 rounded-xl text-lg text-gray-100 focus:ring-2 focus:ring-green-500/60"
              />
              {errors.receiverAddress && (
                <p className="text-red-500 text-sm mt-1">{errors.receiverAddress.message}</p>
              )}
            </div>
          )}
        />

        {/* Transaction Info */}
        <motion.div
          className="space-y-3 text-lg bg-gray-800/70 rounded-xl p-5 border border-green-500/40 shadow-lg hover:border-green-500/60 transition-colors"
          whileHover={{ scale: 1.02 }}
        >
          {[
            { label: "Phí giao dịch", value: "0.002 ETH" }, // TODO: Thay bằng phí động
            { label: "Thời gian ước tính", value: "~15 phút" }, // TODO: Thay bằng thời gian động
            { label: "Tỷ giá", value: `1 ${selectedToken} = 1 ${selectedToken}` },
            {
              label: "Số lượng nhận được",
              value: formValues.amount ? `${formValues.amount} ${selectedToken}` : `0.0 ${selectedToken}`,
            },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between">
              <span className="text-gray-400 font-medium">{label}:</span>
              <span
                className={label === "Số lượng nhận được" ? "font-semibold text-green-400" : "font-medium"}
              >
                {value}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-green-500/50 transition-all duration-300 py-3 text-lg mt-2"
          disabled={!isButtonEnabled()}
        >
          {getButtonText()}
        </Button>

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500">
            {error}
          </div>
        )}
      </form>
    </TabsContent>
  );
};

export default BridgeTab;