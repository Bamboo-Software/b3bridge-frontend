import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '@/app/stores/store';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  opacity: number;
}

interface BlockchainParticlesProps {
  count?: number;
  className?: string;
}

const BlockchainParticles: React.FC<BlockchainParticlesProps> = ({ 
  count = 50,
  className = ""
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const animationFrameId = useRef<number>(0);
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDarkMode = theme === 'dark';

  // Colors for particles - adjusted for dark/light mode
  const getColors = () => [
    `rgba(var(--primary-rgb), ${isDarkMode ? '0.9' : '0.8'})`,
    `rgba(var(--cyan-rgb), ${isDarkMode ? '0.9' : '0.8'})`,
    `rgba(var(--purple-rgb), ${isDarkMode ? '0.9' : '0.8'})`,
    `rgba(59, 130, 246, ${isDarkMode ? '0.9' : '0.8'})`, // blue
    `rgba(16, 185, 129, ${isDarkMode ? '0.9' : '0.8'})`, // green
    `rgba(245, 158, 11, ${isDarkMode ? '0.9' : '0.8'})`, // yellow
  ];

  // Initialize particles
  const initParticles = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const colors = getColors();
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * (isDarkMode ? 0.6 : 0.5) + (isDarkMode ? 0.3 : 0.2)
      });
    }
    particles.current = newParticles;
  };

  // Draw particles and connections
  const drawParticles = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    particles.current.forEach((particle, index) => {
      // Update position
      particle.x += particle.speedX;
      particle.y += particle.speedY;

      // Bounce off edges
      if (particle.x < 0 || particle.x > canvas.width) {
        particle.speedX *= -1;
      }
      if (particle.y < 0 || particle.y > canvas.height) {
        particle.speedY *= -1;
      }

      // Draw particle
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.globalAlpha = particle.opacity;
      ctx.fill();
      ctx.globalAlpha = 1;

      // Draw connections to nearby particles
      for (let j = index + 1; j < particles.current.length; j++) {
        const otherParticle = particles.current[j];
        const dx = particle.x - otherParticle.x;
        const dy = particle.y - otherParticle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 100) {
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(otherParticle.x, otherParticle.y);
          ctx.strokeStyle = particle.color;
          ctx.globalAlpha = (isDarkMode ? 0.25 : 0.2) * (1 - distance / 100);
          ctx.lineWidth = 0.5;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    });

    // Continue animation
    animationFrameId.current = requestAnimationFrame(drawParticles);
  };

  // Handle resize
  const handleResize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    initParticles();
  };

  // Update particles when theme changes
  useEffect(() => {
    initParticles();
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Initialize particles
    initParticles();

    // Start animation
    drawParticles();

    // Handle window resize
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
      />
    </div>
  );
};

export default BlockchainParticles;