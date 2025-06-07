/* eslint-disable @next/next/no-img-element */
"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import img from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { useEffect, useState } from "react";
import { useDisconnect, useEnsAvatar, useEnsName } from "wagmi";
import { WalletConnectModal } from "@/components/Modal/ConnectWalletModal";


type Props = {};

const Header = (props: Props) => {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

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
            <motion.nav
              className="hidden md:flex items-center justify-center gap-8 bg-gray-800/50 backdrop-blur-md p-3 px-8 rounded-full border border-green-500/30 shadow-xl"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {[
                { path: "/swap", label: "Swap" },
                { path: "/bridge", label: "Bridge" },
                { path: "/pool", label: "Pool" },
                { path: "/docs", label: "Docs" },
                { path: "/about", label: "About us" },
              ].map(({ path, label }) => (
                <Link
                  key={path}
                  href={path}
                  className={`text-lg font-semibold   transition-all duration-300 ease-in-out ${
                    isActive(path)
                      ? "text-green-400 border-green-400"
                      : "text-gray-300 hover:text-green-400 hover:scale-105"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </motion.nav>
          </motion.div>
        </motion.div>
      </motion.header>
      <WalletConnectModal />
    </div>
  );
};

export default Header;