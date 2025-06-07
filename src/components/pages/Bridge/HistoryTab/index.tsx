import { TabsContent } from '@/components/ui/tabs'
import React from 'react'
import { motion } from "framer-motion";
import { Button } from '@/components/ui/button';
import { ArrowDown, CheckCircle2, Clock, Info } from 'lucide-react';
type Props = {}

const HistoryTab = (props: Props) => {
  return (
    <div><TabsContent value="history" className="pt-6 space-y-4">
            <div className="text-lg text-gray-400 text-center mb-4">Recent transaction history</div>

            <TransactionItem fromChain="Ethereum" toChain="Polygon" amount="0.5 ETH" status="completed" timestamp="2 hours ago" />
            <TransactionItem fromChain="Binance Smart Chain" toChain="Arbitrum" amount="200 USDT" status="pending" timestamp="5 hours ago" />
            <TransactionItem fromChain="Polygon" toChain="Optimism" amount="100 USDC" status="completed" timestamp="1 day ago" />

            <div className="text-center mt-4">
              <Button variant="outline" size="sm"  className="px-5 py-2.5 text-lg font-semibold bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full shadow-lg hover:shadow-green-500/50 transition-all duration-300 border-none">
                View all transactions
              </Button>
            </div>
          </TabsContent></div>
  )
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
              <span className="text-xs font-medium">Processing</span>
            </div>
          )}
          {status === "completed" && (
            <div className="flex items-center text-green-400">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              <span className="text-xs font-medium">Complete</span>
            </div>
          )}
          {status === "failed" && (
            <div className="flex items-center text-red-400">
              <Info className="h-4 w-4 mr-1" />
              <span className="text-xs font-medium">Failure</span>
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
          See details
        </Button>
      </div>
    </motion.div>
  );
}

export default HistoryTab