import { useAccount } from "wagmi";
import { useTransactionStore } from "@/hooks/useTransactionStore";
import type { ITransaction } from "@/utils/interfaces/transaction";


export function useLocalTransactionStatus(tx: ITransaction | undefined) {
  const { address } = useAccount();
  const allTx = useTransactionStore((state) => state.allTx);

  const userTxs = address ? allTx?.[address] || [] : [];

  const actualStatus =
    userTxs.find((t) => t.txHash === tx?.txHash)?.status || tx?.status;

  return {
    status: actualStatus,
    txHash: tx?.txHash,
  };
}