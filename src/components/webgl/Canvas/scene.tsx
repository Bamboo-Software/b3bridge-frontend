"use client";
import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  AdaptiveDpr, 
  Float, 
  Stars, 
  OrbitControls, 
  PerspectiveCamera,
} from '@react-three/drei';
import { Crystal } from './crystal';
import { Particles } from './particles';
import { Lights } from './lights';
import { useStore } from '@/store/store';
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
        <SceneContent />
      </Canvas>
    </div>
  );
}

function SceneContent() {
  const { camera } = useThree();
  const orbitControlsRef = useRef(null);
  const mousePosition = useStore(state => state.mousePosition);
  
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;
      
      useStore.setState({ 
        mousePosition: { x, y }
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame(() => {
    if (orbitControlsRef.current && !(orbitControlsRef.current as any).isDragging) {
      camera.position.x = mousePosition.x * 0.3;
      camera.position.y = mousePosition.y * 0.3;
    }
  });

  return (
    <>
      <color attach="background" args={['#09090b']} />
      
      <OrbitControls 
        ref={orbitControlsRef}
        enableZoom={false}
        enablePan={false}
        enableRotate={false}
        makeDefault
      />
      
      <Stars
        radius={50}
        depth={50}
        count={1500}
        factor={4}
        saturation={0}
        fade
        speed={0.5}
      />
      
      <Lights />
      
      {/* <HorizonEffect /> */}
      
      <AmbientOrbs />
      
      <Float floatIntensity={2} rotationIntensity={0.5}>
        <Crystal 
          position={[2, 1, -2]} 
          scale={0.5} 
          color="#4c1d95" 
          wireframe={false} 
        />
      </Float>
      
      <Float floatIntensity={1.5} rotationIntensity={1}>
        <Crystal 
          position={[-2.5, -1, -3]} 
          scale={0.7} 
          color="#047857" 
          wireframe={false} 
        />
      </Float>
      
      <Float floatIntensity={2.5} rotationIntensity={0.8}>
        <Crystal 
          position={[0, -2, -1]} 
          scale={0.3} 
          color="#1d4ed8" 
          wireframe={false} 
        />
      </Float>
      
      <Particles count={200} />
    </>
  );
}

function AmbientOrbs() {
  const orb1Ref = useRef(null);
  const orb2Ref = useRef(null);
  const orb3Ref = useRef(null);

  
  return (
    <>
      <pointLight
        ref={orb1Ref}
        position={[3, 2, -2]}
        color="#8b5cf6"
        intensity={2}
        distance={6}
      />
      <pointLight
        ref={orb2Ref}
        position={[-3, -2, -1]}
        color="#10b981"
        intensity={1.5}
        distance={5}
      />
      <pointLight
        ref={orb3Ref}
        position={[0, 0, -3]}
        color="#3b82f6"
        intensity={1.2}
        distance={4}
      />
    </>
  );
}