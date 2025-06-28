/* eslint-disable @next/next/no-img-element */
"use client";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Shield, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import img, { StaticImageData } from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface IFeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface IChainLogoProps {
  name: string;
  img: StaticImageData | string;
}

export default function HomePage() {

const router = useRouter();
 const chainsLogo = [
    { name: "Ethereum", img: "/images/ethereum.png" },
    { name: "Binance", img: "/images/bnb.png" },
    { name: "USDC", img: "/images/usdc.png" },
    { name: "USDT", img: "/images/usdt.png" },
    { name: "Solana", img: "/images/solana.png" },
  ];
  return (
    <div className="w-full flex flex-col items-center justify-center gap-8 mt-4">
      {/* Hero Section */}
      <motion.div
        className="text-center space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl md:text-5xl font-bold gradient-text">
          Connect Multiple Chains <br /> Simply and Securely
        </h1>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto">
          B3 Bridge helps you transfer tokens between different blockchains with low fees,
          fast speed, and high security.
        </p>

        <div className="flex flex-wrap gap-4 justify-center pt-4">
          <Button 
            onClick={() => router.push("/bridge")}
            size="lg" 
           className="px-5 py-2.5 text-lg font-bold bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full  shadow-lg hover:shadow-green-500/50 transition-all duration-300"
          >
            Get Started Bridge <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

      </motion.div>


      {/* Features */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6 w-2/3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, staggerChildren: 0.1 }}
      >
        <FeatureCard 
          icon={<Zap className="size-10 text-green-500" />}
          title="Lightning Fast"
          description="Complete transactions in just minutes with advanced bridge technology"
        />
        <FeatureCard 
          icon={<Shield className="size-10 text-green-500" />}
          title="Maximum Security"
          description="Multi-layer system protects your assets throughout the token transfer process"
        />
        <FeatureCard 
          icon={<Coins className="size-10 text-green-500" />}
          title="Low Fees"
          description="Optimize transaction costs with smart and efficient fee mechanisms"
        />
      </motion.div>

                            {/* Supported Chains */}
                            <motion.div 
        className="w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <h2 className="text-sm font-semibold text-center mb-4">Supported Tokens</h2>
        <div className="flex flex-wrap justify-center gap-8">
          {chainsLogo.map((chain) => (<ChainLogo key={chain.name} {...chain} />))}
        </div>
      </motion.div>
    </div>
  );
}

function FeatureCard({ icon, title, description } : IFeatureCardProps) {
  return (
    <motion.div 
      className="flex flex-col justify-center items-center bg-background/30 backdrop-blur-md p-8 rounded-xl border border-green-500/20 shadow-lg hover:shadow-green-500/10 hover:border-green-500/30 transition-all"
      whileHover={{ y: -5 }}
    >
      <div className="mb-3">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </motion.div>
  );
}

function ChainLogo({ name, img } : IChainLogoProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="size-10 rounded-full bg-background/50 border border-green-500/20 flex items-center justify-center">
        {/* Placeholder for chain logo */}
        <div className="size-6 rounded-full bg-transparent">
            <img src={img as string} alt="" width={24} height={24}/>
        </div>
      </div>
      <span className="text-xs text-white">{name}</span>
    </div>
  );
}

