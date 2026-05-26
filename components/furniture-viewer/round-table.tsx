"use client";

import { useRef } from "react";
import { useFurniture } from "@/lib/furniture-context";
import * as THREE from "three";
import { AudioMesh } from "./audio-material";

interface RoundTableProps {
  position?: [number, number, number];
}

export function RoundTable({ position = [0, 0, 0] }: RoundTableProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { params } = useFurniture();

  const {
    roundTableTopRadius,
    roundTableTopHeight,
    roundTableBaseTopRadius,
    roundTableBaseBottomRadius,
    roundTableBaseHeight,
    roundTableColor,
  } = params;

  return (
    <group ref={groupRef} position={position}>
      {/* Tampo circular da mesa */}
      <AudioMesh
        position={[0, roundTableBaseHeight + roundTableTopHeight / 2, 0]}
        baseColor={roundTableColor}
        geometry={<cylinderGeometry args={[roundTableTopRadius, roundTableTopRadius, roundTableTopHeight, 64]} />}
        receiveShadow
      />

      {/* Base cônica sólida */}
      <AudioMesh
        position={[0, roundTableBaseHeight / 2, 0]}
        baseColor={roundTableColor}
        geometry={
          <cylinderGeometry 
            args={[
              roundTableBaseTopRadius, 
              roundTableBaseBottomRadius, 
              roundTableBaseHeight, 
              64
            ]} 
          />
        }
      />
    </group>
  );
}
