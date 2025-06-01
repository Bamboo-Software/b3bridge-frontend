"use client";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowDown, Clock, Info, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInfiniteQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useWallet } from "@/hooks/useWallet";
import { useBridge } from "@/hooks/useCCIPBridge";
import { networkConfig } from "@/configs/networkConfig";

interface Chain {
  value: string;
  label: string;
}

interface ChainListing {
  id: string;
  image_id?: string;
  [key: string]: any;
}

interface ListingsResponse {
  listings: Record<string, ChainListing>;
}

export default function BridgePage() {
  const { address, isConnected, connectWallet, getCurrentChain } = useWallet();

  const { isBridging, isNativeLockPending, isERC20LockPending, error, handleBridge } = useBridge();

  const [amount, setAmount] = useState("");
  const [fromChainId, setFromChainId] = useState<number>(networkConfig.chains[0].chain.id);
  const [toChainId, setToChainId] = useState<number>(networkConfig.chains[1].chain.id);
  const [selectedToken, setSelectedToken] = useState<string>("");
  const [receiverAddress, setReceiverAddress] = useState(address || "");
  const [logos, setLogos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setSelectedTab] = useState("bridge");
  const [wallets, setWallets] = useState<{ value: string; label: string; logo: string | null }[]>([]);
  const handleBridgeClick = async () => {
    if (!isConnected) {
      connectWallet();
      console.log("Connected");
      return;
    }

    if (!amount || !fromChainId || !toChainId || !receiverAddress) {
      return;
    }

    let tokenAddress = "";
    if (selectedToken) {
      const tokenConfig = networkConfig.tokensList.find(t => t.symbol === selectedToken);
      tokenAddress = tokenConfig?.address[fromChainId] || "";
    }

    try {
      console.log("Handle Bridge");
      await handleBridge(fromChainId, toChainId, amount, tokenAddress, receiverAddress);
    } catch (err) {
      console.error("Bridge failed:", err);
    }
  };

  const fromChain = networkConfig.chains.find((c) => c.chain.id === fromChainId);
  const toChain = networkConfig.chains.find((c) => c.chain.id === toChainId);
  const selectedTokenConfig = networkConfig.tokensList.find((t) => t.symbol === selectedToken);

  return (
    <div className="w-full max-w-lg mx-auto font-poppins">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl rounded-2xl border border-green-500/40 shadow-2xl p-6"
      >
        {/* Nút connect wallet */}
        {!isConnected && (
          <div className="flex justify-center mb-6">
            <Button
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl px-6 py-2 text-lg shadow-lg"
              onClick={connectWallet}
            >
              Connect Wallet
            </Button>
          </div>
        )}
        <Tabs defaultValue="bridge" onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-2 bg-gray-800/60 border border-green-500/40 rounded-full p-1 h-12 mb-8">
            <TabsTrigger
              value="bridge"
              className="text-lg font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white rounded-full transition-all"
            >
              Bridge
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="text-lg font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white rounded-full transition-all"
            >
              Lịch sử
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bridge" className="space-y-8">
            {/* Source Chain */}
            <div className="space-y-2">
              <label className="text-lg font-semibold text-gray-200">Từ mạng</label>
              <Select value={fromChainId.toString()} onValueChange={(v) => setFromChainId(Number(v))}>
                <SelectTrigger className="w-full border border-green-500/40 bg-gray-800/70 rounded-xl text-lg text-gray-100 font-medium focus:ring-2 focus:ring-green-500/60 hover:bg-gray-700/70 transition-all duration-200 flex items-center justify-between px-4 py-2">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      {fromChain && (
                        <>
                          <Image src={fromChain.logoURL || ""} alt={fromChain.chain.name} width={20} height={20} className="rounded-full" />
                          <span>{fromChain.chain.name}</span>
                        </>
                      )}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {networkConfig.chains.map((chain) => (
                    <SelectItem key={chain.chain.id} value={chain.chain.id.toString()}>
                      <div className="flex items-center gap-2">
                        <Image src={chain.logoURL || ""} alt={chain.chain.name} width={20} height={20} className="rounded-full" />
                        <span>{chain.chain.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Token and Amount */}
            <div className="bg-gray-800/70 rounded-xl p-5 border border-green-500/40 shadow-lg hover:border-green-500/60 transition-colors duration-200 space-y-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg text-gray-400 font-medium">Token</span>
                <span className="text-lg text-gray-400 font-medium">Balance: 0.45 ETH</span>
              </div>
              <div className="flex gap-3 items-center">
                <Input
                  type="number"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="border-0 bg-transparent text-2xl text-gray-100 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 flex-1"
                />
                <Select value={selectedToken} onValueChange={setSelectedToken}>
                  <SelectTrigger className="w-[120px] border border-green-500/40 bg-gray-800/70 rounded-xl text-lg text-gray-100 font-medium focus:ring-2 focus:ring-green-500/60 hover:bg-gray-700/70 transition-all duration-200 flex items-center justify-between px-4 py-2">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        {selectedTokenConfig && (
                          <>
                            <Image src={selectedTokenConfig.logoURL} alt={selectedTokenConfig.symbol} width={20} height={20} className="rounded-full" />
                            <span>{selectedTokenConfig.symbol}</span>
                          </>
                        )}
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {networkConfig.tokensList.map((token) => (
                      <SelectItem key={token.symbol} value={token.symbol}>
                        <div className="flex items-center gap-2">
                          <Image src={token.logoURL} alt={token.symbol} width={20} height={20} className="rounded-full" />
                          <span>{token.symbol}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 h-7 text-xs text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded-lg transition-all"
                  style={{ minWidth: 40 }}
                >
                  MAX
                </Button>
              </div>
            </div>

            {/* Direction Arrow */}
            <div className="flex justify-center my-2">
              <motion.div
                className="bg-gray-800 rounded-full p-3 border border-green-500/40 shadow-lg"
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.3 }}
              >
                <ArrowDown className="h-5 w-5 text-green-400" />
              </motion.div>
            </div>

            {/* Destination Chain */}
            <div className="space-y-2">
              <label className="text-lg font-semibold text-gray-200">Đến mạng</label>
              <Select value={toChainId.toString()} onValueChange={(v) => setToChainId(Number(v))}>
                <SelectTrigger className="w-full border border-green-500/40 bg-gray-800/70 rounded-xl text-lg text-gray-100 font-medium focus:ring-2 focus:ring-green-500/60 hover:bg-gray-700/70 transition-all duration-200 flex items-center justify-between px-4 py-2">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      {toChain && (
                        <>
                          <Image src={toChain.logoURL || ""} alt={toChain.chain.name} width={20} height={20} className="rounded-full" />
                          <span>{toChain.chain.name}</span>
                        </>
                      )}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {networkConfig.chains.map((chain) => (
                    <SelectItem key={chain.chain.id} value={chain.chain.id.toString()}>
                      <div className="flex items-center gap-2">
                        <Image src={chain.logoURL || ""} alt={chain.chain.name} width={20} height={20} className="rounded-full" />
                        <span>{chain.chain.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Receiver Address */}
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <label className="text-lg font-semibold text-gray-200">Địa chỉ nhận</label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-gray-900/95 border-green-500/40">
                      <p className="w-[200px] text-xs font-poppins">Địa chỉ ví trên mạng đích để nhận token. Mặc định là địa chỉ ví hiện tại của bạn.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                placeholder="0x..."
                value={receiverAddress}
                onChange={(e) => setReceiverAddress(e.target.value)}
                className="border-green-500/40 bg-gray-800/70 rounded-xl text-lg text-gray-100"
              />
            </div>

            {/* Transaction Details */}
            <motion.div
              className="space-y-3 text-lg bg-gray-800/70 rounded-xl p-5 border border-green-500/40 shadow-lg hover:border-green-500/60 transition-colors"
              whileHover={{ scale: 1.02 }}
            >
              {[
                { label: "Phí giao dịch", value: "0.002 ETH" },
                { label: "Thời gian ước tính", value: "~15 phút" },
                { label: "Tỷ lệ quy đổi", value: "1 ETH = 1 ETH" },
                { label: "Số lượng nhận", value: amount ? `${amount} ETH` : "0.0 ETH" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-gray-400 font-medium">{label}:</span>
                  <span className={label === "Số lượng nhận" ? "font-semibold text-green-400" : "font-medium"}>{value}</span>
                </div>
              ))}
            </motion.div>

            {/* Action Button */}
            <Button
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-green-500/50 transition-all duration-300 py-3 text-lg mt-2"
              disabled={!amount || isBridging || isNativeLockPending || isERC20LockPending}
              onClick={handleBridgeClick}
            >
              {!isConnected ? "Connect Wallet" : 
               isBridging || isNativeLockPending || isERC20LockPending ? "Bridging..." : 
               "Bridge Tokens"}
            </Button>

            {error && <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500">{error}</div>}
          </TabsContent>

          <TabsContent value="history" className="pt-6 space-y-4">
            <div className="text-lg text-gray-400 text-center mb-4">Lịch sử giao dịch gần đây</div>

            {/* Transaction History Items */}
            <TransactionItem fromChain="Ethereum" toChain="Polygon" amount="0.5 ETH" status="completed" timestamp="2 giờ trước" />
            <TransactionItem fromChain="Binance Smart Chain" toChain="Arbitrum" amount="200 USDT" status="pending" timestamp="5 giờ trước" />
            <TransactionItem fromChain="Polygon" toChain="Optimism" amount="100 USDC" status="completed" timestamp="1 ngày trước" />

            <div className="text-center mt-4">
              <Button variant="outline" size="sm" className="text-xs border-green-500/40 text-green-400 hover:bg-green-500/20 rounded-lg">
                Xem tất cả giao dịch
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

interface TransactionItemProps {
  fromChain: string;
  toChain: string;
  amount: string;
  status: "pending" | "completed" | "failed";
  timestamp: string;
}

function TransactionItem({ fromChain, toChain, amount, status, timestamp }: TransactionItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-800/70 rounded-xl p-5 border border-green-500/40 shadow-lg hover:border-green-500/60 hover:shadow-green-500/30 transition-all duration-300"
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-200">{amount}</span>
          {status === "pending" && (
            <div className="flex items-center text-yellow-400">
              <Clock className="h-4 w-4 mr-1" />
              <span className="text-xs font-medium">Đang xử lý</span>
            </div>
          )}
          {status === "completed" && (
            <div className="flex items-center text-green-400">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              <span className="text-xs font-medium">Hoàn thành</span>
            </div>
          )}
          {status === "failed" && (
            <div className="flex items-center text-red-400">
              <Info className="h-4 w-4 mr-1" />
              <span className="text-xs font-medium">Thất bại</span>
            </div>
          )}
        </div>
        <span className="text-xs text-gray-400 font-medium">{timestamp}</span>
      </div>

      <div className="flex items-center gap-2 text-lg text-gray-200 font-medium">
        <span>{fromChain}</span>
        <ArrowDown className="h-4 w-4 rotate-[-90deg] text-green-400" />
        <span>{toChain}</span>
      </div>

      <div className="mt-3 text-xs">
        <Button variant="link" className="h-auto p-0 text-green-400 hover:text-green-300">
          Xem chi tiết
        </Button>
      </div>
    </motion.div>
  );
}