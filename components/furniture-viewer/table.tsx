"use client";

import { useRef } from "react";
import { useFurniture } from "@/lib/furniture-context";
import * as THREE from "three";
import { AudioMesh } from "./audio-material";

export function Table({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const { params } = useFurniture();
  
  const {
    tableTopWidth,
    tableTopDepth,
    tableTopHeight,
    tableLegHeight,
    tableColor,
  } = params;

  const legThickness = 0.06;
  
  // Posição Y do tampo
  const topY = tableLegHeight + tableTopHeight / 2;

  return (
    <group ref={groupRef} position={position}>
      {/* Tampo da mesa */}
      <AudioMesh
        position={[0, topY, 0]}
        baseColor={tableColor}
        geometry={<boxGeometry args={[tableTopWidth, tableTopHeight, tableTopDepth]} />}
        receiveShadow
      />

      {/* Pernas da mesa */}
      {[
        [-tableTopWidth / 2 + legThickness / 2 + 0.05, tableLegHeight / 2, -tableTopDepth / 2 + legThickness / 2 + 0.05],
        [tableTopWidth / 2 - legThickness / 2 - 0.05, tableLegHeight / 2, -tableTopDepth / 2 + legThickness / 2 + 0.05],
        [-tableTopWidth / 2 + legThickness / 2 + 0.05, tableLegHeight / 2, tableTopDepth / 2 - legThickness / 2 - 0.05],
        [tableTopWidth / 2 - legThickness / 2 - 0.05, tableLegHeight / 2, tableTopDepth / 2 - legThickness / 2 - 0.05],
      ].map((pos, i) => (
        <AudioMesh
          key={`table-leg-${i}`}
          position={pos as [number, number, number]}
          baseColor={tableColor}
          geometry={<boxGeometry args={[legThickness, tableLegHeight, legThickness]} />}
        />
      ))}

      {/* Travessas de reforço (estrutura sob o tampo) */}
      {/* Longitudinais */}
      {[-1, 1].map((side, i) => (
        <AudioMesh
          key={`long-bar-${i}`}
          position={[0, tableLegHeight * 0.85, side * (tableTopDepth / 2 - legThickness / 2 - 0.05)]}
          baseColor={tableColor}
          geometry={<boxGeometry args={[tableTopWidth - legThickness * 2 - 0.1, legThickness * 0.8, legThickness * 0.8]} />}
        />
      ))}
      
      {/* Transversais */}
      {[-1, 1].map((side, i) => (
        <AudioMesh
          key={`trans-bar-${i}`}
          position={[side * (tableTopWidth / 2 - legThickness / 2 - 0.05), tableLegHeight * 0.85, 0]}
          baseColor={tableColor}
          geometry={<boxGeometry args={[legThickness * 0.8, legThickness * 0.8, tableTopDepth - legThickness * 2 - 0.1]} />}
        />
      ))}
    </group>
  );
}
