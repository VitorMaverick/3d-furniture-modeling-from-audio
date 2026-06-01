"use client";

import { useRef, useMemo } from "react";
import { useFurniture } from "@/lib/furniture-context";
import * as THREE from "three";
import { AudioMesh } from "./audio-material";

// Cria geometria de retangulo com pontas curvas (stadium shape)
function createRoundedRectShape(width: number, depth: number, radius: number): THREE.Shape {
  const shape = new THREE.Shape();
  const w = width / 2;
  const d = depth / 2;
  const r = Math.min(radius, w, d);
  
  shape.moveTo(-w + r, -d);
  shape.lineTo(w - r, -d);
  shape.quadraticCurveTo(w, -d, w, -d + r);
  shape.lineTo(w, d - r);
  shape.quadraticCurveTo(w, d, w - r, d);
  shape.lineTo(-w + r, d);
  shape.quadraticCurveTo(-w, d, -w, d - r);
  shape.lineTo(-w, -d + r);
  shape.quadraticCurveTo(-w, -d, -w + r, -d);
  
  return shape;
}

// Componente para parafuso de rosca contínua
function ThreadedColumn({ 
  position, 
  height, 
  radius, 
  color = "#4A4A4A" 
}: { 
  position: [number, number, number];
  height: number;
  radius: number;
  color?: string;
}) {
  // Número de voltas da rosca baseado na altura
  const threadPitch = 0.008; // Distância entre cada volta da rosca
  const threadCount = Math.floor(height / threadPitch);
  
  return (
    <group position={position}>
      {/* Corpo principal da coluna (cilindro grosso) */}
      <mesh position={[0, height / 2, 0]} castShadow>
        <cylinderGeometry args={[radius, radius, height, 24]} />
        <meshStandardMaterial color={color} metalness={0.85} roughness={0.25} />
      </mesh>
      
      {/* Rosca helicoidal ao redor da coluna - mais detalhada */}
      {Array.from({ length: threadCount }).map((_, j) => {
        const threadY = j * threadPitch;
        const threadAngle = j * Math.PI * 0.4; // Gira 72 graus por passo para rosca mais fina
        return (
          <mesh
            key={`thread-${j}`}
            position={[
              Math.cos(threadAngle) * radius,
              threadY + threadPitch / 2,
              Math.sin(threadAngle) * radius
            ]}
            rotation={[0, threadAngle, Math.PI / 2]}
          >
            <torusGeometry args={[radius * 1.15, radius * 0.15, 6, 12, Math.PI * 0.8]} />
            <meshStandardMaterial color="#5A5A5A" metalness={0.75} roughness={0.35} />
          </mesh>
        );
      })}
      
      {/* Porca sextavada superior */}
      <mesh position={[0, height + radius * 0.8, 0]} castShadow>
        <cylinderGeometry args={[radius * 1.6, radius * 1.6, radius * 1.2, 6]} />
        <meshStandardMaterial color="#3A3A3A" metalness={0.9} roughness={0.2} />
      </mesh>
      
      {/* Porca sextavada inferior */}
      <mesh position={[0, -radius * 0.8, 0]} castShadow>
        <cylinderGeometry args={[radius * 1.6, radius * 1.6, radius * 1.2, 6]} />
        <meshStandardMaterial color="#3A3A3A" metalness={0.9} roughness={0.2} />
      </mesh>
      
      {/* Arruela superior */}
      <mesh position={[0, height, 0]}>
        <cylinderGeometry args={[radius * 1.8, radius * 1.8, radius * 0.2, 24]} />
        <meshStandardMaterial color="#5A5A5A" metalness={0.8} roughness={0.3} />
      </mesh>
      
      {/* Arruela inferior */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[radius * 1.8, radius * 1.8, radius * 0.2, 24]} />
        <meshStandardMaterial color="#5A5A5A" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}

// Banco Indigena Mehinaku
// Tampo retangular com pontas curvas e estrutura com parafusos de rosca contínua
export function BancoMehinaku({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const { params } = useFurniture();
  
  const {
    bancoMehinakuTopWidth,
    bancoMehinakuTopDepth,
    bancoMehinakuTopHeight,
    bancoMehinakuLegHeight,
    bancoMehinakuColor,
    bancoMehinakuColumnRadius,
  } = params;

  const topY = bancoMehinakuLegHeight + bancoMehinakuTopHeight / 2;
  const panelWidth = bancoMehinakuTopWidth * 0.7; // Largura dos paineis planos
  const cornerRadius = bancoMehinakuTopDepth * 0.4; // Raio das pontas curvas
  
  // Raio das colunas (parafusos de rosca contínua) - mais grossos para robustez
  const columnRadius = bancoMehinakuColumnRadius || 0.018;

  // Geometria do tampo com pontas curvas
  const topGeometry = useMemo(() => {
    const shape = createRoundedRectShape(bancoMehinakuTopWidth, bancoMehinakuTopDepth, cornerRadius);
    const extrudeSettings = {
      steps: 1,
      depth: bancoMehinakuTopHeight,
      bevelEnabled: true,
      bevelThickness: 0.005,
      bevelSize: 0.005,
      bevelSegments: 3
    };
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, [bancoMehinakuTopWidth, bancoMehinakuTopDepth, bancoMehinakuTopHeight, cornerRadius]);
  
  // Posições das 4 colunas de suporte (parafusos de rosca contínua)
  const columnPositions = useMemo(() => [
    { x: -panelWidth / 2 + columnRadius * 2, z: bancoMehinakuTopDepth / 2 - columnRadius * 2 },
    { x: panelWidth / 2 - columnRadius * 2, z: bancoMehinakuTopDepth / 2 - columnRadius * 2 },
    { x: -panelWidth / 2 + columnRadius * 2, z: -bancoMehinakuTopDepth / 2 + columnRadius * 2 },
    { x: panelWidth / 2 - columnRadius * 2, z: -bancoMehinakuTopDepth / 2 + columnRadius * 2 },
  ], [panelWidth, columnRadius, bancoMehinakuTopDepth]);

  return (
    <group ref={groupRef} position={position}>
      {/* Tampo retangular com pontas curvas */}
      <group position={[0, topY, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <AudioMesh
          position={[0, 0, -bancoMehinakuTopHeight / 2]}
          baseColor={bancoMehinakuColor}
          geometry={<primitive object={topGeometry} attach="geometry" />}
          receiveShadow
        />
      </group>

      {/* Perna frontal - painel plano retangular */}
      <AudioMesh
        position={[0, bancoMehinakuLegHeight / 2, bancoMehinakuTopDepth / 2 - 0.02]}
        baseColor={bancoMehinakuColor}
        geometry={<boxGeometry args={[panelWidth, bancoMehinakuLegHeight, 0.025]} />}
        castShadow
      />

      {/* Perna traseira - painel plano retangular */}
      <AudioMesh
        position={[0, bancoMehinakuLegHeight / 2, -bancoMehinakuTopDepth / 2 + 0.02]}
        baseColor={bancoMehinakuColor}
        geometry={<boxGeometry args={[panelWidth, bancoMehinakuLegHeight, 0.025]} />}
        castShadow
      />
      
      {/* Colunas de suporte - parafusos de rosca contínua */}
      {columnPositions.map((col, i) => (
        <ThreadedColumn
          key={`column-${i}`}
          position={[col.x, 0, col.z]}
          height={bancoMehinakuLegHeight}
          radius={columnRadius}
        />
      ))}

      {/* Detalhes decorativos no tampo */}
      {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, i) => (
        <AudioMesh
          key={`decor-${i}`}
          position={[
            Math.cos(angle) * bancoMehinakuTopWidth * 0.2,
            topY + bancoMehinakuTopHeight / 2 + 0.002,
            Math.sin(angle) * bancoMehinakuTopDepth * 0.2
          ]}
          baseColor="#2D1B0E"
          geometry={<boxGeometry args={[0.025, 0.003, 0.06]} />}
        />
      ))}
    </group>
  );
}
