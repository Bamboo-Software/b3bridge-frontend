/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

import { ChainTokenSource } from '@/utils/enums/chain';
import { StargateTransactionStatus } from '@/utils/enums/transaction';
import { StargateRouteName } from '@/utils/enums/bridge';
import type { ITransaction } from '@/utils/interfaces/transaction';
import { useLazyGetByTxHashQuery } from '@/services/layerzero-scan';
import { useLazyGetBusQueueQuery } from '@/services/stargate-transaction';
import { useTransactionStore } from '../useTransactionStore';

export function useStargateTransactionStatus(tx: ITransaction, enabled = true) {
  const [status, setStatus] = useState(tx.status);
  const { address } = useAccount();
  const allTx = useTransactionStore(state => state.allTx)
  const setAllTx = useTransactionStore(state => state.setAllTx)

  const isDelivered = status === StargateTransactionStatus.DELIVERED;
  const [triggerGetBusQueue] = useLazyGetBusQueueQuery();
  const [triggerLayerZero] = useLazyGetByTxHashQuery();

  const updateTxStatus = (newStatus: StargateTransactionStatus) => {
    if (!address || !tx.txHash) return;
    const prev = allTx || {};
    const userTxs = prev[address] || [];

    const updated = userTxs.map((t) =>
      t.txHash === tx.txHash ? { ...t, status: newStatus } : t
    );

    setAllTx({
      ...prev,
      [address]: updated,
    });
  };

  useEffect(() => {
    if (!enabled || !tx.txHash || isDelivered || tx.source !== ChainTokenSource.Stargate) return;

    let interval: NodeJS.Timeout;
    const route = tx.quote?.routeName;

    if (route === StargateRouteName.Bus) {
      interval = setInterval(async () => {
        try {
          if (status === StargateTransactionStatus.CREATED) {
            const res = await triggerGetBusQueue({ txHash: tx.txHash }).unwrap();
            const busId = res?.result?.busId;
            const newStatus = busId
              && StargateTransactionStatus.INQUEUE

            setStatus(newStatus || status);
            updateTxStatus(newStatus);
          }

          if (status === StargateTransactionStatus.INQUEUE) {
            const rawData = await triggerLayerZero({ txHash: tx.txHash }).unwrap();
            const newStatus = rawData?.data?.[0]?.status?.name;
            if(newStatus){
              setStatus(newStatus);
              updateTxStatus(newStatus);
              if (newStatus === StargateTransactionStatus.DELIVERED) {
                clearInterval(interval);
              }
            }
          }
        } catch (_) {
            // skip
        }
      }, 1000);
    }

    if (route === StargateRouteName.Taxi) {
      interval = setInterval(async () => {
        try {
          const rawData = await triggerLayerZero({ txHash: tx.txHash }).unwrap();
          const newStatus = rawData?.data?.[0]?.status?.name;
          if(newStatus){
            setStatus(newStatus);
            updateTxStatus(newStatus);
            if (newStatus === StargateTransactionStatus.DELIVERED) {
              clearInterval(interval);
            }
          }
        } catch (_) {
          // skip
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [
    enabled,
    tx.txHash,
    tx.source,
    tx.quote?.routeName,
    status,
    isDelivered,
    triggerGetBusQueue,
    triggerLayerZero,
  ]);

  return status;
}
