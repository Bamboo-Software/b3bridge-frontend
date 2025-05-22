"use client";
import { useRef } from 'react';
// import { useFrame } from '@react-three/fiber';
import { Icosahedron } from '@react-three/drei';
// import { Vector3 } from 'three';

interface CrystalProps {
  position: [number, number, number];
  scale: number;
  color: string;
  wireframe?: boolean;
}

export function Crystal({ position, scale, color, wireframe = false }: CrystalProps) {
  const crystalRef = useRef(null);

  return (
    <group position={position}>
      <Icosahedron
        ref={crystalRef}
        args={[1, 1]}
        scale={scale}
      >
        <meshPhysicalMaterial
          color={color}
          wireframe={wireframe}
          roughness={0.1}
          metalness={0.8}
          transmission={wireframe ? 0 : 0.6}
          reflectivity={1}
          clearcoat={0.8}
          clearcoatRoughness={0.2}
          thickness={0.5}
          transparent
          opacity={0.9}
        />
      </Icosahedron>
    </group>
  );
}