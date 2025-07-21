/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

import { ChainTokenSource } from '@/utils/enums/chain';
import { CCIPTransactionStatus, StargateTransactionStatus } from '@/utils/enums/transaction';
import { StargateRouteName } from '@/utils/enums/bridge';
import type { ITransaction } from '@/utils/interfaces/transaction';
import { useLazyGetByTxHashQuery } from '@/services/layerzero-scan';
import { useLazyGetBusQueueQuery } from '@/services/stargate-transaction';
import { useTransactionStore } from '../useTransactionStore';

export function useStargateTransaction(tx: ITransaction, enabled = true) {
  const [status, setStatus] = useState<StargateTransactionStatus | CCIPTransactionStatus>(tx.status);
  const [hash, setHash] = useState(tx.txHash);
  const { address } = useAccount();
  const updateTransactionByTxHash = useTransactionStore(state => state.updateTransactionByTxHash);

  const isDelivered = status === StargateTransactionStatus.DELIVERED;
  const [triggerGetBusQueue] = useLazyGetBusQueueQuery();
  const [triggerLayerZero] = useLazyGetByTxHashQuery();

  const updateTx = (updates: Partial<ITransaction>) => {
    if (!address || !tx.txHash) return;
    updateTransactionByTxHash(address, tx.txHash, updates);
  };

  useEffect(() => {
    if (!enabled || !tx.txHash || isDelivered || tx.source !== ChainTokenSource.Stargate) return;

    let interval: NodeJS.Timeout;
    const route = tx.quote?.routeName;

    if (route === StargateRouteName.Bus) {
      interval = setInterval(async () => {
        try {
          switch (status) {
            case StargateTransactionStatus.CREATED: {
              const res = await triggerGetBusQueue({ txHash: tx.txHash }).unwrap();
              const busId = res?.[0]?.bus?.busId;
              if (busId) {
                setStatus(StargateTransactionStatus.INQUEUE);
                updateTx({ status: StargateTransactionStatus.INQUEUE });
              }
              break;
            }

            case StargateTransactionStatus.INQUEUE: {
              const res = await triggerGetBusQueue({ txHash: tx.txHash }).unwrap();
              const layerZeroHash = res?.[0]?.bus?.txHash;
              if (layerZeroHash) {
                setStatus(StargateTransactionStatus.BUS_DISTRIBUTE);
                setHash(layerZeroHash);
                updateTx({
                  status: StargateTransactionStatus.BUS_DISTRIBUTE,
                  txHash: layerZeroHash,
                });
              }
              break;
            }

            case StargateTransactionStatus.BUS_DISTRIBUTE:
            case StargateTransactionStatus.INFLIGHT:
            case StargateTransactionStatus.CONFIRMING: {
              const rawData = await triggerLayerZero({ txHash: hash }).unwrap();
              const newStatus = rawData?.data?.[0]?.status?.name as StargateTransactionStatus;
              if (newStatus) {
                setStatus(newStatus);
                updateTx({ status: newStatus });
                if (newStatus === StargateTransactionStatus.DELIVERED) {
                  clearInterval(interval);
                }
              }
              break;
            }

            default: {
              break;
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
          const newStatus = rawData?.data?.[0]?.status?.name as StargateTransactionStatus;
          if (newStatus) {
            setStatus(newStatus);
            updateTx({ status: newStatus });
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
    hash, 
  ]);

  return { status, txHash: hash };
}
