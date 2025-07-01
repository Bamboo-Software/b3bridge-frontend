"use client";
import React from "react";
import { Controller, Control, FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";

export interface FormData {
  fromChainId: string;
  toChainId: string;
  amount: string;
  selectedToken: string;
  receiverAddress: string;
}

interface ReceiverAddressInputProps {
  control: Control<FormData>;
  isDisabled: boolean;
  errors: FieldErrors<FormData>;
}

const ReceiverAddressInput: React.FC<ReceiverAddressInputProps> = ({ control, isDisabled, errors }) => {
  return (
    <div className="space-y-2">
      <label className="text-base font-semibold text-gray-200">Receiver Address</label>
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
          <Input
            {...field}
            placeholder="0x..."
            disabled={isDisabled}
            className="border border-green-500/40 bg-gray-800/70 rounded-xl text-base text-gray-100 focus:ring-2 focus:ring-green-500/60 font-bold"
          />
        )}
      />
      {errors.receiverAddress && (
        <p className="font-manrope text-red-500 text-sm mt-1">{errors.receiverAddress.message}</p>
      )}
    </div>
  );
};

export default ReceiverAddressInput;