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

// Banco Indigena Mehinaku
// Tampo retangular com pontas curvas e dois semicirculos nas bordas como pernas
export function BancoMehinaku({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const { params } = useFurniture();
  
  const {
    bancoMehinakuTopWidth,
    bancoMehinakuTopDepth,
    bancoMehinakuTopHeight,
    bancoMehinakuLegHeight,
    bancoMehinakuColor,
  } = params;

  const topY = bancoMehinakuLegHeight + bancoMehinakuTopHeight / 2;
  const panelWidth = bancoMehinakuTopWidth * 0.7; // Largura dos paineis planos
  const cornerRadius = bancoMehinakuTopDepth * 0.4; // Raio das pontas curvas

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
