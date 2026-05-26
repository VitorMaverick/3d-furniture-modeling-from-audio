"use client";

import { useRef } from "react";
import { useFurniture } from "@/lib/furniture-context";
import * as THREE from "three";
import { AudioMesh } from "./audio-material";

export function Chair({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const { params } = useFurniture();
  
  const {
    chairSeatWidth,
    chairSeatDepth,
    chairSeatHeight,
    chairBackHeight,
    chairLegHeight,
    chairColor,
  } = params;

  const legThickness = 0.04;
  const backThickness = 0.03;
  
  // Posição Y do assento
  const seatY = chairLegHeight + chairSeatHeight / 2;

  return (
    <group ref={groupRef} position={position}>
      {/* Assento */}
      <AudioMesh
        position={[0, seatY, 0]}
        baseColor={chairColor}
        geometry={<boxGeometry args={[chairSeatWidth, chairSeatHeight, chairSeatDepth]} />}
        receiveShadow
      />

      {/* Pernas */}
      {[
        [-chairSeatWidth / 2 + legThickness / 2, chairLegHeight / 2, -chairSeatDepth / 2 + legThickness / 2],
        [chairSeatWidth / 2 - legThickness / 2, chairLegHeight / 2, -chairSeatDepth / 2 + legThickness / 2],
        [-chairSeatWidth / 2 + legThickness / 2, chairLegHeight / 2, chairSeatDepth / 2 - legThickness / 2],
        [chairSeatWidth / 2 - legThickness / 2, chairLegHeight / 2, chairSeatDepth / 2 - legThickness / 2],
      ].map((pos, i) => (
        <AudioMesh
          key={`leg-${i}`}
          position={pos as [number, number, number]}
          baseColor={chairColor}
          geometry={<boxGeometry args={[legThickness, chairLegHeight, legThickness]} />}
        />
      ))}

      {/* Encosto */}
      <AudioMesh
        position={[0, seatY + chairBackHeight / 2 + chairSeatHeight / 2, -chairSeatDepth / 2 + backThickness / 2]}
        baseColor={chairColor}
        geometry={<boxGeometry args={[chairSeatWidth, chairBackHeight, backThickness]} />}
      />

      {/* Suportes verticais do encosto */}
      {[
        [-chairSeatWidth / 2 + legThickness / 2, seatY + chairBackHeight / 2, -chairSeatDepth / 2 + legThickness / 2],
        [chairSeatWidth / 2 - legThickness / 2, seatY + chairBackHeight / 2, -chairSeatDepth / 2 + legThickness / 2],
      ].map((pos, i) => (
        <AudioMesh
          key={`back-support-${i}`}
          position={pos as [number, number, number]}
          baseColor={chairColor}
          geometry={<boxGeometry args={[legThickness, chairBackHeight, legThickness]} />}
        />
      ))}

      {/* Travessas entre as pernas (reforço) */}
      {/* Frente */}
      <AudioMesh
        position={[0, chairLegHeight * 0.3, chairSeatDepth / 2 - legThickness / 2]}
        baseColor={chairColor}
        geometry={<boxGeometry args={[chairSeatWidth - legThickness * 2, legThickness * 0.7, legThickness * 0.7]} />}
      />
      
      {/* Laterais */}
      {[-1, 1].map((side, i) => (
        <AudioMesh
          key={`side-bar-${i}`}
          position={[side * (chairSeatWidth / 2 - legThickness / 2), chairLegHeight * 0.3, 0]}
          baseColor={chairColor}
          geometry={<boxGeometry args={[legThickness * 0.7, legThickness * 0.7, chairSeatDepth - legThickness * 2]} />}
        />
      ))}
    </group>
  );
}
