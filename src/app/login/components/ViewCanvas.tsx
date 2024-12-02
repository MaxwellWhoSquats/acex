"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import React, { useRef } from "react";
import Model from "./CardSpade";
import { Environment, Float } from "@react-three/drei";
import * as THREE from "three";

type Props = {};

export default function ViewCanvas({}: Props) {
  function SpinningModel() {
    const modelRef = useRef<THREE.Group>(null);
    useFrame((state) => {
      if (modelRef.current) {
        modelRef.current.rotation.z -= 0.012;
        modelRef.current.position.z =
          Math.sin(state.clock.getElapsedTime()) * 0.1;
      }
    });

    return (
      <group ref={modelRef}>
        <Model />
      </group>
    );
  }

  return (
    <Canvas
      style={{
        top: 0,
        left: "40%",
        transform: "translateX(-50%)",
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 30,
      }}
      camera={{
        fov: 60,
        position: [0, 5, 0],
        near: 0.1,
        far: 1000,
      }}
      shadows
      dpr={[1, 1.5]}
      gl={{ antialias: true }}
    >
      <Float rotationIntensity={1} speed={4}>
        <SpinningModel />
      </Float>
      <Environment preset="studio" />
    </Canvas>
  );
}
