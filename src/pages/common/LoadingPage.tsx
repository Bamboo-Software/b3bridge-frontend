import { LoadingSpinner } from '@/components/spinner'
import { motion } from 'framer-motion'
import BlockchainParticles from '@/components/ui/blockchain-particles'
import BlockchainCube from '@/components/ui/blockchain-cube'

const LoadingPage = () => {
  return (
    <div className='min-h-screen bg-background relative overflow-hidden flex flex-col justify-center items-center'>
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
          size={60} 
          color="rgba(var(--primary-rgb), 0.2)" 
          duration={25} 
          delay={0.5} 
        />
      </div>
      
      <div className="absolute bottom-1/4 right-1/5">
        <BlockchainCube 
          size={40} 
          color="rgba(var(--cyan-rgb), 0.2)" 
          duration={20} 
          delay={1.2} 
        />
      </div>

      {/* Loading content */}
      <motion.div 
        className="relative z-10 backdrop-blur-sm p-8 rounded-xl border border-primary/20 bg-card/30 flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="relative mb-4"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 0, 0]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        >
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl"></div>
          <div className="relative">
            <LoadingSpinner className="w-16 h-16 text-primary" />
          </div>
        </motion.div>
        
        <motion.div 
          className="text-xl font-medium text-foreground flex items-center gap-2"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {/* <span className="bg-gradient-to-r from-primary via-cyan-400 to-purple-500 bg-clip-text text-transparent">Loading</span> */}
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.2 }}
          >.</motion.span>
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.4 }}
          >.</motion.span>
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.6 }}
          >.</motion.span>
        </motion.div>
        
        {/* <motion.p 
          className="text-foreground/60 text-sm mt-4 max-w-xs text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          Processing blockchain transaction, please wait a moment
        </motion.p> */}
      </motion.div>

      {/* Digital data flow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 3 }).map((_, index) => (
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
  )
}

export default LoadingPage