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

// Simula intensidade FFT para determinar padrão de furos
function getFFTIntensity(freqBin: number): number {
  // Distribuição típica de FFT: mais energia em baixas frequências
  const decay = Math.exp(-freqBin * 2.5);
  // Adiciona picos em certas frequências (simulando harmonicos)
  const harmonics = Math.sin(freqBin * Math.PI * 6) * 0.3 + 0.7;
  return Math.max(0.1, decay * harmonics);
}

// Banco Mehinaku com Chapa Perfurada
// Base com padrão FFT em chapa perfurada ao invés de rede fina
export function BancoMehinakuPerfurado({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const { params } = useFurniture();
  
  const {
    bancoMehinakuPerfuradoTopWidth,
    bancoMehinakuPerfuradoTopDepth,
    bancoMehinakuPerfuradoTopHeight,
    bancoMehinakuPerfuradoLegHeight,
    bancoMehinakuPerfuradoColor,
    bancoMehinakuPerfuradoHoleSize,
    bancoMehinakuPerfuradoPlateThickness,
  } = params;

  const topY = bancoMehinakuPerfuradoLegHeight + bancoMehinakuPerfuradoTopHeight / 2;
  const panelWidth = bancoMehinakuPerfuradoTopWidth * 0.7;
  const cornerRadius = bancoMehinakuPerfuradoTopDepth * 0.4;

  // Geometria do tampo com pontas curvas (madeira)
  const topGeometry = useMemo(() => {
    const shape = createRoundedRectShape(bancoMehinakuPerfuradoTopWidth, bancoMehinakuPerfuradoTopDepth, cornerRadius);
    const extrudeSettings = {
      steps: 1,
      depth: bancoMehinakuPerfuradoTopHeight,
      bevelEnabled: true,
      bevelThickness: 0.005,
      bevelSize: 0.005,
      bevelSegments: 3
    };
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, [bancoMehinakuPerfuradoTopWidth, bancoMehinakuPerfuradoTopDepth, bancoMehinakuPerfuradoTopHeight, cornerRadius]);

  // Gera a geometria da chapa perfurada com padrão FFT
  const { frontPlateGeometry, backPlateGeometry, framePositions } = useMemo(() => {
    const holeSize = bancoMehinakuPerfuradoHoleSize;
    const thickness = bancoMehinakuPerfuradoPlateThickness;
    const plateHeight = bancoMehinakuPerfuradoLegHeight;
    
    // Número de colunas e linhas de furos
    const cols = Math.floor(panelWidth / (holeSize * 2));
    const rows = Math.floor(plateHeight / (holeSize * 2));
    
    // Shape da chapa base
    const plateShape = new THREE.Shape();
    plateShape.moveTo(-panelWidth / 2, 0);
    plateShape.lineTo(panelWidth / 2, 0);
    plateShape.lineTo(panelWidth / 2, plateHeight);
    plateShape.lineTo(-panelWidth / 2, plateHeight);
    plateShape.lineTo(-panelWidth / 2, 0);
    
    // Adiciona furos baseados no padrão FFT
    const colSpacing = panelWidth / (cols + 1);
    const rowSpacing = plateHeight / (rows + 1);
    
    for (let col = 0; col < cols; col++) {
      const normalizedFreq = col / cols;
      const fftMagnitude = getFFTIntensity(normalizedFreq);
      // Altura máxima das "barras" FFT
      const maxBarRows = Math.floor(rows * fftMagnitude);
      
      for (let row = 0; row < rows; row++) {
        const x = -panelWidth / 2 + colSpacing * (col + 1);
        const y = rowSpacing * (row + 1);
        
        // Determina se deve ter furo baseado no padrão FFT
        // Furos aparecem onde NÃO há "barra" do FFT
        const isInBar = row < maxBarRows;
        
        // Cria padrão visual interessante:
        // - Dentro da barra FFT: furos menores (mais metal, mais resistência)
        // - Fora da barra FFT: furos maiores (menos material, padrão decorativo)
        const adjustedSize = isInBar ? holeSize * 0.5 : holeSize * 0.9;
        
        // Alterna padrão de cruz/quadrado baseado na posição
        const patternType = (col + row) % 2;
        
        if (patternType === 0) {
          // Furo quadrado com cantos arredondados
          const holePath = new THREE.Path();
          const s = adjustedSize / 2;
          const r = s * 0.2; // Raio do canto
          
          holePath.moveTo(x - s + r, y - s);
          holePath.lineTo(x + s - r, y - s);
          holePath.quadraticCurveTo(x + s, y - s, x + s, y - s + r);
          holePath.lineTo(x + s, y + s - r);
          holePath.quadraticCurveTo(x + s, y + s, x + s - r, y + s);
          holePath.lineTo(x - s + r, y + s);
          holePath.quadraticCurveTo(x - s, y + s, x - s, y + s - r);
          holePath.lineTo(x - s, y - s + r);
          holePath.quadraticCurveTo(x - s, y - s, x - s + r, y - s);
          
          plateShape.holes.push(holePath);
        } else {
          // Furo em forma de cruz (padrão da imagem de referência)
          const holePath = new THREE.Path();
          const s = adjustedSize / 2;
          const armWidth = s * 0.4;
          
          // Desenha cruz
          holePath.moveTo(x - armWidth, y - s);
          holePath.lineTo(x + armWidth, y - s);
          holePath.lineTo(x + armWidth, y - armWidth);
          holePath.lineTo(x + s, y - armWidth);
          holePath.lineTo(x + s, y + armWidth);
          holePath.lineTo(x + armWidth, y + armWidth);
          holePath.lineTo(x + armWidth, y + s);
          holePath.lineTo(x - armWidth, y + s);
          holePath.lineTo(x - armWidth, y + armWidth);
          holePath.lineTo(x - s, y + armWidth);
          holePath.lineTo(x - s, y - armWidth);
          holePath.lineTo(x - armWidth, y - armWidth);
          holePath.lineTo(x - armWidth, y - s);
          
          plateShape.holes.push(holePath);
        }
      }
    }
    
    const extrudeSettings = {
      steps: 1,
      depth: thickness,
      bevelEnabled: false,
    };
    
    const frontGeo = new THREE.ExtrudeGeometry(plateShape, extrudeSettings);
    const backGeo = new THREE.ExtrudeGeometry(plateShape, extrudeSettings);
    
    // Posições das molduras de reforço laterais
    const frames = [
      { x: -panelWidth / 2 - 0.01, width: 0.02 },
      { x: panelWidth / 2 + 0.01, width: 0.02 },
    ];
    
    return { 
      frontPlateGeometry: frontGeo, 
      backPlateGeometry: backGeo,
      framePositions: frames
    };
  }, [panelWidth, bancoMehinakuPerfuradoLegHeight, bancoMehinakuPerfuradoHoleSize, bancoMehinakuPerfuradoPlateThickness]);

  // Cor do tampo (madeira)
  const woodColor = "#5D4037";
  // Cor metálica para a chapa
  const metalColor = bancoMehinakuPerfuradoColor;

  return (
    <group ref={groupRef} position={position}>
      {/* Tampo retangular com pontas curvas (madeira) */}
      <group position={[0, topY, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <AudioMesh
          position={[0, 0, -bancoMehinakuPerfuradoTopHeight / 2]}
          baseColor={woodColor}
          geometry={<primitive object={topGeometry} attach="geometry" />}
          receiveShadow
        />
      </group>

      {/* Chapa perfurada frontal */}
      <group 
        position={[0, 0, bancoMehinakuPerfuradoTopDepth / 2 - 0.02]} 
        rotation={[0, 0, 0]}
      >
        <mesh geometry={frontPlateGeometry} castShadow>
          <meshStandardMaterial 
            color={metalColor} 
            metalness={0.7} 
            roughness={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
        
        {/* Molduras laterais de reforço */}
        {framePositions.map((frame, i) => (
          <mesh key={`front-frame-${i}`} position={[frame.x, bancoMehinakuPerfuradoLegHeight / 2, 0.002]}>
            <boxGeometry args={[frame.width, bancoMehinakuPerfuradoLegHeight, 0.008]} />
            <meshStandardMaterial color={metalColor} metalness={0.8} roughness={0.2} />
          </mesh>
        ))}
      </group>

      {/* Chapa perfurada traseira */}
      <group 
        position={[0, 0, -bancoMehinakuPerfuradoTopDepth / 2 + 0.02]} 
        rotation={[0, Math.PI, 0]}
      >
        <mesh geometry={backPlateGeometry} castShadow>
          <meshStandardMaterial 
            color={metalColor} 
            metalness={0.7} 
            roughness={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
        
        {/* Molduras laterais de reforço */}
        {framePositions.map((frame, i) => (
          <mesh key={`back-frame-${i}`} position={[frame.x, bancoMehinakuPerfuradoLegHeight / 2, 0.002]}>
            <boxGeometry args={[frame.width, bancoMehinakuPerfuradoLegHeight, 0.008]} />
            <meshStandardMaterial color={metalColor} metalness={0.8} roughness={0.2} />
          </mesh>
        ))}
      </group>

      {/* Detalhes decorativos no tampo */}
      {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, i) => (
        <AudioMesh
          key={`decor-${i}`}
          position={[
            Math.cos(angle) * bancoMehinakuPerfuradoTopWidth * 0.2,
            topY + bancoMehinakuPerfuradoTopHeight / 2 + 0.002,
            Math.sin(angle) * bancoMehinakuPerfuradoTopDepth * 0.2
          ]}
          baseColor="#2D1B0E"
          geometry={<boxGeometry args={[0.025, 0.003, 0.06]} />}
        />
      ))}
    </group>
  );
}
