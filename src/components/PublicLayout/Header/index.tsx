/* eslint-disable @next/next/no-img-element */
"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { WalletConnectModal } from "@/components/Modal/ConnectWalletModal";
import { useModalStore } from "@/store/useModalStore";
import { useWallet } from "@/hooks/useWallet";


const Header = () => {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;
  const { openWalletModal } = useModalStore();
  const { wallet,isConnected } = useWallet();
    const walletInfo = wallet ? wallet : undefined;
  return (
    <div className="w-full">
      <motion.header
        className="fixed top-0 w-full z-20 px-6 py-4 bg-gradient-to-r from-gray-900/80 to-black/80 backdrop-blur-lg shadow-lg"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
      >
        <motion.div className="flex items-center">
          <motion.div className="flex flex-row justify-between items-center w-full">
            <Link href={"/"} className="flex items-center gap-2.5">
              <img className="size-12" src={"/images/logo.svg"} width={48} height={48} alt="B3 Bridge Logo" />
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                B3 Bridge
              </h1>
            </Link>
             <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={openWalletModal}
              className="px-5 py-2.5 text-lg font-semibold bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full shadow-lg hover:shadow-green-500/50 transition-all duration-300"
            >
              {isConnected ? `${walletInfo?.address?.slice(0, 6)}...${walletInfo?.address?.slice(-4)}` : "Connect Wallet"}
            </Button>
          </motion.div>

          </motion.div>
        </motion.div>
      </motion.header>
      <WalletConnectModal />
    </div>
  );
};

export default Header;