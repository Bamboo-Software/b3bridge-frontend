/* eslint-disable @typescript-eslint/no-explicit-any */
// import { useBridgeStatusStore } from "@/stores/bridge/useBridgeStatusStore";
import BridgeFormWrap from "./components/BridgeFormWrap";

import { useWatchTokenEvents } from "@/hooks/event/useWatchTokenEvents ";
// import { useEffect } from "react";
// import { useAccount } from "wagmi";
// import { useTransactionStore } from "@/hooks/useTransactionStore";
// import { ChainTokenSource } from "@/utils/enums/chain";
// import { CCIPTransactionStatus } from "@/utils/enums/transaction";
import { Card, CardContent } from "@/components/ui/card";


const BridgePage = () => {
  // const {address}=useAccount()
  // const shouldUpdate = useBridgeStatusStore((s) => s.shouldUpdateState);
  // const clearUpdateFlag = useBridgeStatusStore((s) => s.clearUpdateFlag);

  // const allTx = useTransactionStore((s) => s.allTx);
  // const setAllTx = useTransactionStore((s) => s.setAllTx);
  useWatchTokenEvents()


  // useEffect(() => {
  //   if (!shouldUpdate || !address) return;

  //   const userTxs = allTx?.[address] || [];
  //   const updatedTxs = userTxs.map((tx) => {
  //     if (
  //       tx.source === ChainTokenSource.Local &&
  //       tx.status !== CCIPTransactionStatus.TARGET
  //     ) {
  //       return { ...tx, status: CCIPTransactionStatus.TARGET };
  //     }
  //     return tx;
  //   });

  //   setAllTx({ ...allTx, [address]: updatedTxs });
  //   clearUpdateFlag();
  // }, [shouldUpdate, address, allTx, setAllTx, clearUpdateFlag]);
  return (
     <div className="bg-background flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-1 flex justify-center items-start">
        <Card className="w-full max-w-[450px]">
          <CardContent className="p-6 bg-background ">
            <BridgeFormWrap />
          </CardContent>
        </Card>
      </div>

      {/* <footer className="w-full bg-background border-t text-center text-sm text-muted-foreground py-2">
        <p>Powered by B3Bridge Protocol - Secure, Fast, and Reliable</p>
      </footer> */}
    </div>
  );
};

export default BridgePage;