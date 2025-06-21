import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { type RootState } from '@/app/stores/store';

type Particle = {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
};

interface AnimatedBackgroundProps {
  className?: string;
  particleCount?: number;
}

export function AnimatedBackground({
  className = '',
  particleCount = 50,
}: AnimatedBackgroundProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDarkMode = theme === 'dark';

  // Colors for the particles - adjusted for dark/light mode
  const getLightModeColors = () => [
    '#1a1a2e', // Deep blue
    '#4a1a6e', // Deep purple
    '#00d4ff', // Neon cyan
    '#ff2e63', // Neon magenta
    '#7928ca', // Purple
    '#0070f3', // Blue
  ];

  const getDarkModeColors = () => [
    '#2a2a4e', // Lighter deep blue
    '#5a2a8e', // Lighter deep purple
    '#20e4ff', // Brighter neon cyan
    '#ff4e83', // Brighter neon magenta
    '#8938da', // Brighter purple
    '#2080ff', // Brighter blue
  ];

  useEffect(() => {
    // Get colors based on theme
    const colors = isDarkMode ? getDarkModeColors() : getLightModeColors();
    
    // Create particles on component mount or theme change
    const newParticles = Array.from({ length: particleCount }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: Math.random() * (isDarkMode ? 0.6 : 0.5) + (isDarkMode ? 0.15 : 0.1),
    }));

    setParticles(newParticles);
  }, [isDarkMode, particleCount, theme]);

  return (
    <div
      className={`absolute inset-0 overflow-hidden ${className}`}
      style={{ zIndex: -1 }}
    >
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            opacity: particle.opacity,
          }}
          animate={{
            x: [
              0,
              Math.random() * 20 - 10,
              Math.random() * 20 - 10,
              0,
            ],
            y: [
              0,
              Math.random() * 20 - 10,
              Math.random() * 20 - 10,
              0,
            ],
            opacity: [particle.opacity, particle.opacity * 1.5, particle.opacity],
          }}
          transition={{
            duration: Math.random() * 10 + 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
      
      {/* Gradient overlay - adjusted for dark/light mode */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background opacity-70" 
        style={{ 
          backgroundImage: isDarkMode
            ? 'radial-gradient(circle at 50% 50%, rgba(26, 26, 46, 0) 0%, rgba(26, 26, 46, 0.8) 70%, rgba(26, 26, 46, 1) 100%)'
            : 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0) 0%, rgba(240, 240, 250, 0.7) 70%, rgba(240, 240, 250, 1) 100%)'
        }}
      />
    </div>
  );
}