"use client";
import { useRef } from "react";

export function AmbientOrbs() {
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
