"use client";
import React from "react";
import { motion } from "framer-motion";
import { formatEther } from "ethers";
import { formatLength } from "@/utils";

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

interface TransactionInfoProps {
  ccipFee: bigint | undefined;
  elapsedTime: number;
  formValues: FormData;
  fromChain: ChainConfig | undefined;
}

const TransactionInfo: React.FC<TransactionInfoProps> = ({ ccipFee, elapsedTime, formValues, fromChain }) => {
  const formatElapsed = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div
      className="space-y-3 text-base bg-gray-800/70 text-gray-200 rounded-xl p-5 border border-green-500/40 shadow-lg hover:border-green-500/60 transition-colors"
      whileHover={{ scale: 1.02 }}
    >
      {[
        {
          label: "Transaction Fee",
          value: ccipFee != null
            ? `${formatLength(formatEther(ccipFee), true)} ${fromChain?.chain?.nativeCurrency?.symbol}`
            : `${formValues.amount} ${fromChain ? fromChain?.chain?.nativeCurrency?.symbol : ""}`,
        },
        {
          label: "Elapsed Time",
          value: elapsedTime > 0 ? formatElapsed(elapsedTime) : "",
        },
        {
          label: "Amount Received",
          value: formValues.amount ? `${formValues.amount} ${formValues.selectedToken}` : `0.0 ${formValues.selectedToken}`,
        },
      ].map(({ label, value }) => (
        <div key={label} className="flex justify-between">
          <span className="text-gray-400 font-medium">{label}:</span>
          <span className={label === "Amount Received" ? "font-semibold text-green-400" : "font-medium"}>
            {value}
          </span>
        </div>
      ))}
    </motion.div>
  );
};

export default TransactionInfo;