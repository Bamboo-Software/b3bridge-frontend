"use client";
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/store/store';

interface ParticlesProps {
  count: number;
}

export function Particles({ count }: ParticlesProps) {
  const particlesRef = useRef(null);
  const mousePosition = useStore(state => state.mousePosition);
  
  // Create particles
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const time = Math.random() * 100;
      const factor = Math.random() * 10 + 0.5;
      const speed = Math.random() * 0.01 + 0.002;
      const x = Math.random() * 40 - 20;
      const y = Math.random() * 40 - 20;
      const z = Math.random() * 40 - 20;
      
      temp.push({
        time,
        factor,
        speed,
        x,
        y,
        z,
        mx: 0,
        my: 0,
        mz: 0,
      });
    }
    return temp;
  }, [count]);
  
  // Create positions and colors
  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = particles[i].x;
      positions[i3 + 1] = particles[i].y;
      positions[i3 + 2] = particles[i].z;
      
      // Gradients of purples, blues and teals
      const color = new THREE.Color();
      const hue = i % 3 === 0 
        ? 0.75 // Purple
        : i % 3 === 1 
          ? 0.6 // Blue
          : 0.45; // Teal
          
      const saturation = 0.7 + Math.random() * 0.3;
      const lightness = 0.5 + Math.random() * 0.2;
      
      color.setHSL(hue, saturation, lightness);
      
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }
    
    return [positions, colors];
  }, [count, particles]);
  
  // Animation
  useFrame(() => {
    if (!particlesRef.current || !(particlesRef.current as THREE.Points).geometry || !(particlesRef.current as THREE.Points).geometry.attributes || !(particlesRef.current as THREE.Points).geometry.attributes.position) return;
    
    const positionArray = (particlesRef.current as THREE.Points).geometry.attributes.position.array;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Time dependent animation
      particles[i].time += particles[i].speed;
      
      // Mouse influence (attraction to mouse position)
      particles[i].mx += (mousePosition.x * 5 - particles[i].mx) * 0.01;
      particles[i].my += (mousePosition.y * 5 - particles[i].my) * 0.01;
      
      // Update positions with mouse influence and gentle swirling motion
      const x = 
        particles[i].x + 
        Math.sin(particles[i].time * particles[i].factor) * 0.05 + 
        particles[i].mx * 0.02;
      
      const y = 
        particles[i].y + 
        Math.cos(particles[i].time * particles[i].factor) * 0.05 + 
        particles[i].my * 0.02;
      
      const z = 
        particles[i].z + 
        Math.cos(particles[i].time * particles[i].factor) * 0.05;
      
      positionArray[i3] = x;
      positionArray[i3 + 1] = y;
      positionArray[i3 + 2] = z;
    }
    
    ((particlesRef.current as THREE.Points).geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  });
  
  return (
    <points>
      <bufferGeometry ref={particlesRef}>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}