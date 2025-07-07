import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const CreateTokenPage: React.FC = () => {
  const [chain, setChain] = useState("");
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [decimals, setDecimals] = useState("");
  const [totalSupply, setTotalSupply] = useState({ eth: "", avax: "", bsc: "" });
  const [tokenType, setTokenType] = useState("OFT");

  return (
    <Card className="max-w-[500px] mx-auto bg-[#1a1a2e] text-white border-none ">
      <CardHeader>
        <CardTitle className="text-2xl">Create Token</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Chain</Label>
          <Select onValueChange={setChain} value={chain}>
            <SelectTrigger className="w-full bg-[#16213e] border-none text-white">
              <SelectValue placeholder="Choose chain" />
            </SelectTrigger>
            <SelectContent className="bg-[#16213e] text-white">
              <SelectItem value="Ethereum">Ethereum</SelectItem>
              <SelectItem value="Avalanche">Avalanche</SelectItem>
              <SelectItem value="BSC">BSC</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Type</Label>
          <RadioGroup
            value={tokenType}
            onValueChange={setTokenType}
            className="flex flex-col space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="OFT" id="oft" />
              <Label htmlFor="oft">Omnichain Fungible Token (OFT)</Label>
            </div>
          </RadioGroup>
        </div>
        <div className="space-y-2">
          <Label>Name</Label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-[#16213e] border-none text-white placeholder-gray-400"
            placeholder="Name"
          />
        </div>
        <div className="space-y-2">
          <Label>Symbol</Label>
          <Input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="bg-[#16213e] border-none text-white placeholder-gray-400"
            placeholder="Symbol"
          />
        </div>
        <div className="space-y-2">
          <Label>Decimals</Label>
          <Input
            type="number"
            value={decimals}
            onChange={(e) => setDecimals(e.target.value)}
            className="bg-[#16213e] border-none text-white placeholder-gray-400"
            placeholder="Decimals"
          />
        </div>
        <div className="space-y-2">
          <Label>Total Supply</Label>
          <Input
            type="number"
            value={totalSupply.eth}
            onChange={(e) => setTotalSupply({ ...totalSupply, eth: e.target.value })}
            className="bg-[#16213e] border-none text-white placeholder-gray-400"
            placeholder="ETH"
          />
          <Input
            type="number"
            value={totalSupply.avax}
            onChange={(e) => setTotalSupply({ ...totalSupply, avax: e.target.value })}
            className="bg-[#16213e] border-none text-white placeholder-gray-400"
            placeholder="Avalanche"
          />
          <Input
            type="number"
            value={totalSupply.bsc}
            onChange={(e) => setTotalSupply({ ...totalSupply, bsc: e.target.value })}
            className="bg-[#16213e] border-none text-white placeholder-gray-400"
            placeholder="BSC"
          />
        </div>
        <div className="space-y-2">
          <Label>Upload token logo</Label>
          <div className="w-full h-[100px] bg-[#16213e] border-2 border-dashed border-[#4e4e4e] rounded-md flex items-center justify-center text-gray-400">
            Select image to upload or drag and drop it here
          </div>
        </div>
        <p className="text-[#00d4ff] text-sm">Creation fees: 0.04 ETH | 0.04 AVAX | 0.04 BSC</p>
      </CardContent>
      <CardFooter>
        <Button className="w-full bg-[#00d4ff] text-[#1a1a2e] hover:bg-[#00b4df]">
          Create Token
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CreateTokenPage;