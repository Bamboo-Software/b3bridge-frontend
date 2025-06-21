import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BridgeForm from "./BridgeForm";

export interface BridgeFormData {
  fromChain: {
    name: string;
    id: string;
    chainSelector: string;
  };
  fromWalletAddress: string;
  amount: string;
  tokenAddress: string;
  tokenSymbol: string;
  toChain: {
    name: string;
    id: string;
    chainSelector: string;
  };
  toWalletAddress: string;
  timestamp: string;
}

const BridgeFormWrap = () => {


  const handleBridgeSubmit = (data: BridgeFormData) => {
    console.log("Bridge Data:", data);

  };

  return (
    <Card className="max-w-8xl mx-auto shadow-lg border-primary/10">
      <CardHeader className="bg-gradient-to-r from-primary/5 via-cyan-400/5 to-purple-500/5">
        <CardTitle className="text-center text-2xl font-bold bg-gradient-to-r from-primary via-cyan-400 to-purple-500 bg-clip-text text-transparent">
          B3Bridge - Cross-Chain Token Bridge
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <BridgeForm onSubmit={handleBridgeSubmit} />
      </CardContent>
    </Card>
  );
};

export default BridgeFormWrap;