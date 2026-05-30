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

// Cria furo em forma de trevo/flor de 4 pétalas (baseado na imagem de referência)
function createCloverHole(x: number, y: number, size: number): THREE.Path {
  const holePath = new THREE.Path();
  const petalRadius = size * 0.45;
  const centerRadius = size * 0.15;
  const numPetals = 4;
  
  // Desenha um trevo de 4 pétalas
  const points: { x: number; y: number }[] = [];
  const segments = 32;
  
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    // Função que cria forma de trevo
    const r = petalRadius * (0.5 + 0.5 * Math.abs(Math.cos(numPetals * angle / 2)));
    points.push({
      x: x + Math.cos(angle) * r,
      y: y + Math.sin(angle) * r
    });
  }
  
  holePath.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    holePath.lineTo(points[i].x, points[i].y);
  }
  holePath.closePath();
  
  return holePath;
}

// Cria furo em forma de cruz com cantos arredondados
function createCrossHole(x: number, y: number, size: number): THREE.Path {
  const holePath = new THREE.Path();
  const s = size / 2;
  const armWidth = s * 0.35;
  const r = armWidth * 0.3; // Raio do arredondamento
  
  // Cruz com cantos arredondados
  holePath.moveTo(x - armWidth + r, y - s);
  holePath.lineTo(x + armWidth - r, y - s);
  holePath.quadraticCurveTo(x + armWidth, y - s, x + armWidth, y - s + r);
  holePath.lineTo(x + armWidth, y - armWidth + r);
  holePath.quadraticCurveTo(x + armWidth, y - armWidth, x + armWidth + r, y - armWidth);
  holePath.lineTo(x + s - r, y - armWidth);
  holePath.quadraticCurveTo(x + s, y - armWidth, x + s, y - armWidth + r);
  holePath.lineTo(x + s, y + armWidth - r);
  holePath.quadraticCurveTo(x + s, y + armWidth, x + s - r, y + armWidth);
  holePath.lineTo(x + armWidth + r, y + armWidth);
  holePath.quadraticCurveTo(x + armWidth, y + armWidth, x + armWidth, y + armWidth + r);
  holePath.lineTo(x + armWidth, y + s - r);
  holePath.quadraticCurveTo(x + armWidth, y + s, x + armWidth - r, y + s);
  holePath.lineTo(x - armWidth + r, y + s);
  holePath.quadraticCurveTo(x - armWidth, y + s, x - armWidth, y + s - r);
  holePath.lineTo(x - armWidth, y + armWidth + r);
  holePath.quadraticCurveTo(x - armWidth, y + armWidth, x - armWidth - r, y + armWidth);
  holePath.lineTo(x - s + r, y + armWidth);
  holePath.quadraticCurveTo(x - s, y + armWidth, x - s, y + armWidth - r);
  holePath.lineTo(x - s, y - armWidth + r);
  holePath.quadraticCurveTo(x - s, y - armWidth, x - s + r, y - armWidth);
  holePath.lineTo(x - armWidth - r, y - armWidth);
  holePath.quadraticCurveTo(x - armWidth, y - armWidth, x - armWidth, y - armWidth - r);
  holePath.lineTo(x - armWidth, y - s + r);
  holePath.quadraticCurveTo(x - armWidth, y - s, x - armWidth + r, y - s);
  
  return holePath;
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
    bancoMehinakuPerfuradoHolePattern,
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
    const useClover = bancoMehinakuPerfuradoHolePattern === "clover";
    
    // Número de colunas e linhas de furos - padrão mais denso
    const spacing = holeSize * 1.8;
    const cols = Math.floor(panelWidth / spacing);
    const rows = Math.floor(plateHeight / spacing);
    
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
        const isInBar = row < maxBarRows;
        
        // Ajusta tamanho do furo baseado na posição no padrão FFT
        // Furos menores onde há mais "energia" (dentro das barras)
        const sizeMultiplier = isInBar ? 0.6 : 1.0;
        const adjustedSize = holeSize * sizeMultiplier;
        
        // Cria o furo com o padrão selecionado
        let holePath: THREE.Path;
        
        if (useClover) {
          // Padrão trevo/flor como na imagem de referência
          holePath = createCloverHole(x, y, adjustedSize);
        } else {
          // Padrão cruz como alternativa
          holePath = createCrossHole(x, y, adjustedSize);
        }
        
        plateShape.holes.push(holePath);
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
      { x: -panelWidth / 2 - 0.012, width: 0.024 },
      { x: panelWidth / 2 + 0.012, width: 0.024 },
    ];
    
    return { 
      frontPlateGeometry: frontGeo, 
      backPlateGeometry: backGeo,
      framePositions: frames
    };
  }, [panelWidth, bancoMehinakuPerfuradoLegHeight, bancoMehinakuPerfuradoHoleSize, bancoMehinakuPerfuradoPlateThickness, bancoMehinakuPerfuradoHolePattern]);

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
            metalness={0.75} 
            roughness={0.25}
            side={THREE.DoubleSide}
          />
        </mesh>
        
        {/* Molduras laterais de reforço */}
        {framePositions.map((frame, i) => (
          <mesh key={`front-frame-${i}`} position={[frame.x, bancoMehinakuPerfuradoLegHeight / 2, 0.003]}>
            <boxGeometry args={[frame.width, bancoMehinakuPerfuradoLegHeight, 0.01]} />
            <meshStandardMaterial color={metalColor} metalness={0.85} roughness={0.2} />
          </mesh>
        ))}
        
        {/* Barra horizontal superior */}
        <mesh position={[0, bancoMehinakuPerfuradoLegHeight - 0.008, 0.003]}>
          <boxGeometry args={[panelWidth + 0.048, 0.016, 0.01]} />
          <meshStandardMaterial color={metalColor} metalness={0.85} roughness={0.2} />
        </mesh>
        
        {/* Barra horizontal inferior */}
        <mesh position={[0, 0.008, 0.003]}>
          <boxGeometry args={[panelWidth + 0.048, 0.016, 0.01]} />
          <meshStandardMaterial color={metalColor} metalness={0.85} roughness={0.2} />
        </mesh>
      </group>

      {/* Chapa perfurada traseira */}
      <group 
        position={[0, 0, -bancoMehinakuPerfuradoTopDepth / 2 + 0.02]} 
        rotation={[0, Math.PI, 0]}
      >
        <mesh geometry={backPlateGeometry} castShadow>
          <meshStandardMaterial 
            color={metalColor} 
            metalness={0.75} 
            roughness={0.25}
            side={THREE.DoubleSide}
          />
        </mesh>
        
        {/* Molduras laterais de reforço */}
        {framePositions.map((frame, i) => (
          <mesh key={`back-frame-${i}`} position={[frame.x, bancoMehinakuPerfuradoLegHeight / 2, 0.003]}>
            <boxGeometry args={[frame.width, bancoMehinakuPerfuradoLegHeight, 0.01]} />
            <meshStandardMaterial color={metalColor} metalness={0.85} roughness={0.2} />
          </mesh>
        ))}
        
        {/* Barra horizontal superior */}
        <mesh position={[0, bancoMehinakuPerfuradoLegHeight - 0.008, 0.003]}>
          <boxGeometry args={[panelWidth + 0.048, 0.016, 0.01]} />
          <meshStandardMaterial color={metalColor} metalness={0.85} roughness={0.2} />
        </mesh>
        
        {/* Barra horizontal inferior */}
        <mesh position={[0, 0.008, 0.003]}>
          <boxGeometry args={[panelWidth + 0.048, 0.016, 0.01]} />
          <meshStandardMaterial color={metalColor} metalness={0.85} roughness={0.2} />
        </mesh>
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
