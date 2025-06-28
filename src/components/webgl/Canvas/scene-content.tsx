"use client";
import { useRef, useEffect } from 'react';
import {  useFrame, useThree } from '@react-three/fiber';
import {
  Float,
  Stars,
  OrbitControls,
} from '@react-three/drei';
import { Crystal } from './crystal';
import { Particles } from './particles';
import { Lights } from './lights';
import { useStore } from '@/store/store';
import { AmbientOrbs } from './ambientOrbs';

const  SceneContent=()=> {
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

export default SceneContent
