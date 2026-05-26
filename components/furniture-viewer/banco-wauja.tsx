"use client";

import { useRef } from "react";
import { useFurniture } from "@/lib/furniture-context";
import * as THREE from "three";
import { AudioMesh } from "./audio-material";

// Banco Indigena - Wauja
// Formato de ponte retangular com dois semicirculos nas laterais como pernas
export function BancoWauja({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const { params } = useFurniture();
  
  const {
    bancoWaujaWidth,
    bancoWaujaDepth,
    bancoWaujaHeight,
    bancoWaujaColor,
  } = params;

  const topThickness = 0.03;
  const panelDepth = bancoWaujaDepth * 0.85;

  return (
    <group ref={groupRef} position={position}>
      {/* Tampo superior */}
      <AudioMesh
        position={[0, bancoWaujaHeight - topThickness / 2, 0]}
        baseColor={bancoWaujaColor}
        geometry={<boxGeometry args={[bancoWaujaWidth, topThickness, bancoWaujaDepth]} />}
        receiveShadow
      />

      {/* Perna esquerda - painel plano */}
      <AudioMesh
        position={[-bancoWaujaWidth / 2 + 0.02, bancoWaujaHeight / 2, 0]}
        baseColor={bancoWaujaColor}
        geometry={<boxGeometry args={[0.025, bancoWaujaHeight, panelDepth]} />}
        castShadow
      />

      {/* Perna direita - painel plano */}
      <AudioMesh
        position={[bancoWaujaWidth / 2 - 0.02, bancoWaujaHeight / 2, 0]}
        baseColor={bancoWaujaColor}
        geometry={<boxGeometry args={[0.025, bancoWaujaHeight, panelDepth]} />}
        castShadow
      />

      {/* Padroes decorativos no topo */}
      <group position={[0, bancoWaujaHeight + 0.002, 0]}>
        {/* Bordas decorativas */}
        <AudioMesh
          position={[0, 0, bancoWaujaDepth * 0.35]}
          baseColor="#1a1a1a"
          geometry={<boxGeometry args={[bancoWaujaWidth * 0.85, 0.003, 0.01]} />}
        />
        <AudioMesh
          position={[0, 0, -bancoWaujaDepth * 0.35]}
          baseColor="#1a1a1a"
          geometry={<boxGeometry args={[bancoWaujaWidth * 0.85, 0.003, 0.01]} />}
        />
        {/* Padrao central */}
        {Array.from({ length: 4 }).map((_, i) => (
          <AudioMesh
            key={`top-line-${i}`}
            position={[(i - 1.5) * bancoWaujaWidth * 0.2, 0, 0]}
            baseColor="#8B0000"
            geometry={<boxGeometry args={[0.008, 0.003, bancoWaujaDepth * 0.5]} />}
          />
        ))}
      </group>
    </group>
  );
}
