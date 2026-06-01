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
  const decay = Math.exp(-freqBin * 2.5);
  const harmonics = Math.sin(freqBin * Math.PI * 6) * 0.3 + 0.7;
  return Math.max(0.1, decay * harmonics);
}

// Simula intensidade Waveform
function getWaveformIntensity(x: number): number {
  const wave1 = Math.sin(x * Math.PI * 8) * 0.4;
  const wave2 = Math.sin(x * Math.PI * 16 + 0.5) * 0.2;
  const wave3 = Math.sin(x * Math.PI * 4) * 0.3;
  return Math.abs(wave1 + wave2 + wave3) + 0.1;
}

// Simula intensidade STFT/Spectrogram
function getSTFTIntensity(y: number, x: number): number {
  const timeVar = Math.sin(x * Math.PI * 6) * 0.3 + 0.5;
  const freqVar = Math.exp(-Math.abs(y - 0.5) * 3) * 0.8;
  const noise = Math.sin(x * 37 + y * 53) * 0.1;
  return Math.max(0, Math.min(1, timeVar * freqVar + noise));
}

// Cria furo em forma de trevo/flor de 4 pétalas
function createCloverHole(x: number, y: number, size: number): THREE.Path {
  const holePath = new THREE.Path();
  const petalRadius = size * 0.45;
  const numPetals = 4;
  
  const points: { x: number; y: number }[] = [];
  const segments = 32;
  
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
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
  const r = armWidth * 0.3;
  
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

// Gera UVs planares baseadas na posição XY da geometria (útil para ExtrudeGeometry)
function generatePlanarUVs(geometry: THREE.BufferGeometry) {
  geometry.computeBoundingBox();
  const bbox = geometry.boundingBox!;
  const size = new THREE.Vector3();
  bbox.getSize(size);

  const pos = geometry.getAttribute('position');
  const uv = new Float32Array((pos.count) * 2);

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);

    const u = size.x > 0 ? (x - bbox.min.x) / size.x : 0.5;
    const v = size.y > 0 ? (y - bbox.min.y) / size.y : 0.5;

    uv[i * 2] = u;
    uv[i * 2 + 1] = v;
  }

  geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
}

// Banco Mehinaku com Chapa Perfurada
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
    textureMode,
    waveIntensity,
    fftIntensity,
    spectrogramIntensity,
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

  // Gera a geometria da chapa perfurada baseada no modo de textura
  const { frontPlateGeometry, backPlateGeometry, framePositions } = useMemo(() => {
    const holeSize = bancoMehinakuPerfuradoHoleSize;
    const thickness = bancoMehinakuPerfuradoPlateThickness;
    const plateHeight = bancoMehinakuPerfuradoLegHeight;
    const useClover = bancoMehinakuPerfuradoHolePattern === "clover";
    
    // Padrão mais denso
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
    
    const colSpacing = panelWidth / (cols + 1);
    const rowSpacing = plateHeight / (rows + 1);
    
    // Funcao para obter intensidade baseada no modo de textura
    const getIntensityForMode = (normalizedX: number, normalizedY: number): number => {
      switch (textureMode) {
        case "solid":
          return 0.5;
          
        case "waveform":
          const waveBase = getWaveformIntensity(normalizedX);
          const verticalWave = Math.sin(normalizedY * Math.PI * 4) * 0.2;
          return Math.max(0, Math.min(1, (waveBase + verticalWave) * waveIntensity));
          
        case "fft":
          const fftMag = getFFTIntensity(normalizedX);
          const isInFFTBar = normalizedY < fftMag;
          return isInFFTBar ? fftMag * fftIntensity : 0.1;
          
        case "spectrogram":
          const stftVal = getSTFTIntensity(normalizedY, normalizedX);
          return stftVal * spectrogramIntensity;
          
        case "combined":
          const waveInt = getWaveformIntensity(normalizedX);
          const fftInt = getFFTIntensity(normalizedX);
          const stftInt = getSTFTIntensity(normalizedY, normalizedX);
          
          const waveComponent = Math.sin(normalizedX * Math.PI * 6) * waveInt;
          const fftComponent = fftInt * (1 - normalizedY * 0.5);
          const stftComponent = stftInt * 0.5;
          
          return Math.max(0, Math.min(1, waveComponent * 0.3 + fftComponent * 0.4 + stftComponent * 0.3));
          
        default:
          return 0.5;
      }
    };
    
    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows; row++) {
        const x = -panelWidth / 2 + colSpacing * (col + 1);
        const y = rowSpacing * (row + 1);
        
        const normalizedX = col / cols;
        const normalizedY = row / rows;
        
        // Obtem intensidade baseada no modo de textura
        const intensity = getIntensityForMode(normalizedX, normalizedY);
        
        // Tamanho do furo inversamente proporcional a intensidade
        const sizeMultiplier = 0.4 + (1 - intensity) * 0.6;
        const adjustedSize = holeSize * sizeMultiplier;
        
        // Cria o furo com o padrao selecionado
        let holePath: THREE.Path;
        
        if (useClover) {
          holePath = createCloverHole(x, y, adjustedSize);
        } else {
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

    // Garantir que as geometrias extrudadas tenham coordenadas UV (mapeamento planar XY)
    try {
      generatePlanarUVs(frontGeo as THREE.BufferGeometry);
      generatePlanarUVs(backGeo as THREE.BufferGeometry);
    } catch (e) {
      // Se algo falhar, não bloqueia a renderização — UVs podem ficar indefinidas
      // (debug) console.warn('generatePlanarUVs failed', e);
    }

    const frames = [
      { x: -panelWidth / 2 - 0.012, width: 0.024 },
      { x: panelWidth / 2 + 0.012, width: 0.024 },
    ];
    
    return { 
      frontPlateGeometry: frontGeo, 
      backPlateGeometry: backGeo,
      framePositions: frames
    };
  }, [panelWidth, bancoMehinakuPerfuradoLegHeight, bancoMehinakuPerfuradoHoleSize, bancoMehinakuPerfuradoPlateThickness, bancoMehinakuPerfuradoHolePattern, textureMode, waveIntensity, fftIntensity, spectrogramIntensity]);

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
        <AudioMesh
          geometry={<primitive object={frontPlateGeometry} attach="geometry" />}
          baseColor={metalColor}
          castShadow={true}
          // panels should receive light/shadow as well
          receiveShadow={true}
        />

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
        <AudioMesh
          geometry={<primitive object={backPlateGeometry} attach="geometry" />}
          baseColor={metalColor}
          castShadow={true}
          receiveShadow={true}
        />

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
