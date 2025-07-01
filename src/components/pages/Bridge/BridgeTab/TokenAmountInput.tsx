/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import { Controller, Control, UseFormSetValue, FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Token } from "@/configs/networkConfig";
import { formatLength, formatBalance } from "@/utils";

export interface FormData {
  fromChainId: string;
  toChainId: string;
  amount: string;
  selectedToken: string;
  receiverAddress: string;
}

interface TokenAmountInputProps {
  control: Control<FormData>;
  setValue: UseFormSetValue<FormData>;
  balance: { decimals: number; formatted: string; symbol: string; value: bigint } | undefined;
  isDisabled: boolean;
  availableTokens: Token[];
  selectedTokenConfig: Token | undefined;
  formValues: FormData;
  errors: FieldErrors<FormData>;
}

const TokenAmountInput: React.FC<TokenAmountInputProps> = ({
  control,
  setValue,
  balance,
  isDisabled,
  availableTokens,
  selectedTokenConfig,
  formValues,
  errors,
}) => {
  return (
    <div className="bg-gray-800/70 rounded-xl p-5 border border-green-500/40 shadow-lg hover:border-green-500/60 transition-colors duration-200 space-y-3">
      <div className="flex justify-between items-center mb-2">
        <span className="text-base text-gray-400 font-medium">Token</span>
        <span className="text-base text-gray-400 font-medium">
          Balance: {balance && formValues.fromChainId && formValues.selectedToken ? formatLength("" + balance.formatted, true) : "0"} {balance && formValues.fromChainId && formValues.selectedToken ? (balance?.symbol || formValues.selectedToken) : ""}
        </span>
      </div>
      <div className="flex gap-3 items-center">
        <Controller
          name="amount"
          control={control}
          rules={{
            required: "Amount is required",
            validate: {
              positive: value => parseFloat(value) > 0 || "Amount must be greater than 0",
              withinBalance: value => {
                const parsed = parseFloat(value);
                const currentBalance = parseFloat(balance?.formatted || "0");
                return parsed <= currentBalance || "Amount exceeds your balance";
              },
            },
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
              <SelectTrigger className="w-[120px] font-manrope font-bold border border-green-500/40 bg-gray-800/70 rounded-xl text-base text-gray-100 focus:ring-2 focus:ring-green-500/60 hover:bg-gray-700/70 transition-all duration-200">
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
  );
};

export default TokenAmountInput;