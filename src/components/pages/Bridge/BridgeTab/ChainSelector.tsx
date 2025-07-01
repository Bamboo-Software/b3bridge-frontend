/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import { Controller, Control, UseFormReset } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useWallet } from "@/hooks/useWallet";
import { useModalStore } from "@/store/useModalStore";
import { useBridgeStatusStore } from "@/store/useBridgeStatusStore";

export interface ChainConfig {
  chain: {
    id: number;
    name: string;
    nativeCurrency: { name: string; symbol: string; decimals: number };
  };
  logoURL: string;
}

export interface FormData {
  fromChainId: string;
  toChainId: string;
  amount: string;
  selectedToken: string;
  receiverAddress: string;
}

interface ChainSelectorProps {
  name: keyof FormData;
  label: string;
  control: Control<FormData>;
  supportedChains: ChainConfig[];
  disabledChains: number[];
  selectedChain?: ChainConfig;
  reset: UseFormReset<FormData>;
}

export const ChainSelector: React.FC<ChainSelectorProps> = ({
  name,
  label,
  control,
  supportedChains,
  disabledChains,
  reset,
  selectedChain,
}) => {
  const { wallet, disconnect, switchNetWorkWallet } = useWallet();
  const { setFromChainIdStore, setToChainIdStore } = useModalStore();
  const triggerReset = useBridgeStatusStore((state) => state.triggerReset);

  return (
    <div className="space-y-2 font-manrope">
      <div className="flex justify-between items-center">
        <label className="text-base font-semibold text-gray-200">{label}</label>
        {label !== "To" && wallet?.address && (
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-gray-400 font-bold focus:outline-none">
                  {`${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={() => {
                    reset?.();
                    disconnect();
                  }}
                  className="text-red-500 cursor-pointer"
                >
                  Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              type="button"
              onClick={() => {
                reset?.();
                useModalStore.getState().setFromChainIdStore(undefined);
                triggerReset();
              }}
              className="text-sm text-gray-300 px-3 py-1 border border-gray-500 rounded-lg hover:bg-gray-700 transition"
            >
              Reset
            </button>
          </div>
        )}
      </div>
      <Controller
        name={name}
        control={control}
        rules={{ required: `Please select ${label.toLowerCase()} chain` }}
        render={({ field }) => (
          <Select
            value={field.value?.toString() || ""}
            onValueChange={(val) => {
              const selectedId = Number(val);
              field.onChange(val);
              if (label !== "To") {
                setFromChainIdStore(selectedId);
                reset?.({
                  fromChainId: val,
                  toChainId: "",
                  amount: "",
                  selectedToken: "",
                  receiverAddress: "",
                });
              } else {
                setToChainIdStore(selectedId);
              }
              switchNetWorkWallet(selectedId, label !== "To");
            }}
          >
            <SelectTrigger className="w-full border font-manrope font-bold border-green-500/40 bg-gray-800/70 rounded-xl text-base text-gray-400 focus:ring-2 focus:ring-green-500/60 hover:bg-gray-700/70 px-4 py-2">
              <SelectValue placeholder="Select a chain">
                {selectedChain && (
                  <div className="flex items-center gap-2">
                    <img
                      src={selectedChain.logoURL || "/default-chain.png"}
                      alt={`${selectedChain.chain.name} logo`}
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                    <span className="font-manrope font-bold text-gray-100">
                      {selectedChain.chain.name}
                    </span>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-gray-800/70">
              {supportedChains.map((chain) => (
                <SelectItem
                  key={chain.chain.id}
                  value={chain.chain.id.toString()}
                  disabled={disabledChains.includes(chain.chain.id)}
                  className="bg-gray-800/70 font-manrope font-bold text-gray-100"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={chain.logoURL || "/default-chain.png"}
                      alt={`${chain.chain.name} logo`}
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                    <span className="text-gray-400">{chain.chain.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </div>
  );
};