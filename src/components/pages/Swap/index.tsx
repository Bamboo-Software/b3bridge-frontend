"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowDownUp, Settings, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Import token icons

import Image from "next/image";

// Token data with icons
const tokens = {
  eth: { name: "ETH", icon: "/images/ethereum.png" },
  sol: { name: "SOL", icon: "/images/solana.png" },
  bnb: { name: "BNB", icon: "/images/bnb.png" },
  usdc: { name: "USDC", icon: "/images/usdc.png" },
  usdt: { name: "USDT", icon: "/images/usdt.png" },
};

export default function SwapPage() {
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [slippage, setSlippage] = useState([1.0]);
  const [isSwapping, setIsSwapping] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [fromToken, setFromToken] = useState("eth");
  const [toToken, setToToken] = useState("solana");
  
  // Handle countdown timer when swapping
  useEffect(() => {
    let timer: number | undefined;
    
    if (isSwapping && countdown > 0) {
      timer = window.setTimeout(() => {
        setCountdown(countdown - 1);
        
        if (countdown === 1) {
          // Swap completed
          setIsSwapping(false);
          // Reset values or perform additional actions
        }
      }, 1000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isSwapping, countdown]);
  
  // Handle swap button click
  const handleSwap = () => {
    if (!fromAmount) return;
    
    setIsSwapping(true);
    setCountdown(5); // 5 seconds countdown
  };
  
  // Handle token swap positions
  const handleSwapPositions = () => {
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);
    
    const tempAmount = fromAmount;
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };
  const tokenData = tokens[fromToken as keyof typeof tokens];
  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-background/30 backdrop-blur-md rounded-xl border border-green-500/20 shadow-lg p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Swap Token</h2>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
        
        {/* From Token */}
        <div className="space-y-4">
          <div className="bg-background/50 rounded-lg p-4 border border-border">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">From</span>
              <span className="text-sm text-muted-foreground">Balance: 0.0</span>
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="0.0"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="border-0 bg-transparent text-xl focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
              />
              <Select value={fromToken} onValueChange={setFromToken}>
                <SelectTrigger className="w-[180px] border border-green-500/20">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      {tokenData && (
                            <>
                                <Image
                                src={tokenData.icon}
                                alt={tokenData.name}
                                className="w-5 h-5"
                                width={20}
                                height={20}
                                />
                                <span>{tokenData.name}</span>
                            </>
                            )}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(tokens).map(([value, { name, icon }]) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center gap-2">
                        {tokenData && (
                            <>
                                <Image
                                src={tokenData.icon}
                                alt={tokenData.name}
                                className="w-5 h-5"
                                width={20}
                                height={20}
                                />
                                <span>{tokenData.name}</span>
                            </>
                            )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-between mt-2">
              <Select defaultValue="ethereum">
                <SelectTrigger className="w-[140px] h-7 text-xs border-green-500/20">
                  <SelectValue placeholder="Chain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ethereum">Ethereum</SelectItem>
                  <SelectItem value="bsc">Binance Smart Chain</SelectItem>
                  <SelectItem value="polygon">Polygon</SelectItem>
                  <SelectItem value="avalanche">Avalanche</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-green-500">
                MAX
              </Button>
            </div>
          </div>
          
          {/* Swap Button */}
          <div className="flex justify-center -my-2 z-10 relative">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full bg-background border-green-500/30 shadow-md"
              onClick={handleSwapPositions}
            >
              <ArrowDownUp className="h-4 w-4" />
            </Button>
          </div>
          
          {/* To Token */}
          <div className="bg-background/50 rounded-lg p-4 border border-border">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">To</span>
              <span className="text-sm text-muted-foreground">Balance: 0.0</span>
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="0.0"
                value={toAmount}
                onChange={(e) => setToAmount(e.target.value)}
                className="border-0 bg-transparent text-xl focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
              />
              <Select value={toToken} onValueChange={setToToken}>
                <SelectTrigger className="w-[180px] border border-green-500/20">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      {tokenData && (
                            <>
                                <Image
                                src={tokenData.icon}
                                alt={tokenData.name}
                                className="w-5 h-5"
                                width={20}
                                height={20}
                                />
                                <span>{tokenData.name}</span>
                            </>
                            )}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(tokens).map(([value, { name, icon }]) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center gap-2">
                        <Image src={icon} alt={name} className="w-5 h-5" width={20} height={20}/>
                        <span>{name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-between mt-2">
              <Select defaultValue="polygon">
                <SelectTrigger className="w-[140px] h-7 text-xs border-green-500/20">
                  <SelectValue placeholder="Chain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ethereum">Ethereum</SelectItem>
                  <SelectItem value="bsc">Binance Smart Chain</SelectItem>
                  <SelectItem value="polygon">Polygon</SelectItem>
                  <SelectItem value="avalanche">Avalanche</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Slippage Settings */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-sm">Slippage Tolerance</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-[200px] text-xs">
                      Your transaction will revert if the price changes unfavorably by more than this percentage
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="text-sm font-medium">{slippage[0].toFixed(1)}%</span>
          </div>
          <Slider
            value={slippage}
            min={0.1}
            max={5.0}
            step={0.1}
            onValueChange={setSlippage}
          />
        </div>
        
        {/* Transaction Details */}
        <div className="mt-6 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Exchange Rate</span>
            <span>1 ETH = 15 Solana</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Transaction Fee</span>
            <span>0.005 ETH</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Estimated Time</span>
            <span>~5 minutes</span>
          </div>
        </div>
        
        {/* Swap Button */}
        <Button 
          className="w-full mt-6 rounded-lg bg-gradient-to-r from-green-500 to-emerald-700 hover:from-green-600 hover:to-emerald-800"
          onClick={handleSwap}
          disabled={isSwapping || !fromAmount}
        >
          {isSwapping ? "Processing..." : "Swap Token"}
        </Button>
      </motion.div>
      
      {/* Processing Dialog with Countdown */}
      <Dialog open={isSwapping} onOpenChange={(open) => !open && setIsSwapping(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Processing Swap</DialogTitle>
            <DialogDescription>
              Please wait while your transaction is being processed
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center justify-center py-8 space-y-6">
            <div className="relative">
              <Loader2 className="h-16 w-16 text-green-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold">{countdown}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
               {tokenData && (
                    <>
                        <Image
                        src={tokenData.icon}
                        alt={tokenData.name}
                        className="w-5 h-5"
                        width={20}
                        height={20}
                        />
                        <span>{fromAmount} {tokenData.name}</span>
                    </>
                    )}
              </div>
              <ArrowDownUp className="h-5 w-5 rotate-90" />
              <div className="flex items-center gap-2">
                {tokenData && (
                    <>
                        <Image
                        src={tokenData.icon}
                        alt={tokenData.name}
                        className="w-5 h-5"
                        width={20}
                        height={20}
                        />
                        <span>{toAmount || fromAmount} {tokenData.name}</span>
                    </>
                    )}
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground text-center">
              Estimated completion time: {countdown} seconds
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}