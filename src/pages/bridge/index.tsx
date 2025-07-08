/* eslint-disable @typescript-eslint/no-explicit-any */
import BridgeFormWrap from "./components/BridgeFormWrap";

import { useWatchTokenEvents } from "@/hooks/event/useWatchTokenEvents ";


const BridgePage = () => {

  useWatchTokenEvents()



  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-[450px] mx-auto max-h-full sm:max-h-[80vh] overflow-y-auto">
          <BridgeFormWrap />
          <div className="mt-2 text-center text-sm text-muted-foreground">
            <footer className="fixed bottom-0 left-0 w-full bg-background border-t text-center text-sm text-muted-foreground py-2 z-50">
            <p>Powered by B3Bridge Protocol - Secure, Fast, and Reliable</p>
          </footer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BridgePage;