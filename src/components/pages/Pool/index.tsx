/* eslint-disable @next/next/no-img-element */
"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, ArrowUpDown, ExternalLink, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


import img from "next/image";

// Token data with icons
const tokens = {
  eth: { name: "ETH", icon: "/images/ethereum.png" },
  sol: { name: "SOL", icon: "/images/solana.png" },
  bnb: { name: "BNB", icon: "/images/bnb.png" },
  usdc: { name: "USDC", icon: "/images/usdc.png" },
  usdt: { name: "USDT", icon: "/images/usdt.png" },
};

interface IPool {

        id: number;
        token1: keyof typeof tokens;
        token2: keyof typeof tokens;
        name: string;
        chains: string[];
        apy: number;
        tvl: number;
        volume24h: number;
        fee: number;
        featured: boolean;
    
}

export default function PoolPage() {
  const [searchTerm, setSearchTerm] = useState("");
  
  return (
    <div className="w-full h-screen m-28  max-w-5xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Liquidity Pools</h1>
            <p className="text-muted-foreground">Provide liquidity and earn rewards</p>
          </div>
          <Button className="rounded-lg bg-gradient-to-r from-green-500 to-emerald-700 hover:from-green-600 hover:to-emerald-800">
            <Plus className="mr-2 h-4 w-4" /> Create new pool
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by token or pool address"
            className="pl-10 bg-background/50 border-green-500/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Tabs defaultValue="my-pools" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-background/50 border border-green-500/20">
            <TabsTrigger value="my-pools">My Pools</TabsTrigger>
            <TabsTrigger value="all-pools">All Pools</TabsTrigger>
            <TabsTrigger value="incentivized">Incentivized</TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-pools" className="pt-4 h-96 scrollbar-hide overflow-auto">
            {allPools.length > 0 ? (
              <div className="space-y-4">
                {allPools.map((pool) => (
                  <PoolCard key={pool.id} pool={pool as IPool} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-background/30 backdrop-blur-md rounded-xl border border-green-500/20">
                <p className="text-muted-foreground">You haven&apos;t joined any pools yet</p>
                <Button variant="link" className="mt-2 text-green-500">
                  Learn how to provide liquidity
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="all-pools" className="pt-4">
            <div className="space-y-4">
              {allPools.map((pool) => (
                <PoolCard key={pool.id} pool={pool as IPool} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="incentivized" className="pt-4">
            <div className="space-y-4">
              {incentivizedPools.map((pool) => (
                <PoolCard key={pool.id} pool={pool as IPool} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

function PoolCard({ pool }:{pool: IPool} ) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-background/30 backdrop-blur-md rounded-xl border border-green-500/20 shadow-sm hover:shadow-md hover:border-green-500/30 transition-all p-4"
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full border border-background z-10 overflow-hidden">
                <img 
                width={32}
                height={32}
                src={tokens[pool.token1].icon} 
                alt={tokens[pool.token1].name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="w-8 h-8 rounded-full border border-background overflow-hidden">
                <img 
                width={32}
                height={32}
                src={tokens[pool.token2].icon} 
                alt={tokens[pool.token2].name} 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div>
            <h3 className="font-medium">{tokens[pool.token1].name} / {tokens[pool.token2].name}</h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>{pool.chains[0]}</span>
              <ArrowUpDown className="h-3 w-3" />
              <span>{pool.chains[1]}</span>
            </div>
          </div>
        </div>
        <Badge variant={pool.featured ? "default" : "outline"} className={pool.featured ? "bg-green-500/20 text-green-500 hover:bg-green-500/30" : ""}>
          {pool.apy}% APY
        </Badge>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
        <div>
          <div className="flex items-center gap-1">
            <p className="text-muted-foreground">TVL</p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Total Value Locked in this pool</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="font-medium">${pool.tvl.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Volume (24h)</p>
          <p className="font-medium">${pool.volume24h.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Fee</p>
          <p className="font-medium">{pool.fee}%</p>
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
        <Button variant="link" size="sm" className="text-green-500 p-0">
          Details <ExternalLink className="ml-1 h-3 w-3" />
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="border-green-500/20 hover:border-green-500/40">
            Withdraw
          </Button>
          <Button size="sm" className="bg-gradient-to-r from-green-500 to-emerald-700 hover:from-green-600 hover:to-emerald-800">
            Provide
          </Button>
        </div>
      </div>
    </motion.div>
  );
}


const allPools = [
  {
    id: 1,
    token1: "eth",
    token2: "usdt",
    name: "ETH / USDT",
    chains: ["Ethereum", "Polygon"],
    apy: 4.5,
    tvl: 1250000,
    volume24h: 325000,
    fee: 0.3,
    featured: true
  },
  {
    id: 2,
    token1: "bnb",
    token2: "usdt",
    name: "BNB / USDT",
    chains: ["BSC", "Ethereum"],
    apy: 3.8,
    tvl: 980000,
    volume24h: 215000,
    fee: 0.25,
    featured: false
  },
  {
    id: 3,
    token1: "sol",
    token2: "usdc",
    name: "SOL / USDC",
    chains: ["Solana", "Ethereum"],
    apy: 5.2,
    tvl: 750000,
    volume24h: 180000,
    fee: 0.3,
    featured: true
  },
  {
    id: 4,
    token1: "eth",
    token2: "usdc",
    name: "ETH / USDC",
    chains: ["Ethereum", "Arbitrum"],
    apy: 4.1,
    tvl: 620000,
    volume24h: 145000,
    fee: 0.25,
    featured: false
  }
];

const incentivizedPools = [
  {
    id: 1,
    token1: "eth",
    token2: "usdt",
    name: "ETH / USDT",
    chains: ["Ethereum", "Polygon"],
    apy: 4.5,
    tvl: 1250000,
    volume24h: 325000,
    fee: 0.3,
    featured: true
  },
  {
    id: 3,
    token1: "sol",
    token2: "usdc",
    name: "SOL / USDC",
    chains: ["Solana", "Ethereum"],
    apy: 5.2,
    tvl: 750000,
    volume24h: 180000,
    fee: 0.3,
    featured: true
  }
];