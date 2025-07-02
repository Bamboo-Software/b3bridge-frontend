import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from "@/components/ui/skeleton";

interface ImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  animationVariant?: 'fade' | 'zoom' | 'slide' | 'bounce' | 'elastic' | 'none';
  onClick?: () => void;
  loading?: 'eager' | 'lazy';
  fallbackSrc?: string;
  style?: React.CSSProperties;
}

const Image = ({
  src,
  alt,
  className = '',
  width,
  height,
  objectFit = 'cover',
  onClick,
  loading = 'eager',
  fallbackSrc = '/placeholder.png',
  style
}: ImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const img = new window.Image();
    img.src = src;
    if (img.complete) {
      setIsLoaded(true);
    } else {
      img.onload = () => setIsLoaded(true);
      img.onerror = () => setHasError(true);
    }
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

 
  return (
    <motion.div
      className={`overflow-hidden ${className}`}
      style={{ width, height, position: 'relative', ...style }}
      initial="hidden"
      animate={isLoaded ? 'visible' : 'hidden'}
      
      >
      {(!isLoaded && !hasError) && (
        <Skeleton
          className="absolute inset-0 w-full h-full animate-pulse bg-gradient-to-r from-gray-200 to-gray-300"
        />
      )}
      <img
        src={hasError ? fallbackSrc : src}
        alt={alt}
        className={`w-full h-full transition-opacity duration-300 ${(isLoaded || hasError && fallbackSrc)  ? 'opacity-100' : 'opacity-0'}`}
        style={{ objectFit }}
        loading={loading}
        onClick={onClick}
      />
    </motion.div>
  );
};

export default Image;