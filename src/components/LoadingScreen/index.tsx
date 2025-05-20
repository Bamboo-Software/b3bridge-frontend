"use client";
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-950 via-purple-900 to-blue-950 flex flex-col items-center justify-center gap-6 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Loader2 className="h-16 w-16 text-purple-400 animate-spin" />
      </motion.div>
      
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-2xl font-bold text-white"
      >
        Building your magical experience...
      </motion.h2>
      
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: "60%" }}
        transition={{ delay: 0.5, duration: 2.5 }}
        className="w-full max-w-md h-1 bg-gradient-to-r from-purple-600 via-blue-500 to-emerald-500 rounded-full"
      />
    </div>
  );
}