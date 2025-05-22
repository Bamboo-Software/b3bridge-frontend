"use client";
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function Lights() {
  const ambientRef = useRef(null);
  const directionalRef = useRef(null);
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    
    if (ambientRef.current) {
      // Slowly pulse the ambient light intensity
      (ambientRef.current as THREE.AmbientLight).intensity = 0.4 + Math.sin(t * 0.2) * 0.1;
    }
    
    if (directionalRef.current) {
      // Move the directional light slowly in a circle
      (directionalRef.current as THREE.DirectionalLight).position.x = Math.sin(t * 0.1) * 5;
      (directionalRef.current as THREE.DirectionalLight).position.z = Math.cos(t * 0.1) * 5;
    }
  });
  
  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.4} />
      <directionalLight
        ref={directionalRef}
        position={[0, 5, 5]}
        intensity={0.6}
        color="#ffffff"
      />
      <hemisphereLight
        intensity={0.2}
        color="#8b5cf6"
        groundColor="#047857"
      />
    </>
  );
}