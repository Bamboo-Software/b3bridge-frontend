import { useNavigate } from 'react-router-dom';
import { HomeIcon, AlertTriangle } from 'lucide-react';
import { routesPaths } from '@/types/constants/routes';
import { motion } from 'framer-motion';
import { GlowButton } from '@/components/ui/glow-button';
import BlockchainParticles from '@/components/ui/blockchain-particles';
import BlockchainCube from '@/components/ui/blockchain-cube';

const { ROOT } = routesPaths;

const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center px-4">
      {/* Blockchain particles background */}
      <BlockchainParticles count={60} />
      
      {/* Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* 3D Blockchain Cube */}
      <div className="absolute top-1/4 left-1/5">
        <BlockchainCube 
          size={80} 
          color="rgba(var(--primary-rgb), 0.2)" 
          duration={25} 
          delay={0.5} 
        />
      </div>
      
      <div className="absolute bottom-1/4 right-1/5">
        <BlockchainCube 
          size={60} 
          color="rgba(var(--cyan-rgb), 0.2)" 
          duration={20} 
          delay={1.2} 
        />
      </div>
      
      <motion.div 
        className="relative z-10 text-center backdrop-blur-sm p-8 rounded-xl border border-primary/20 bg-card/30 max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-6 flex justify-center"
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-destructive/20 blur-xl"></div>
            <div className="relative bg-card/50 backdrop-blur-sm border border-destructive/30 rounded-full p-5">
              <AlertTriangle className="w-16 h-16 text-destructive" />
            </div>
          </div>
        </motion.div>

        <motion.h1 
          className="text-8xl font-bold mb-4 bg-gradient-to-r from-primary via-cyan-400 to-purple-500 bg-clip-text text-transparent glow-text"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          404
        </motion.h1>
        
        <motion.h2 
          className="text-3xl font-semibold text-foreground mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Page Not Found
        </motion.h2>
        
        <motion.p 
          className="text-foreground/70 text-lg mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          The page you are looking for does not exist or has been removed. An error may have occurred during blockchain transaction processing.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <GlowButton
            onClick={() => navigate(ROOT)}
            glowColor="rgba(var(--primary-rgb), 0.5)"
            className="inline-flex items-center px-6 py-3"
            size="lg"
          >
            <HomeIcon className="w-5 h-5 mr-2" />
            <span>Return to Home</span>
          </GlowButton>
        </motion.div>
      </motion.div>

      {/* Digital data flow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 5 }).map((_, index) => (
          <motion.div 
            key={index}
            className="absolute text-xs font-mono opacity-20"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
            animate={{
              opacity: [0.2, 0.5, 0.2],
              y: [0, Math.random() * 100 - 50, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              delay: index * 2,
            }}
          >
            <div className="text-primary">01001010</div>
            <div className="text-cyan-500">10110101</div>
            <div className="text-purple-500">11001001</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ErrorPage;