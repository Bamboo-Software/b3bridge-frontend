"use client";
import { Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";

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