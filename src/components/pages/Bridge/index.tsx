"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, Clock, Info, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function BridgePage() {
  const [amount, setAmount] = useState("");
  const [, setSelectedTab] = useState("bridge");
  
  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-background/30 backdrop-blur-md rounded-xl border border-green-500/20 shadow-lg p-6"
      >
        <Tabs defaultValue="bridge" onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-2 bg-background/50 border border-green-500/20">
            <TabsTrigger value="bridge">Bridge</TabsTrigger>
            <TabsTrigger value="history">Lịch sử</TabsTrigger>
          </TabsList>
          
          <TabsContent value="bridge" className="pt-4 space-y-6">
            {/* Source Chain */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Từ mạng</label>
              <Select defaultValue="ethereum">
                <SelectTrigger className="w-full border border-green-500/20">
                  <SelectValue placeholder="Chọn mạng nguồn" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ethereum">Ethereum</SelectItem>
                  <SelectItem value="bsc">Binance Smart Chain</SelectItem>
                  <SelectItem value="polygon">Polygon</SelectItem>
                  <SelectItem value="avalanche">Avalanche</SelectItem>
                  <SelectItem value="arbitrum">Arbitrum</SelectItem>
                  <SelectItem value="optimism">Optimism</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Token and Amount */}
            <div className="bg-background/50 rounded-lg p-4 border border-border">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Token</span>
                <span className="text-sm text-muted-foreground">Balance: 0.45 ETH</span>
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="border-0 bg-transparent text-xl focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                />
                <Select defaultValue="eth">
                  <SelectTrigger className="w-[120px] border border-green-500/20">
                    <SelectValue placeholder="Token" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eth">ETH</SelectItem>
                    <SelectItem value="usdt">USDT</SelectItem>
                    <SelectItem value="usdc">USDC</SelectItem>
                    <SelectItem value="dai">DAI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end mt-2">
                <Button variant="ghost" size="sm" className="h-7 text-xs text-green-500">
                  MAX
                </Button>
              </div>
            </div>
            
            {/* Direction Arrow */}
            <div className="flex justify-center -my-2">
              <div className="bg-background rounded-full p-2 border border-green-500/30 shadow-md">
                <ArrowDown className="h-4 w-4" />
              </div>
            </div>
            
            {/* Destination Chain */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Đến mạng</label>
              <Select defaultValue="polygon">
                <SelectTrigger className="w-full border border-green-500/20">
                  <SelectValue placeholder="Chọn mạng đích" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ethereum">Ethereum</SelectItem>
                  <SelectItem value="bsc">Binance Smart Chain</SelectItem>
                  <SelectItem value="polygon">Polygon</SelectItem>
                  <SelectItem value="avalanche">Avalanche</SelectItem>
                  <SelectItem value="arbitrum">Arbitrum</SelectItem>
                  <SelectItem value="optimism">Optimism</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Receiver Address */}
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <label className="text-sm font-medium">Địa chỉ nhận</label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-[200px] text-xs">
                        Địa chỉ ví trên mạng đích để nhận token. Mặc định là địa chỉ ví hiện tại của bạn.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input 
                placeholder="0x..." 
                className="border-green-500/20"
                defaultValue="0x7F5E8d69C0A36E8B142A7a55A8EE814D4c3bDe5a"
              />
            </div>
            
            {/* Transaction Details */}
            <div className="space-y-2 text-sm bg-background/50 rounded-lg p-4 border border-green-500/20">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phí giao dịch:</span>
                <span>0.002 ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Thời gian ước tính:</span>
                <span>~15 phút</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tỷ lệ quy đổi:</span>
                <span>1 ETH = 1 ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Số lượng nhận:</span>
                <span className="font-medium text-green-500">{amount ? amount : '0.0'} ETH</span>
              </div>
            </div>
            
            {/* Action Button */}
            <Button 
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
              disabled={!amount}
            >
              Chuyển Token
            </Button>
          </TabsContent>
          
          <TabsContent value="history" className="pt-4 space-y-4">
            <div className="text-sm text-muted-foreground text-center mb-2">
              Lịch sử giao dịch gần đây
            </div>
            
            {/* Transaction History Items */}
            <TransactionItem 
              fromChain="Ethereum"
              toChain="Polygon"
              amount="0.5 ETH"
              status="completed"
              timestamp="2 giờ trước"
            />
            
            <TransactionItem 
              fromChain="Binance Smart Chain"
              toChain="Arbitrum"
              amount="200 USDT"
              status="pending"
              timestamp="5 giờ trước"
            />
            
            <TransactionItem 
              fromChain="Polygon"
              toChain="Optimism"
              amount="100 USDC"
              status="completed"
              timestamp="1 ngày trước"
            />
            
            <div className="text-center mt-4">
              <Button variant="outline" size="sm" className="text-xs border-green-500/20">
                Xem tất cả giao dịch
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

// Component hiển thị một giao dịch trong lịch sử
interface TransactionItemProps {
  fromChain: string;
  toChain: string;
  amount: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
}

function TransactionItem({ fromChain, toChain, amount, status, timestamp }: TransactionItemProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-background/50 rounded-lg p-4 border border-green-500/20 hover:border-green-500/40 transition-colors"
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-1.5">
          <span className="font-medium">{amount}</span>
          {status === 'pending' && (
            <div className="flex items-center text-yellow-500">
              <Clock className="h-3.5 w-3.5 mr-1" />
              <span className="text-xs">Đang xử lý</span>
            </div>
          )}
          {status === 'completed' && (
            <div className="flex items-center text-green-500">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
              <span className="text-xs">Hoàn thành</span>
            </div>
          )}
          {status === 'failed' && (
            <div className="flex items-center text-red-500">
              <Info className="h-3.5 w-3.5 mr-1" />
              <span className="text-xs">Thất bại</span>
            </div>
          )}
        </div>
        <span className="text-xs text-muted-foreground">{timestamp}</span>
      </div>
      
      <div className="flex items-center gap-2 text-sm">
        <span>{fromChain}</span>
        <ArrowDown className="h-3 w-3 rotate-[-90deg] text-muted-foreground" />
        <span>{toChain}</span>
      </div>
      
      <div className="mt-2 text-xs">
        <Button variant="link" className="h-auto p-0 text-green-500">
          Xem chi tiết
        </Button>
      </div>
    </motion.div>
  );
}