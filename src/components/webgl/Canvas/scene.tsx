"use client";
import {useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  AdaptiveDpr,
  PerspectiveCamera,
} from '@react-three/drei';
import dynamic from 'next/dynamic';
const SceneContent = dynamic(() => import('./scene-content'), { ssr: false });
export default function CanvasScene() {
  const [fov, setFov] = useState(80);
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      setFov(prev => {
        let next = prev + (e.deltaY > 0 ? 2 : -2);
        if (next < 20) next = 20;
        if (next > 80) next = 80;
        return next;
      });
    };
    window.addEventListener('wheel', handleWheel);
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <div className="canvas-container">
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-purple-900/50 to-blue-950/30 pointer-events-none" />
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={fov} />
        <AdaptiveDpr pixelated />
        <color attach="background" args={['#09090b']} />
        <SceneContent />
      </Canvas>
    </div>
  );
}
