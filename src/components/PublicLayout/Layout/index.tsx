"use client";
import { Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Wallet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import Image from "next/image";
import LoadingScreen from "@/components/LoadingScreen";
import CanvasScene from "@/components/webgl/Canvas/scene";
import { usePathname } from "next/navigation";

interface LayoutProps {
  children: React.ReactNode;
}

interface IWalletOptionProps {
  name: string;
  icon: string;
  onClick: () => void;
}

export default function AppLayout({ children }: LayoutProps) {
   const pathname = usePathname();
  const [cursorPosition, setCursorPosition] = useState({ x: -100, y: -100 });
  const [isPointerDown, setIsPointerDown] = useState(false);
  const [isWalletDialogOpen, setIsWalletDialogOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };
    const handlePointerDown = () => setIsPointerDown(true);
    const handlePointerUp = () => setIsPointerDown(false);

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);


  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center">
      {/* Custom cursor effect */}
      <motion.div
        className={`magic-cursor ${isPointerDown ? "active" : ""}`}
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          x: cursorPosition.x,
          y: cursorPosition.y,
        }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      />

      {/* Header with floating effect */}
      <motion.header
        className="fixed top-0 w-full z-20 px-6 py-4"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
      >
        <motion.div className="space-x-6 flex justify-between items-center">
          <motion.div className="flex flex-row justify-between items-center space-x-4">
            {/* Logo / Brand */}
            <Link href={"/"} className="flex items-center gap-2.5">
              <Image className="size-12" src={"/images/logo.svg"} width={48} height={48} alt="" />
              <h1 className="text-xl font-bold gradient-text">B3 Bridge</h1>
            </Link>

            <motion.nav
              className="hidden md:flex items-center justify-center gap-6 mx-auto bg-background/30 backdrop-blur-md p-2 px-6 rounded-full border border-green-500/20 shadow-lg"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Link
                href="/swap"
                className={`text-sm font-medium hover:text-green-400 transition-colors ${
                  isActive("/swap") ? "text-green-500" : ""
                }`}
              >
                Swap
              </Link>
              <Link
                href="/explore"
                className={`text-sm font-medium hover:text-green-400 transition-colors ${
                  isActive("/explore") ? "text-green-500" : ""
                }`}
              >
                Explore
              </Link>
              <Link
                href="/pool"
                className={`text-sm font-medium hover:text-green-400 transition-colors ${
                  isActive("/pool") ? "text-green-500" : ""
                }`}
              >
                Pool
              </Link>
              <Link
                href="/docs"
                className={`text-sm font-medium hover:text-green-400 transition-colors ${
                  isActive("/docs") ? "text-green-500" : ""
                }`}
              >
                Docs
              </Link>
              <Link
                href="/about"
                className={`text-sm font-medium hover:text-green-400 transition-colors ${
                  isActive("/about") ? "text-green-500" : ""
                }`}
              >
                About us
              </Link>
            </motion.nav>
          </motion.div>

          {/* Theme toggle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => setIsWalletDialogOpen(true)}
              size="lg"
              className="rounded-full border border-green-400 ring-offset-2 bg-gradient-to-r from-green-500 to-emerald-700 hover:from-green-600 hover:to-emerald-800"
            >
              Connect Wallet <Wallet className="ml-2 h-4 w-4" />
            </Button>
            <Dialog
              open={isWalletDialogOpen}
              onOpenChange={setIsWalletDialogOpen}
            >
              <DialogContent className="sm:max-w-md bg-background/80 backdrop-blur-md border border-green-500/20">
                <DialogHeader>
                  <div className="flex justify-between items-center">
                    <DialogTitle className="text-xl font-bold">
                      Connect Wallet
                    </DialogTitle>
                    <DialogClose className="rounded-full hover:bg-green-500/10 p-1">
                      <X className="h-4 w-4" />
                    </DialogClose>
                  </div>
                  <DialogDescription>
                    Select a wallet to connect to B3 Bridge
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 py-4">
                  <WalletOption
                    name="MetaMask"
                    icon={"/images/metamask.png"}
                    onClick={() => {
                      console.log("Connecting to MetaMask");
                      setIsWalletDialogOpen(false);
                    }}
                  />
                  <WalletOption
                    name="WalletConnect"
                    icon={"/images/walletconnect.png"}
                    onClick={() => {
                      console.log("Connecting to WalletConnect");
                      setIsWalletDialogOpen(false);
                    }}
                  />
                  <WalletOption
                    name="Coinbase"
                    icon={"/images/coinbase.png"}
                    onClick={() => {
                      console.log("Connecting to Coinbase");
                      setIsWalletDialogOpen(false);
                    }}
                  />
                  <WalletOption
                    name="Trust Wallet"
                    icon={"/images/trustwallet.png"}
                    onClick={() => {
                      console.log("Connecting to Trust Wallet");
                      setIsWalletDialogOpen(false);
                    }}
                  />
                </div>

                <div className="text-center text-xs text-muted-foreground mt-2">
                  <p>By connecting your wallet, you agree to our</p>
                  <a
                    href="#"
                    className="text-green-400 hover:text-green-500 transition-colors mr-1"
                  >
                    Terms of Service
                  </a>
                  and
                  <a
                    href="#"
                    className="text-green-400 hover:text-green-500 transition-colors ml-1"
                  >
                    Privacy Policy
                  </a>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>
        </motion.div>
      </motion.header>

      {/* Main content */}
      <main className="w-full h-full flex flex-col items-center justify-center relative z-10">
        <Suspense fallback={<LoadingScreen />}>
          <CanvasScene />
        </Suspense>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative z-10 w-full flex flex-col justify-evenly items-center scrollbar-hide h-screen"
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-4 w-full flex flex-col space-y-1 justify-center items-center z-10 text-center text-xs text-muted-foreground">
        <p>© 2025 B3 Bridge. Powered by </p>
        <div className="flex flex-row space-x-2 justify-center items-center">
          <Image className="size-3.5" src={"/images/bamboo.png"} width={14} height={14} alt="" />
          <p>Bamboo Software Team.</p>
        </div>
      </footer>
    </div>
  );
}

function WalletOption({ name, icon, onClick }: IWalletOptionProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl border border-green-500/20 hover:border-green-500/40 bg-background/50 hover:bg-background/70 transition-all"
      onClick={onClick}
    >
      <Image src={icon} alt={name} width={48} height={48} className="w-12 h-12 object-contain" />
      <span className="font-medium">{name}</span>
    </motion.button>
  );
}