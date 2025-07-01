"use client";
import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";

export interface FormData {
  fromChainId: string;
  toChainId: string;
  amount: string;
  selectedToken: string;
  receiverAddress: string;
}

interface TransactionButtonProps {
  isDisabled: boolean;
  wallet: { address: string } | undefined;
  formValues: FormData;
  tokenIdError: string | null;
  error: string | null;
  elapsedTime: number;
  erc20LockHash?: `0x${string}`;
  nativeLockHash?: `0x${string}`;
  burnWrappedHash?: `0x${string}`;
  burnHash?: `0x${string}`;
  handleButtonClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const TransactionButton: React.FC<TransactionButtonProps> = ({
  isDisabled,
  wallet,
  formValues,
  tokenIdError,
  error,
  elapsedTime,
  erc20LockHash,
  nativeLockHash,
  burnWrappedHash,
  burnHash,
  handleButtonClick,
}) => {
  const isButtonEnabled = () => {
    if (isDisabled || elapsedTime > 0) return false;
    if (!formValues.fromChainId || tokenIdError) return false;
    if (!wallet) return true;
    return !isDisabled || !!error;
  };
    const isWalletReady = useMemo(() => !!wallet?.address, [wallet]);
    const buttonText = useMemo(() => {
    if (!isWalletReady) return "Bridge";

    if (!formValues.fromChainId) return "Select Source Chain";
    if (tokenIdError) return "Error Fetching Token ID";
    if (error === "Giao dịch đã bị hủy bởi người dùng") return "Giao dịch đã bị hủy";
    if (error) return "Retry Bridge";
    if (isDisabled || elapsedTime > 0) return "Bridging...";

    return "Bridge";
  }, [
    isWalletReady,
    formValues.fromChainId,
    tokenIdError,
    error,
    isDisabled,
    elapsedTime,
  ]);

  return (
    <>
      {(erc20LockHash || nativeLockHash || burnWrappedHash || burnHash) && (
        <Button
          type="button"
          className="w-full px-5 py-2.5 text-base font-semibold bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full shadow-lg hover:shadow-green-500/50 transition-all duration-300 border-none"
          onClick={() => {
            const hash = erc20LockHash || nativeLockHash || burnWrappedHash || burnHash;
            const isSeiTx = !!(burnWrappedHash || burnHash);
            const url = isSeiTx
              ? `${process.env.NEXT_PUBLIC_TX_SEITRACE}${hash}?chain=${process.env.NEXT_PUBLIC_TX_NETWORK}`
              : `${process.env.NEXT_PUBLIC_TX_ETH}/${hash}`;
            window.open(url, "_blank");
          }}
        >
          View transaction
        </Button>
      )}
      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-green-500/50 transition-all duration-300 py-3 text-base mt-2"
        disabled={!isButtonEnabled()}
        onClick={handleButtonClick}
      >
        {buttonText}
      </Button>
      {(error || tokenIdError) && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500 font-manrope">
          {error || tokenIdError}
        </div>
      )}
    </>
  );
};

export default TransactionButton;