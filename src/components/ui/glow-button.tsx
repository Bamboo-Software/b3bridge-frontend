import React from 'react';
import { motion } from 'framer-motion';
import { Button, buttonVariants } from './button';
import { cn } from '@/lib/utils';
import { type VariantProps } from 'class-variance-authority';
import { useSelector } from 'react-redux';
import { type RootState } from '@/app/stores/store';

interface GlowButtonProps extends React.ComponentProps<typeof Button> {
  glowColor?: string;
  hoverScale?: number;
}

export function GlowButton({
  children,
  className,
  glowColor, // Remove default value to use theme-based default
  hoverScale = 1.03,
  ...props
}: GlowButtonProps & VariantProps<typeof buttonVariants>) {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDarkMode = theme === 'dark';
  
  // Default glow color based on theme if not provided
  const defaultGlowColor = isDarkMode 
    ? 'rgba(0, 212, 255, 0.6)' // Brighter cyan glow for dark mode
    : 'rgba(0, 212, 255, 0.5)'; // Default cyan glow for light mode
  
  const finalGlowColor = glowColor || defaultGlowColor;
  
  return (
    <motion.div
      className="relative inline-block"
      whileHover={{ scale: hoverScale }}
      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
    >
      <span 
        className="absolute inset-0 rounded-md blur-md"
        style={{ backgroundColor: finalGlowColor, opacity: isDarkMode ? 0.8 : 0.7 }}
      />
      <Button
        className={cn(
          'relative z-10 bg-gradient-to-r from-primary to-cyan-500 text-white border-0',
          isDarkMode ? 'shadow-lg shadow-primary/20' : '',
          className
        )}
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  );
}