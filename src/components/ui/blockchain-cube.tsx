import React from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { type RootState } from '@/app/stores/store';

interface BlockchainCubeProps {
  className?: string;
  size?: number;
  color?: string;
  delay?: number;
  duration?: number;
}

const BlockchainCube: React.FC<BlockchainCubeProps> = ({
  className = '',
  size = 60,
  color,
  delay = 0,
  duration = 20,
}) => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDarkMode = theme === 'dark';
  
  // Set default color based on theme if not provided
  const cubeColor = color || (isDarkMode 
    ? 'rgba(var(--primary-rgb), 0.8)' 
    : 'rgba(var(--primary-rgb), 0.7)');

  // Animation variants for the cube
  const cubeVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 1,
        delay,
      },
    },
  };

  // Calculate dimensions
  const cubeSize = size;
  const faceSize = cubeSize;
  const translateZ = cubeSize / 2;

  // Text color based on theme
  const textColor = isDarkMode ? 'text-background/90' : 'text-background/80';
  // Border color based on theme
  const borderClass = isDarkMode ? 'border-primary/30' : 'border-primary/20';

  return (
    <motion.div
      className={`relative ${className}`}
      style={{
        width: cubeSize,
        height: cubeSize,
        perspective: '1000px',
      }}
      variants={cubeVariants}
      initial="initial"
      animate="animate"
    >
      <motion.div
        className="w-full h-full relative transform-style-3d"
        style={{
          width: cubeSize,
          height: cubeSize,
          transformStyle: 'preserve-3d',
        }}
        variants={{
          animate: {
            rotateX: [0, 360],
            rotateY: [0, 360],
            transition: {
              duration,
              ease: 'linear',
              repeat: Infinity,
              repeatType: 'loop' as const,
            },
          },
        }}
        animate="animate"
      >
        {/* Front face */}
        <div
          className={`absolute backdrop-blur-sm border ${borderClass}`}
          style={{
            width: faceSize,
            height: faceSize,
            background: cubeColor,
            transform: `translateZ(${translateZ}px)`,
          }}
        >
          <div className={`flex items-center justify-center h-full ${textColor} text-xs font-mono`}>
            BLOCK #1337
          </div>
        </div>

        {/* Back face */}
        <div
          className={`absolute backdrop-blur-sm border ${borderClass}`}
          style={{
            width: faceSize,
            height: faceSize,
            background: cubeColor,
            transform: `rotateY(180deg) translateZ(${translateZ}px)`,
          }}
        >
          <div className={`flex items-center justify-center h-full ${textColor} text-xs font-mono`}>
            HASH: 0x4F3A
          </div>
        </div>

        {/* Left face */}
        <div
          className={`absolute backdrop-blur-sm border ${borderClass}`}
          style={{
            width: faceSize,
            height: faceSize,
            background: cubeColor,
            transform: `rotateY(-90deg) translateZ(${translateZ}px)`,
          }}
        >
          <div className={`flex items-center justify-center h-full ${textColor} text-xs font-mono`}>
            TX: 42
          </div>
        </div>

        {/* Right face */}
        <div
          className={`absolute backdrop-blur-sm border ${borderClass}`}
          style={{
            width: faceSize,
            height: faceSize,
            background: cubeColor,
            transform: `rotateY(90deg) translateZ(${translateZ}px)`,
          }}
        >
          <div className={`flex items-center justify-center h-full ${textColor} text-xs font-mono`}>
            SIZE: 1MB
          </div>
        </div>

        {/* Top face */}
        <div
          className={`absolute backdrop-blur-sm border ${borderClass}`}
          style={{
            width: faceSize,
            height: faceSize,
            background: cubeColor,
            transform: `rotateX(90deg) translateZ(${translateZ}px)`,
          }}
        >
          <div className={`flex items-center justify-center h-full ${textColor} text-xs font-mono`}>
            NONCE: 21
          </div>
        </div>

        {/* Bottom face */}
        <div
          className={`absolute backdrop-blur-sm border ${borderClass}`}
          style={{
            width: faceSize,
            height: faceSize,
            background: cubeColor,
            transform: `rotateX(-90deg) translateZ(${translateZ}px)`,
          }}
        >
          <div className={`flex items-center justify-center h-full ${textColor} text-xs font-mono`}>
            TIME: NOW
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BlockchainCube;