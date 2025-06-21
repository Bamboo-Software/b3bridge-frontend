import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import BridgeForm from "./BridgeForm";
import TransferHistory from "./TransferHistory";

export interface BridgeFormData {
  fromChain: {
    name: string;
    avatar: string;
    id: string;
    chainSelector: string;
  };
  fromWalletAddress: string;
  amount: string;
  tokenAddress: string;
  tokenSymbol: string; // Thêm trường tokenSymbol
  toChain: {
    name: string;
    avatar: string;
    id: string;
    chainSelector: string;
  };
  toWalletAddress: string;
  timestamp: string;
}

const BridgeFormWrap = () => {
  const [transferHistory, setTransferHistory] = useState<BridgeFormData[]>([]);
  const [activeTab, setActiveTab] = useState("bridge");

  const handleBridgeSubmit = (data: BridgeFormData) => {
    setTransferHistory(prev => [data, ...prev]);
    console.log("Bridge Data:", data);
    
    setTimeout(() => {
      setActiveTab("history");
    }, 500);
  };

  return (
    <Card className="max-w-8xl mx-auto shadow-lg border-primary/10">
      <CardHeader className="bg-gradient-to-r from-primary/5 via-cyan-400/5 to-purple-500/5">
        <CardTitle className="text-center text-2xl font-bold bg-gradient-to-r from-primary via-cyan-400 to-purple-500 bg-clip-text text-transparent">
          B3Bridge - Cross-Chain Token Bridge
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full mb-6 p-1 bg-primary/5 rounded-lg">
            <TabsTrigger 
              value="bridge" 
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-primary/10 data-[state=active]:shadow-sm transition-all duration-200"
            >
              Bridge Tokens
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-primary/10 data-[state=active]:shadow-sm transition-all duration-200"
            >
              Transfer History
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="bridge" className="mt-0 transition-all duration-200">
            <BridgeForm onSubmit={handleBridgeSubmit} />
          </TabsContent>
          
          <TabsContent value="history" className="mt-0 transition-all duration-200">
            <TransferHistory history={transferHistory} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BridgeFormWrap;