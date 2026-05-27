"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useFurniture } from "@/lib/furniture-context";
import type { AIWaveParams } from "@/lib/furniture-context";
import * as THREE from "three";
import { Line } from "@react-three/drei";

// Dados de forma de onda simulados baseados na imagem de referencia
// Alta intensidade no inicio (0-200), media (200-700), baixa (700-800), media novamente (800-1000)
function getWaveformIntensity(normalizedPosition: number, time: number = 0): number {
  // Simula o padrao da forma de onda da imagem - padrao estatico
  const basePattern = normalizedPosition < 0.2 
    ? 0.8 + Math.sin(normalizedPosition * 50) * 0.2 // Alta intensidade no inicio
    : normalizedPosition < 0.7 
      ? 0.4 + Math.sin(normalizedPosition * 30) * 0.3 // Media intensidade
      : normalizedPosition < 0.8 
        ? 0.1 + Math.sin(normalizedPosition * 20) * 0.1 // Baixa intensidade
        : 0.3 + Math.sin(normalizedPosition * 25) * 0.2; // Media novamente
  
  // Adiciona variacao temporal apenas se time > 0
  const timeVariation = time > 0 ? Math.sin(time * 2 + normalizedPosition * 10) * 0.3 : 0;
  
  return Math.max(0, Math.min(1, basePattern + timeVariation));
}

// Intensidade baseada no grafico FFT - picos altos em baixas frequencias, decaimento rapido
function getFFTIntensity(normalizedPosition: number): number {
  // FFT: picos altos no inicio (baixas frequencias), decaimento exponencial
  if (normalizedPosition < 0.1) {
    // Picos muito altos nas frequencias mais baixas
    return 0.9 + Math.sin(normalizedPosition * 80) * 0.1;
  } else if (normalizedPosition < 0.3) {
    // Picos medios-altos com decaimento
    const decay = Math.exp(-(normalizedPosition - 0.1) * 8);
    return 0.5 * decay + Math.sin(normalizedPosition * 60) * 0.2 * decay;
  } else {
    // Decaimento suave para frequencias altas
    const decay = Math.exp(-(normalizedPosition - 0.3) * 3);
    return 0.15 * decay + 0.05;
  }
}

// Intensidade baseada no grafico STFT - padroes verticais variando ao longo do tempo
function getSTFTIntensity(normalizedPosition: number, segmentIndex: number, totalSegments: number): number {
  const normalizedSeg = segmentIndex / Math.max(totalSegments - 1, 1);
  
  // STFT: combinacao de frequencia (vertical) e tempo (horizontal)
  // Frequencias altas tem menor intensidade geral
  const freqComponent = 1 - normalizedPosition * 0.6;
  
  // Variacao temporal - algumas regioes tem mais energia
  const timeComponent = normalizedSeg < 0.1 
    ? 0.8 + Math.sin(normalizedSeg * 50) * 0.2 // Inicio intenso
    : normalizedSeg < 0.6 
      ? 0.5 + Math.sin(normalizedSeg * 20) * 0.3 // Meio variado
      : normalizedSeg < 0.75 
        ? 0.2 + Math.sin(normalizedSeg * 15) * 0.1 // Regiao quieta
        : 0.4 + Math.sin(normalizedSeg * 25) * 0.2; // Final moderado
  
  return Math.max(0, Math.min(1, freqComponent * timeComponent));
}

// Intensidade das ondas gerada a partir dos parâmetros de IA
function getAIWaveIntensity(
  normalizedLayer: number,
  normalizedSeg: number,
  aiParams: AIWaveParams
): { intensity: number; scale: number } {
  // Mapeia bandas de frequência para zonas de altura
  let baseAmplitude: number;
  if (normalizedLayer < 0.33) {
    baseAmplitude = aiParams.lowFreqAmplitude;
  } else if (normalizedLayer < 0.66) {
    const t = (normalizedLayer - 0.33) / 0.33;
    baseAmplitude = aiParams.lowFreqAmplitude * (1 - t) + aiParams.midFreqAmplitude * t;
  } else {
    const t = (normalizedLayer - 0.66) / 0.34;
    baseAmplitude = aiParams.midFreqAmplitude * (1 - t) + aiParams.highFreqAmplitude * t;
  }

  // Oscilações angulares controladas pela complexidade
  const oscillations = 3 + Math.round(aiParams.complexity * 8);
  const angularWave = Math.sin(normalizedSeg * Math.PI * 2 * oscillations) * 0.4;

  // Oscilações verticais controladas pela densidade
  const vertOscillations = 2 + Math.round(aiParams.density * 5);
  const verticalWave = Math.sin(normalizedLayer * Math.PI * vertOscillations) * 0.15;

  const intensity = Math.max(0, Math.min(1, baseAmplitude + angularWave * baseAmplitude + verticalWave));
  const scale = 0.5 + intensity * 0.8;

  return { intensity, scale };
}

// Cores baseadas na paleta gerada pela IA
function getAIWaveColor(
  normalizedY: number,
  _intensity: number = 1,
  aiParams: AIWaveParams
): THREE.Color {
  const palette = aiParams.colorPalette.map((hex) => new THREE.Color(hex));
  const t = Math.min(1, Math.max(0, normalizedY)) * (palette.length - 1);
  const idx = Math.min(Math.floor(t), palette.length - 2);
  const frac = t - idx;
  return palette[idx].clone().lerp(palette[idx + 1], frac);
}

// Calcula o deslocamento inicial baseado no modo de textura
function getInitialDisplacement(
  layerIndex: number,
  totalLayers: number,
  segmentIndex: number,
  totalSegments: number,
  basePosition: [number, number, number],
  textureMode: string = "waveform",
  intensityMultiplier: number = 0.8,
  aiWaveParams?: AIWaveParams | null
): { dx: number, dz: number, scale: number } {
  const normalizedLayer = layerIndex / Math.max(totalLayers - 1, 1);
  const normalizedSeg = segmentIndex / Math.max(totalSegments - 1, 1);
  
  let intensity = 0.5;
  let scaleModifier = 1;
  
  switch (textureMode) {
    case "waveform": {
      const waveAmp = getWaveformIntensity(normalizedLayer, 0);
      const angularWave = Math.sin(normalizedSeg * Math.PI * 8) * 0.4;
      intensity = waveAmp + angularWave * waveAmp;
      scaleModifier = 0.6 + Math.abs(intensity) * 0.6;
      break;
    }

    case "fft": {
      const fftMag = getFFTIntensity(normalizedSeg);
      const isInBar = normalizedLayer < fftMag;
      if (isInBar) {
        intensity = fftMag * (1 - (normalizedLayer / fftMag) * 0.3);
        scaleModifier = 0.7 + fftMag * 0.8;
      } else {
        intensity = 0.5;
        scaleModifier = 0.3;
      }
      break;
    }

    case "spectrogram": {
      const stftVal = getSTFTIntensity(normalizedLayer, segmentIndex, totalSegments);
      const freqWeight = 1 - normalizedLayer * 0.5;
      const timeVar = Math.sin(normalizedSeg * Math.PI * 6) * 0.3 +
                     Math.sin(normalizedSeg * Math.PI * 2.5) * 0.4;
      intensity = stftVal * freqWeight * (0.7 + timeVar * 0.3);
      scaleModifier = 0.5 + intensity * 0.9;
      break;
    }

    case "combined": {
      const waveInt = getWaveformIntensity(normalizedSeg, 0);
      const fftInt = getFFTIntensity(normalizedSeg);
      const stftInt = getSTFTIntensity(normalizedLayer, segmentIndex, totalSegments);

      const waveComponent = Math.sin(normalizedSeg * Math.PI * 6) * waveInt;
      const fftComponent = fftInt * (1 - normalizedLayer * 0.5);
      const stftComponent = stftInt;

      const combined = (waveComponent + fftComponent + stftComponent) / 2.5;
      intensity = 0.5 + combined * 0.5;
      scaleModifier = 0.5 + Math.abs(combined) * 0.8;
      break;
    }

    case "ai-image": {
      if (!aiWaveParams) {
        const waveAmp = getWaveformIntensity(normalizedLayer, 0);
        const angularWave = Math.sin(normalizedSeg * Math.PI * 8) * 0.4;
        intensity = waveAmp + angularWave * waveAmp;
        scaleModifier = 0.6 + Math.abs(intensity) * 0.6;
      } else {
        const { intensity: aiInt, scale } = getAIWaveIntensity(normalizedLayer, normalizedSeg, aiWaveParams);
        intensity = aiInt;
        scaleModifier = scale;
      }
      break;
    }

    case "solid":
      intensity = 0.5;
      scaleModifier = 1;
      break;

    default:
      intensity = 0.5;
      scaleModifier = 1;
      break;
  }

  // Deslocamento radial baseado na intensidade
  const displacement = (intensity - 0.5) * intensityMultiplier * 0.15;
  
  // Calcula direcao radial do centro
  const px = basePosition[0];
  const pz = basePosition[2];
  const dist = Math.sqrt(px * px + pz * pz);
  
  if (dist > 0.01) {
    return {
      dx: (px / dist) * displacement,
      dz: (pz / dist) * displacement,
      scale: scaleModifier
    };
  }
  
  return { dx: 0, dz: 0, scale: scaleModifier };
}

// Funcao legada para compatibilidade
function getInitialWaveDisplacement(
  layerIndex: number, 
  totalLayers: number, 
  basePosition: [number, number, number],
  waveIntensityMultiplier: number = 0.8
): { dx: number, dz: number } {
  const result = getInitialDisplacement(layerIndex, totalLayers, 0, 1, basePosition, "waveform", waveIntensityMultiplier);
  return { dx: result.dx, dz: result.dz };
}

// Cores para modo Waveform (azul como no grafico)
function getWaveformColor(normalizedY: number, intensity: number = 1, baseColor?: string): THREE.Color {
  const t = Math.min(1, Math.max(0, normalizedY)) * intensity;
  
  // Gradiente azul como no grafico de forma de onda
  const colors = [
    new THREE.Color(0x1a237e), // Azul muito escuro
    new THREE.Color(0x1565c0), // Azul escuro
    new THREE.Color(0x1e88e5), // Azul medio
    new THREE.Color(0x42a5f5), // Azul claro
    new THREE.Color(0x90caf9), // Azul bem claro
  ];
  
  // Se tem cor base, mistura com a cor base
  if (baseColor) {
    const base = new THREE.Color(baseColor);
    const scaledT = t * (colors.length - 1);
    const index = Math.floor(scaledT);
    const fraction = scaledT - index;
    const blueColor = index >= colors.length - 1 
      ? colors[colors.length - 1].clone() 
      : colors[index].clone().lerp(colors[index + 1], fraction);
    return blueColor.lerp(base, 0.3);
  }
  
  const scaledT = t * (colors.length - 1);
  const index = Math.floor(scaledT);
  const fraction = scaledT - index;
  if (index >= colors.length - 1) return colors[colors.length - 1].clone();
  return colors[index].clone().lerp(colors[index + 1], fraction);
}

// Cores para modo FFT (vermelho como no grafico)
function getFFTColor(normalizedY: number, intensity: number = 1, baseColor?: string): THREE.Color {
  const t = Math.min(1, Math.max(0, normalizedY)) * intensity;
  
  // Gradiente vermelho como no grafico FFT
  const colors = [
    new THREE.Color(0x4a0000), // Vermelho muito escuro
    new THREE.Color(0x8b0000), // Vermelho escuro
    new THREE.Color(0xcd5c5c), // Vermelho medio
    new THREE.Color(0xf08080), // Vermelho claro
    new THREE.Color(0xffcccb), // Rosa claro
  ];
  
  if (baseColor) {
    const base = new THREE.Color(baseColor);
    const scaledT = t * (colors.length - 1);
    const index = Math.floor(scaledT);
    const fraction = scaledT - index;
    const redColor = index >= colors.length - 1 
      ? colors[colors.length - 1].clone() 
      : colors[index].clone().lerp(colors[index + 1], fraction);
    return redColor.lerp(base, 0.3);
  }
  
  const scaledT = t * (colors.length - 1);
  const index = Math.floor(scaledT);
  const fraction = scaledT - index;
  if (index >= colors.length - 1) return colors[colors.length - 1].clone();
  return colors[index].clone().lerp(colors[index + 1], fraction);
}

// Cores para modo STFT/Spectrogram (roxo-magenta-amarelo como no grafico)
function getSTFTColor(normalizedY: number, intensity: number = 1, baseColor?: string): THREE.Color {
  const t = Math.min(1, Math.max(0, normalizedY)) * intensity;
  
  // Gradiente STFT como no grafico
  const colors = [
    new THREE.Color(0x0d0221), // Preto/azul muito escuro
    new THREE.Color(0x3d1a5c), // Roxo escuro
    new THREE.Color(0x9c3f8a), // Magenta
    new THREE.Color(0xe87777), // Rosa salmao
    new THREE.Color(0xffd866), // Amarelo
  ];
  
  if (baseColor) {
    const base = new THREE.Color(baseColor);
    const scaledT = t * (colors.length - 1);
    const index = Math.floor(scaledT);
    const fraction = scaledT - index;
    const stftColor = index >= colors.length - 1 
      ? colors[colors.length - 1].clone() 
      : colors[index].clone().lerp(colors[index + 1], fraction);
    return stftColor.lerp(base, 0.25);
  }
  
  const scaledT = t * (colors.length - 1);
  const index = Math.floor(scaledT);
  const fraction = scaledT - index;
  if (index >= colors.length - 1) return colors[colors.length - 1].clone();
  return colors[index].clone().lerp(colors[index + 1], fraction);
}

// Cores para modo Combinado (mistura de todos)
function getCombinedColor(normalizedY: number, intensity: number = 1, baseColor?: string): THREE.Color {
  const waveColor = getWaveformColor(normalizedY, intensity, baseColor);
  const fftColor = getFFTColor(normalizedY, intensity, baseColor);
  const stftColor = getSTFTColor(normalizedY, intensity, baseColor);
  
  // Mistura as tres cores
  const combined = waveColor.clone();
  combined.lerp(fftColor, 0.33);
  combined.lerp(stftColor, 0.33);
  
  return combined;
}

// Funcao principal que seleciona a cor baseado no modo de textura
function getTextureColor(
  normalizedY: number,
  intensity: number = 1,
  baseColor?: string,
  textureMode: string = "waveform",
  aiWaveParams?: AIWaveParams | null
): THREE.Color {
  switch (textureMode) {
    case "waveform":
      return getWaveformColor(normalizedY, intensity, baseColor);
    case "fft":
      return getFFTColor(normalizedY, intensity, baseColor);
    case "spectrogram":
      return getSTFTColor(normalizedY, intensity, baseColor);
    case "combined":
      return getCombinedColor(normalizedY, intensity, baseColor);
    case "ai-image":
      return aiWaveParams
        ? getAIWaveColor(normalizedY, intensity, aiWaveParams)
        : getWaveformColor(normalizedY, intensity, baseColor);
    default:
      return getWaveformColor(normalizedY, intensity, baseColor);
  }
}

// Gera gradiente de cores baseado na cor do movel e no espectrograma STFT
// A cor base influencia as tonalidades, mantendo o padrao de intensidade do espectrograma
function getSpectrogramColor(normalizedY: number, intensity: number = 1, baseColor?: string): THREE.Color {
  const base = new THREE.Color(baseColor || "#8B4513");
  const hsl = { h: 0, s: 0, l: 0 };
  base.getHSL(hsl);
  
  // Cria gradiente baseado na cor do movel
  // Base escura -> tons medios baseados na cor -> cor clara/brilhante no topo
  const t = Math.min(1, Math.max(0, normalizedY)) * intensity;
  
  // Ajusta saturacao e luminosidade baseado na posicao
  // Base: muito escuro, Meio: cor saturada, Topo: cor clara/brilhante
  let newH = hsl.h;
  let newS = hsl.s;
  let newL = hsl.l;
  
  if (t < 0.3) {
    // Base escura - desaturada e escura
    newS = hsl.s * 0.3;
    newL = 0.05 + t * 0.15;
  } else if (t < 0.6) {
    // Meio - cor saturada
    const midT = (t - 0.3) / 0.3;
    newS = hsl.s * (0.3 + midT * 0.7);
    newL = 0.2 + midT * 0.25;
    // Leve shift de hue para criar variacao
    newH = hsl.h + (midT * 0.05);
  } else {
    // Topo - cor brilhante/clara
    const topT = (t - 0.6) / 0.4;
    newS = hsl.s * (1 - topT * 0.3);
    newL = 0.45 + topT * 0.35;
    // Shift de hue para tons mais claros/quentes
    newH = hsl.h + 0.05 + (topT * 0.08);
  }
  
  // Normaliza hue
  newH = ((newH % 1) + 1) % 1;
  
  return new THREE.Color().setHSL(newH, Math.min(1, newS), Math.min(1, newL));
}

interface SegmentProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale: [number, number, number];
  color: THREE.Color;
  timeOffset: number;
  frequencyIndex: number;
  layerIndex: number;
  totalLayers: number;
}

// Segmento individual que reage a forma de onda
function Segment({ 
  position, 
  rotation = [0, 0, 0],
  scale, 
  color, 
  timeOffset, 
  frequencyIndex,
  layerIndex,
  totalLayers
}: SegmentProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { params } = useFurniture();
  
  // Calcula a posicao base (centro do raio, sem deslocamento de onda)
  const basePosition = useRef<[number, number, number]>((() => {
    const px = position[0];
    const pz = position[2];
    const dist = Math.sqrt(px * px + pz * pz);
    if (dist > 0.01) {
      const { dx, dz } = getInitialWaveDisplacement(layerIndex, totalLayers, position, 0.8);
      return [position[0] - dx, position[1], position[2] - dz] as [number, number, number];
    }
    return position;
  })());
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Animacao apenas no modo waveform, outros modos mantem forma estatica
    if (params.animationPaused || params.textureMode !== "waveform") return;

    const time = state.clock.elapsedTime * params.animationSpeed;
    const normalizedLayer = layerIndex / Math.max(totalLayers - 1, 1);
    const normalizedSeg = frequencyIndex / Math.max(totalLayers, 1);

    // Forma de onda: variacao temporal com amplitude
    const waveAmp = getWaveformIntensity(normalizedLayer, time + timeOffset);
    const angularWave = Math.sin(normalizedSeg * Math.PI * 8 + time * 2) * 0.3;
    const intensity = waveAmp + angularWave * waveAmp * 0.5;

    // Deslocamento radial baseado na intensidade calculada
    const displacement = (intensity - 0.5) * params.waveIntensity * 0.08;

    // Calcula direcao radial do centro
    const base = basePosition.current;
    const dx = base[0];
    const dz = base[2];
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist > 0.01) {
      const dirX = dx / dist;
      const dirZ = dz / dist;
      meshRef.current.position.x = base[0] + dirX * displacement;
      meshRef.current.position.z = base[2] + dirZ * displacement;
    }

    // Rotacao baseada na intensidade
    const rotationAmount = intensity * params.waveIntensity * Math.PI * 0.12;
    meshRef.current.rotation.x = rotation[0] + rotationAmount * 0.25;
    meshRef.current.rotation.z = rotation[2] + Math.sin(time * 1.5 + timeOffset) * 0.08 * params.waveIntensity;

    // Escala pulsante baseada na intensidade
    const scalePulse = 1 + ((intensity - 0.5) * 0.3 * params.fftIntensity);
    meshRef.current.scale.set(scale[0] * scalePulse, scale[1], scale[2] * scalePulse);
  });
  
  return (
    <mesh ref={meshRef} position={position} rotation={rotation} scale={scale}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial 
        color={color} 
        roughness={0.3}
        metalness={0.3}
        emissive={color}
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}

// Fio/linha conectando segmentos - mais visivel
interface WireProps {
  points: [number, number, number][];
  color?: string;
  lineWidth?: number;
}

function Wire({ points, color = "#888888", lineWidth = 1 }: WireProps) {
  return (
    <Line
      points={points}
      color={color}
      lineWidth={lineWidth}
      transparent
      opacity={0.6}
    />
  );
}

// Gera segmentos para uma barra/perna vertical com fios visiveis
function generateBarSegmentsWithWires(
  thickness: number,
  height: number,
  position: [number, number, number],
  segmentHeight: number,
  baseY: number,
  totalHeight: number,
  baseColor?: string
): { segments: Array<SegmentProps & { key: string }>, wires: Array<{ key: string, points: [number, number, number][], color?: string }> } {
  const segments: Array<SegmentProps & { key: string }> = [];
  const wires: Array<{ key: string, points: [number, number, number][], color?: string }> = [];
  
  const layers = Math.max(8, Math.floor(height / segmentHeight));
  const segHeight = height / layers;
  const segSize = thickness * 0.7;
  
  let prevPosition: [number, number, number] | null = null;
  
  for (let i = 0; i < layers; i++) {
    const x = position[0];
    const y = position[1] - height / 2 + segHeight / 2 + i * segHeight;
    const z = position[2];
    
    const normalizedY = (y - baseY) / totalHeight;
    const color = getSpectrogramColor(normalizedY, 1, baseColor);
    
    const segPos: [number, number, number] = [x, y, z];
    
    segments.push({
      key: `bar-${position[0].toFixed(3)}-${position[2].toFixed(3)}-${i}`,
      position: segPos,
      scale: [segSize, segHeight * 0.5, segSize],
      color,
      timeOffset: i * 0.1,
      frequencyIndex: i,
      layerIndex: i,
      totalLayers: layers,
    });
    
    // Fio vertical conectando segmentos - cor baseada no gradiente
    if (prevPosition) {
      const wireColor = getSpectrogramColor(normalizedY * 0.8, 1, baseColor);
      wires.push({
        key: `wire-v-${position[0].toFixed(3)}-${position[2].toFixed(3)}-${i}`,
        points: [prevPosition, segPos],
        color: `#${wireColor.getHexString()}`
      });
    }
    
    prevPosition = segPos;
  }
  
  return { segments, wires };
}

// Gera segmentos para um cilindro/cone com fios visiveis como na imagem de referencia
function generateCylinderSegmentsWithWires(
  topRadius: number,
  bottomRadius: number,
  height: number,
  position: [number, number, number],
  segmentHeight: number,
  baseY: number,
  totalHeight: number,
  segmentsPerRing: number,
  baseColor?: string,
  textureMode: string = "waveform",
  aiWaveParams?: AIWaveParams | null
): { segments: Array<SegmentProps & { key: string }>, wires: Array<{ key: string, points: [number, number, number][], color?: string }> } {
  const segments: Array<SegmentProps & { key: string }> = [];
  const wires: Array<{ key: string, points: [number, number, number][], color?: string }> = [];
  
  const layers = Math.max(20, Math.floor(height / segmentHeight));
  const segHeight = height / layers;
  
  let prevLayerPositions: [number, number, number][] = [];
  
  for (let layer = 0; layer < layers; layer++) {
    const normalizedLayer = layer / (layers - 1 || 1);
    const y = position[1] - height / 2 + segHeight / 2 + layer * segHeight;
    const currentRadius = bottomRadius + (topRadius - bottomRadius) * normalizedLayer;
    
    const normalizedY = (y - baseY) / totalHeight;
    const currentLayerPositions: [number, number, number][] = [];
    const layerColor = getTextureColor(normalizedY, 1, baseColor, textureMode, aiWaveParams);

    for (let seg = 0; seg < segmentsPerRing; seg++) {
      const angle = (seg / segmentsPerRing) * Math.PI * 2;
      const baseX = position[0] + Math.cos(angle) * currentRadius;
      const baseZ = position[2] + Math.sin(angle) * currentRadius;

      // Aplica deslocamento inicial baseado no modo de textura
      const { dx, dz, scale: scaleModifier } = getInitialDisplacement(
        layer, layers, seg, segmentsPerRing, [baseX, y, baseZ], textureMode, 0.8, aiWaveParams
      );
      const x = baseX + dx;
      const z = baseZ + dz;

      const color = getTextureColor(normalizedY, seg / segmentsPerRing, baseColor, textureMode, aiWaveParams);

      // Segmentos pequenos e finos - tamanho varia com o modo
      const circumference = 2 * Math.PI * currentRadius;
      const segWidth = (circumference / segmentsPerRing) * 0.65 * scaleModifier;
      const segDepth = 0.012 * scaleModifier;
      
      const segPos: [number, number, number] = [x, y, z];
      currentLayerPositions.push(segPos);
      
      segments.push({
        key: `cyl-${layer}-${seg}`,
        position: segPos,
        rotation: [0, -angle + Math.PI / 2, 0],
        scale: [segWidth, segHeight * 0.4 * scaleModifier, segDepth],
        color,
        timeOffset: layer * 0.08 + seg * 0.03,
        frequencyIndex: seg,
        layerIndex: layer,
        totalLayers: layers,
      });
      
      // Fios verticais conectando camadas (seguem o deslocamento)
      if (prevLayerPositions.length > 0) {
        const prevIdx = seg % prevLayerPositions.length;
        wires.push({
          key: `wire-v-${layer}-${seg}`,
          points: [prevLayerPositions[prevIdx], segPos],
          color: `#${layerColor.clone().multiplyScalar(0.7).getHexString()}`
        });
        
        // Fios diagonais criando padrao de rede (como na imagem)
        if (layer % 3 === 0) {
          const nextPrevIdx = (seg + 1) % prevLayerPositions.length;
          wires.push({
            key: `wire-d-${layer}-${seg}`,
            points: [prevLayerPositions[nextPrevIdx], segPos],
            color: `#${layerColor.clone().multiplyScalar(0.5).getHexString()}`
          });
        }
      }
      
      // Fios horizontais conectando segmentos na mesma camada
      if (seg > 0) {
        wires.push({
          key: `wire-h-${layer}-${seg}`,
          points: [currentLayerPositions[seg - 1], segPos],
          color: `#${layerColor.clone().multiplyScalar(0.6).getHexString()}`
        });
      }
    }
    
    // Fecha o anel
    if (currentLayerPositions.length > 1) {
      wires.push({
        key: `wire-h-${layer}-close`,
        points: [currentLayerPositions[currentLayerPositions.length - 1], currentLayerPositions[0]],
        color: `#${layerColor.clone().multiplyScalar(0.6).getHexString()}`
      });
    }
    
    prevLayerPositions = currentLayerPositions;
  }
  
  return { segments, wires };
}

// Gera segmentos para um semicilindro/semicone (meio circulo) - para encosto de cadeira
function generateSemicylinderSegmentsWithWires(
  topRadius: number,
  bottomRadius: number,
  height: number,
  position: [number, number, number],
  segmentHeight: number,
  baseY: number,
  totalHeight: number,
  segmentsPerRing: number,
  baseColor?: string,
  startAngle: number = -Math.PI / 2,
  arcAngle: number = Math.PI,
  textureMode: string = "waveform",
  aiWaveParams?: AIWaveParams | null
): { segments: Array<SegmentProps & { key: string }>, wires: Array<{ key: string, points: [number, number, number][], color?: string }> } {
  const segments: Array<SegmentProps & { key: string }> = [];
  const wires: Array<{ key: string, points: [number, number, number][], color?: string }> = [];
  
  const layers = Math.max(20, Math.floor(height / segmentHeight));
  const segHeight = height / layers;
  // Ajusta segmentos para semicirculo
  const actualSegments = Math.max(8, Math.floor(segmentsPerRing / 2));
  
  let prevLayerPositions: [number, number, number][] = [];
  
  for (let layer = 0; layer < layers; layer++) {
    const normalizedLayer = layer / (layers - 1 || 1);
    const y = position[1] - height / 2 + segHeight / 2 + layer * segHeight;
    const currentRadius = bottomRadius + (topRadius - bottomRadius) * normalizedLayer;
    
    const normalizedY = (y - baseY) / totalHeight;
    const currentLayerPositions: [number, number, number][] = [];
    const layerColor = getTextureColor(normalizedY, 1, baseColor, textureMode, aiWaveParams);

    for (let seg = 0; seg <= actualSegments; seg++) {
      // Distribui segmentos no arco especificado
      const angle = startAngle + (seg / actualSegments) * arcAngle;
      const baseX = position[0] + Math.cos(angle) * currentRadius;
      const baseZ = position[2] + Math.sin(angle) * currentRadius;

      // Aplica deslocamento inicial baseado no modo de textura
      const { dx, dz, scale: scaleModifier } = getInitialDisplacement(
        layer, layers, seg, actualSegments, [baseX, y, baseZ], textureMode, 0.8, aiWaveParams
      );
      const x = baseX + dx;
      const z = baseZ + dz;

      const color = getTextureColor(normalizedY, seg / actualSegments, baseColor, textureMode, aiWaveParams);

      // Segmentos pequenos e finos - tamanho varia com o modo
      const arcLength = arcAngle * currentRadius;
      const segWidth = (arcLength / actualSegments) * 0.65 * scaleModifier;
      const segDepth = 0.012 * scaleModifier;
      
      const segPos: [number, number, number] = [x, y, z];
      currentLayerPositions.push(segPos);
      
      segments.push({
        key: `semi-${layer}-${seg}`,
        position: segPos,
        rotation: [0, -angle + Math.PI / 2, 0],
        scale: [segWidth, segHeight * 0.4 * scaleModifier, segDepth],
        color,
        timeOffset: layer * 0.08 + seg * 0.03,
        frequencyIndex: seg,
        layerIndex: layer,
        totalLayers: layers,
      });
      
      // Fios verticais conectando camadas
      if (prevLayerPositions.length > 0 && seg < prevLayerPositions.length) {
        wires.push({
          key: `wire-v-${layer}-${seg}`,
          points: [prevLayerPositions[seg], segPos],
          color: `#${layerColor.clone().multiplyScalar(0.7).getHexString()}`
        });
        
        // Fios diagonais criando padrao de rede
        if (layer % 3 === 0 && seg < prevLayerPositions.length - 1) {
          wires.push({
            key: `wire-d-${layer}-${seg}`,
            points: [prevLayerPositions[seg + 1], segPos],
            color: `#${layerColor.clone().multiplyScalar(0.5).getHexString()}`
          });
        }
      }
      
      // Fios horizontais conectando segmentos na mesma camada
      if (seg > 0) {
        wires.push({
          key: `wire-h-${layer}-${seg}`,
          points: [currentLayerPositions[seg - 1], segPos],
          color: `#${layerColor.clone().multiplyScalar(0.6).getHexString()}`
        });
      }
    }
    
    prevLayerPositions = currentLayerPositions;
  }
  
  return { segments, wires };
}

// Gera paineis planos segmentados (retangulares) com ondas de audio
function generateFlatPanelSegmentsWithWires(
  width: number,
  height: number,
  position: [number, number, number],
  segmentHeight: number,
  baseY: number,
  totalHeight: number,
  segmentsPerRow: number,
  baseColor?: string,
  orientation: "front" | "back" = "front",
  textureMode: string = "waveform",
  aiWaveParams?: AIWaveParams | null
): { segments: Array<SegmentProps & { key: string }>, wires: Array<{ key: string, points: [number, number, number][], color?: string }> } {
  const segments: Array<SegmentProps & { key: string }> = [];
  const wires: Array<{ key: string, points: [number, number, number][], color?: string }> = [];
  
  const layers = Math.max(20, Math.floor(height / segmentHeight));
  const segHeight = height / layers;
  const actualSegments = Math.max(12, segmentsPerRow);
  const segWidth = width / actualSegments;
  
  let prevLayerPositions: [number, number, number][] = [];
  
  // Rotacao baseada na orientacao
  const rotationY = orientation === "front" ? 0 : Math.PI;
  // Direcao do deslocamento Z baseado na orientacao
  const zDirection = orientation === "front" ? 1 : -1;
  
  // Amplitude maxima do deslocamento
  const maxDisplacement = 0.04;
  
  for (let layer = 0; layer < layers; layer++) {
    const normalizedLayer = layer / (layers - 1 || 1);
    const y = position[1] - height / 2 + segHeight / 2 + layer * segHeight;
    
    const normalizedY = (y - baseY) / totalHeight;
    const currentLayerPositions: [number, number, number][] = [];
    const layerColor = getTextureColor(normalizedY, 1, baseColor, textureMode, aiWaveParams);

    for (let seg = 0; seg <= actualSegments; seg++) {
      const normalizedSeg = seg / actualSegments;

      // Distribui segmentos linearmente ao longo da largura
      const xOffset = -width / 2 + seg * segWidth;
      const baseX = position[0] + xOffset;
      const baseZ = position[2];

      // Calcula deslocamento Z baseado no modo de textura
      let zDisplacement = 0;
      let scaleModifier = 1;

      switch (textureMode) {
        case "waveform": {
          // Forma de onda: cada coluna e uma amostra no tempo, altura e a amplitude
          // Simula ondas sonoras com picos e vales variando ao longo da largura
          const timePhase = normalizedSeg * Math.PI * 8; // 4 ciclos completos
          const amplitude = getWaveformIntensity(normalizedSeg, 0); // Intensidade varia com posicao horizontal
          
          // Deslocamento em formato de onda senoidal modulada pela amplitude
          const waveform = Math.sin(timePhase) * amplitude;
          
          // A altura influencia a visibilidade da onda (mais forte no meio)
          const heightEnvelope = Math.sin(normalizedLayer * Math.PI);
          
          zDisplacement = waveform * heightEnvelope * maxDisplacement * 1.5;
          scaleModifier = 0.6 + Math.abs(waveform) * heightEnvelope * 0.6;
          break;
        }
        case "fft": {
          // FFT: espectro de frequencias - eixo X e frequencia, altura das barras e magnitude
          // Baixas frequencias (esquerda) tem mais energia, decai para direita
          const freqBin = normalizedSeg;
          const fftMagnitude = getFFTIntensity(freqBin);
          
          // Barras crescem de baixo pra cima ate a magnitude
          const barHeight = fftMagnitude;
          const isInBar = normalizedLayer < barHeight;
          
          if (isInBar) {
            // Dentro da barra - projecao proporcional a magnitude
            const barPosition = normalizedLayer / barHeight; // 0 na base, 1 no topo da barra
            zDisplacement = fftMagnitude * maxDisplacement * 2 * (1 - barPosition * 0.3);
            scaleModifier = 0.7 + fftMagnitude * 0.8;
          } else {
            // Acima da barra - sem projecao
            zDisplacement = 0;
            scaleModifier = 0.3;
          }
          break;
        }
        case "spectrogram": {
          // STFT/Espectrograma: matriz 2D de frequencia (Y) x tempo (X)
          // Cria padroes de "manchas" de energia como no espectrograma real
          const stftIntensity = getSTFTIntensity(normalizedLayer, seg, actualSegments);
          
          // Adiciona variacao de frequencia baseada na posicao vertical
          // Frequencias mais baixas (parte inferior) tem mais energia
          const freqWeight = 1 - normalizedLayer * 0.5;
          
          // Variacao temporal com diferentes "eventos" sonoros
          const timeVariation = Math.sin(normalizedSeg * Math.PI * 6) * 0.3 + 
                               Math.sin(normalizedSeg * Math.PI * 2.5) * 0.4;
          
          const combinedIntensity = stftIntensity * freqWeight * (0.7 + timeVariation * 0.3);
          
          zDisplacement = combinedIntensity * maxDisplacement * 2;
          scaleModifier = 0.5 + combinedIntensity * 0.9;
          break;
        }
        case "combined": {
          // Combinacao de todos os padroes
          const waveInt = getWaveformIntensity(normalizedSeg, 0);
          const fftInt = getFFTIntensity(normalizedSeg);
          const stftInt = getSTFTIntensity(normalizedLayer, seg, actualSegments);
          
          // Mistura os tres padroes
          const waveComponent = Math.sin(normalizedSeg * Math.PI * 6) * waveInt;
          const fftComponent = fftInt * (1 - normalizedLayer * 0.5);
          const stftComponent = stftInt;
          
          const combined = (waveComponent + fftComponent + stftComponent) / 2.5;
          
          zDisplacement = combined * maxDisplacement * 1.5;
          scaleModifier = 0.5 + Math.abs(combined) * 0.8;
          break;
        }
        case "ai-image": {
          if (!aiWaveParams) {
            const amp = getWaveformIntensity(normalizedSeg, 0);
            const wave = Math.sin(normalizedSeg * Math.PI * 8) * amp;
            const env = Math.sin(normalizedLayer * Math.PI);
            zDisplacement = wave * env * maxDisplacement * 1.5;
            scaleModifier = 0.6 + Math.abs(wave) * env * 0.6;
          } else {
            let baseAmp: number;
            if (normalizedLayer < 0.33) baseAmp = aiWaveParams.lowFreqAmplitude;
            else if (normalizedLayer < 0.66) {
              const t = (normalizedLayer - 0.33) / 0.33;
              baseAmp = aiWaveParams.lowFreqAmplitude * (1 - t) + aiWaveParams.midFreqAmplitude * t;
            } else {
              const t = (normalizedLayer - 0.66) / 0.34;
              baseAmp = aiWaveParams.midFreqAmplitude * (1 - t) + aiWaveParams.highFreqAmplitude * t;
            }
            const osc = 2 + Math.round(aiWaveParams.complexity * 6);
            const wave = Math.sin(normalizedSeg * Math.PI * 2 * osc) * baseAmp;
            const env = Math.sin(normalizedLayer * Math.PI);
            zDisplacement = wave * env * maxDisplacement * 1.5;
            scaleModifier = 0.5 + Math.abs(wave) * env * 0.7;
          }
          break;
        }
        default: {
          // Solid: sem ondulacao, apenas estrutura plana
          zDisplacement = 0;
          scaleModifier = 1;
          break;
        }
      }

      const x = baseX;
      const z = baseZ + zDisplacement * zDirection;

      const color = getTextureColor(normalizedY, normalizedSeg, baseColor, textureMode, aiWaveParams);

      const segPos: [number, number, number] = [x, y, z];
      currentLayerPositions.push(segPos);

      segments.push({
        key: `flat-${orientation}-${layer}-${seg}`,
        position: segPos,
        rotation: [0, rotationY, 0],
        scale: [segWidth * 0.8 * scaleModifier, segHeight * 0.6 * scaleModifier, 0.018 * scaleModifier],
        color,
        timeOffset: layer * 0.08 + seg * 0.03,
        frequencyIndex: seg,
        layerIndex: layer,
        totalLayers: layers,
      });
      
      // Fios verticais conectando camadas
      if (prevLayerPositions.length > 0 && seg < prevLayerPositions.length) {
        wires.push({
          key: `wire-v-${orientation}-${layer}-${seg}`,
          points: [prevLayerPositions[seg], segPos],
          color: `#${layerColor.clone().multiplyScalar(0.7).getHexString()}`
        });
        
        // Fios diagonais criando padrao de rede
        if (layer % 2 === 0 && seg < prevLayerPositions.length - 1) {
          wires.push({
            key: `wire-d-${orientation}-${layer}-${seg}`,
            points: [prevLayerPositions[seg + 1], segPos],
            color: `#${layerColor.clone().multiplyScalar(0.5).getHexString()}`
          });
        }
      }
      
      // Fios horizontais conectando segmentos na mesma camada
      if (seg > 0) {
        wires.push({
          key: `wire-h-${orientation}-${layer}-${seg}`,
          points: [currentLayerPositions[seg - 1], segPos],
          color: `#${layerColor.clone().multiplyScalar(0.6).getHexString()}`
        });
      }
    }
    
    prevLayerPositions = currentLayerPositions;
  }
  
  return { segments, wires };
}

// Gera paineis planos laterais segmentados (orientados no eixo X)
function generateLateralFlatPanelSegmentsWithWires(
  depth: number,
  height: number,
  position: [number, number, number],
  segmentHeight: number,
  baseY: number,
  totalHeight: number,
  segmentsPerRow: number,
  baseColor?: string,
  orientation: "left" | "right" = "left",
  textureMode: string = "waveform",
  aiWaveParams?: AIWaveParams | null
): { segments: Array<SegmentProps & { key: string }>, wires: Array<{ key: string, points: [number, number, number][], color?: string }> } {
  const segments: Array<SegmentProps & { key: string }> = [];
  const wires: Array<{ key: string, points: [number, number, number][], color?: string }> = [];
  
  const layers = Math.max(20, Math.floor(height / segmentHeight));
  const segHeight = height / layers;
  const actualSegments = Math.max(12, segmentsPerRow);
  const segDepth = depth / actualSegments;
  
  let prevLayerPositions: [number, number, number][] = [];
  
  // Rotacao baseada na orientacao (paineis laterais rotacionam em Y 90 graus)
  const rotationY = orientation === "left" ? Math.PI / 2 : -Math.PI / 2;
  // Direcao do deslocamento X baseado na orientacao
  const xDirection = orientation === "left" ? -1 : 1;
  
  // Amplitude maxima do deslocamento
  const maxDisplacement = 0.04;
  
  for (let layer = 0; layer < layers; layer++) {
    const normalizedLayer = layer / (layers - 1 || 1);
    const y = position[1] - height / 2 + segHeight / 2 + layer * segHeight;
    
    const normalizedY = (y - baseY) / totalHeight;
    const currentLayerPositions: [number, number, number][] = [];
    const layerColor = getTextureColor(normalizedY, 1, baseColor, textureMode, aiWaveParams);

    for (let seg = 0; seg <= actualSegments; seg++) {
      const normalizedSeg = seg / actualSegments;

      // Distribui segmentos linearmente ao longo da profundidade (eixo Z)
      const zOffset = -depth / 2 + seg * segDepth;
      const baseX = position[0];
      const baseZ = position[2] + zOffset;

      // Calcula deslocamento X baseado no modo de textura
      let xDisplacement = 0;
      let scaleModifier = 1;

      switch (textureMode) {
        case "waveform": {
          // Forma de onda: cada coluna e uma amostra no tempo, altura e a amplitude
          const timePhase = normalizedSeg * Math.PI * 8;
          const amplitude = getWaveformIntensity(normalizedSeg, 0);
          const waveform = Math.sin(timePhase) * amplitude;
          const heightEnvelope = Math.sin(normalizedLayer * Math.PI);
          xDisplacement = waveform * heightEnvelope * maxDisplacement * 1.5;
          scaleModifier = 0.6 + Math.abs(waveform) * heightEnvelope * 0.6;
          break;
        }
        case "fft": {
          // FFT: espectro de frequencias
          const freqBin = normalizedSeg;
          const fftMagnitude = getFFTIntensity(freqBin);
          const barHeight = fftMagnitude;
          const isInBar = normalizedLayer < barHeight;
          if (isInBar) {
            const barPosition = normalizedLayer / barHeight;
            xDisplacement = fftMagnitude * maxDisplacement * 2 * (1 - barPosition * 0.3);
            scaleModifier = 0.7 + fftMagnitude * 0.8;
          } else {
            xDisplacement = 0;
            scaleModifier = 0.3;
          }
          break;
        }
        case "spectrogram": {
          // STFT/Espectrograma
          const stftIntensity = getSTFTIntensity(normalizedLayer, seg, actualSegments);
          const freqWeight = 1 - normalizedLayer * 0.5;
          const timeVariation = Math.sin(normalizedSeg * Math.PI * 6) * 0.3 + 
                               Math.sin(normalizedSeg * Math.PI * 2.5) * 0.4;
          const combinedIntensity = stftIntensity * freqWeight * (0.7 + timeVariation * 0.3);
          xDisplacement = combinedIntensity * maxDisplacement * 2;
          scaleModifier = 0.5 + combinedIntensity * 0.9;
          break;
        }
        case "combined": {
          const waveInt = getWaveformIntensity(normalizedSeg, 0);
          const fftInt = getFFTIntensity(normalizedSeg);
          const stftInt = getSTFTIntensity(normalizedLayer, seg, actualSegments);
          const waveComponent = Math.sin(normalizedSeg * Math.PI * 6) * waveInt;
          const fftComponent = fftInt * (1 - normalizedLayer * 0.5);
          const stftComponent = stftInt;
          const combined = (waveComponent + fftComponent + stftComponent) / 2.5;
          xDisplacement = combined * maxDisplacement * 1.5;
          scaleModifier = 0.5 + Math.abs(combined) * 0.8;
          break;
        }
        case "ai-image": {
          if (!aiWaveParams) {
            const amp = getWaveformIntensity(normalizedSeg, 0);
            const wave = Math.sin(normalizedSeg * Math.PI * 8) * amp;
            const env = Math.sin(normalizedLayer * Math.PI);
            xDisplacement = wave * env * maxDisplacement * 1.5;
            scaleModifier = 0.6 + Math.abs(wave) * env * 0.6;
          } else {
            let baseAmp: number;
            if (normalizedLayer < 0.33) baseAmp = aiWaveParams.lowFreqAmplitude;
            else if (normalizedLayer < 0.66) {
              const t = (normalizedLayer - 0.33) / 0.33;
              baseAmp = aiWaveParams.lowFreqAmplitude * (1 - t) + aiWaveParams.midFreqAmplitude * t;
            } else {
              const t = (normalizedLayer - 0.66) / 0.34;
              baseAmp = aiWaveParams.midFreqAmplitude * (1 - t) + aiWaveParams.highFreqAmplitude * t;
            }
            const osc = 2 + Math.round(aiWaveParams.complexity * 6);
            const wave = Math.sin(normalizedSeg * Math.PI * 2 * osc) * baseAmp;
            const env = Math.sin(normalizedLayer * Math.PI);
            xDisplacement = wave * env * maxDisplacement * 1.5;
            scaleModifier = 0.5 + Math.abs(wave) * env * 0.7;
          }
          break;
        }
        default: {
          xDisplacement = 0;
          scaleModifier = 1;
          break;
        }
      }

      const x = baseX + xDisplacement * xDirection;
      const z = baseZ;

      const color = getTextureColor(normalizedY, normalizedSeg, baseColor, textureMode, aiWaveParams);

      const segPos: [number, number, number] = [x, y, z];
      currentLayerPositions.push(segPos);

      segments.push({
        key: `lateral-${orientation}-${layer}-${seg}`,
        position: segPos,
        rotation: [0, rotationY, 0],
        scale: [segDepth * 0.8 * scaleModifier, segHeight * 0.6 * scaleModifier, 0.018 * scaleModifier],
        color,
        timeOffset: layer * 0.08 + seg * 0.03,
        frequencyIndex: seg,
        layerIndex: layer,
        totalLayers: layers,
      });
      
      // Fios verticais conectando camadas
      if (prevLayerPositions.length > 0 && seg < prevLayerPositions.length) {
        wires.push({
          key: `wire-v-${orientation}-${layer}-${seg}`,
          points: [prevLayerPositions[seg], segPos],
          color: `#${layerColor.clone().multiplyScalar(0.7).getHexString()}`
        });
        
        if (layer % 2 === 0 && seg < prevLayerPositions.length - 1) {
          wires.push({
            key: `wire-d-${orientation}-${layer}-${seg}`,
            points: [prevLayerPositions[seg + 1], segPos],
            color: `#${layerColor.clone().multiplyScalar(0.5).getHexString()}`
          });
        }
      }
      
      // Fios horizontais
      if (seg > 0) {
        wires.push({
          key: `wire-h-${orientation}-${layer}-${seg}`,
          points: [currentLayerPositions[seg - 1], segPos],
          color: `#${layerColor.clone().multiplyScalar(0.6).getHexString()}`
        });
      }
    }
    
    prevLayerPositions = currentLayerPositions;
  }
  
  return { segments, wires };
}

// Tampa/base solida
function SolidCap({ 
  radius, 
  height, 
  position, 
  color = "#1a1a2e" 
}: { 
  radius: number; 
  height: number; 
  position: [number, number, number];
  color?: string;
}) {
  return (
    <mesh position={position}>
      <cylinderGeometry args={[radius, radius, height, 32]} />
      <meshStandardMaterial 
        color={color} 
        roughness={0.2}
        metalness={0.8}
      />
    </mesh>
  );
}

// Eixo central visivel
function CentralAxis({ 
  height, 
  position,
  radius = 0.012
}: { 
  height: number; 
  position: [number, number, number];
  radius?: number;
}) {
  return (
    <mesh position={position}>
      <cylinderGeometry args={[radius, radius, height, 8]} />
      <meshStandardMaterial 
        color="#00ddff"
        emissive="#00ddff"
        emissiveIntensity={0.4}
        roughness={0.3}
        metalness={0.5}
      />
    </mesh>
  );
}

// Cadeira Segmentada - com base conica como na mesa redonda
export function SegmentedChair({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const { params } = useFurniture();
  
  const {
    chairSeatWidth,
    chairSeatDepth,
    chairSeatHeight,
    chairBackHeight,
    chairLegHeight,
    chairColor,
    segmentsPerLayer,
    textureMode,
    aiWaveParams,
  } = params;

  const seatY = chairLegHeight + chairSeatHeight / 2;
  const totalHeight = chairLegHeight + chairSeatHeight + chairBackHeight;
  const segmentHeight = 0.012;
  
  // Base conica para as pernas (como na mesa redonda)
  const baseTopRadius = Math.min(chairSeatWidth, chairSeatDepth) * 0.35;
  const baseBottomRadius = Math.min(chairSeatWidth, chairSeatDepth) * 0.5;
  
  // Encosto - mesmo tamanho da base da cadeira
  const backTopRadius = baseTopRadius;
  const backBottomRadius = baseBottomRadius;
  
  const { baseSegments, baseWires, backSegments, backWires } = useMemo(() => {
    // Base das pernas - formato conico como na mesa redonda
    const { segments: baseSegs, wires: baseW } = generateCylinderSegmentsWithWires(
      baseTopRadius,
      baseBottomRadius,
      chairLegHeight,
      [0, chairLegHeight / 2, 0],
      segmentHeight,
      0,
      totalHeight,
      Math.floor(segmentsPerLayer * 0.8),
      chairColor,
      textureMode,
      aiWaveParams
    );

    // Encosto - formato semicirculo (apenas a parte de tras) - rente a borda do assento
    // Posiciona no centro (Z=0) para que o semicirculo fique na borda traseira do assento
    const { segments: backSegs, wires: backW } = generateSemicylinderSegmentsWithWires(
      backTopRadius,
      backBottomRadius,
      chairBackHeight,
      [0, seatY + chairBackHeight / 2 + chairSeatHeight / 2, 0],
      segmentHeight,
      chairLegHeight,
      totalHeight,
      Math.floor(segmentsPerLayer * 0.6),
      chairColor,
      -Math.PI,
      Math.PI,
      textureMode,
      aiWaveParams
    );
    
    return { 
      baseSegments: baseSegs, 
      baseWires: baseW,
      backSegments: backSegs.map(s => ({ ...s, key: `back-${s.key}` })),
      backWires: backW.map(w => ({ ...w, key: `back-${w.key}` }))
    };
  }, [chairSeatHeight, chairBackHeight, chairLegHeight, seatY, totalHeight, segmentHeight, segmentsPerLayer, baseTopRadius, baseBottomRadius, backTopRadius, backBottomRadius, chairColor, textureMode, aiWaveParams]);
  
  return (
    <group position={position}>
      {/* Assento solido */}
      <SolidCap 
        radius={Math.min(chairSeatWidth, chairSeatDepth) * 0.55} 
        height={chairSeatHeight * 1.5} 
        position={[0, seatY, 0]}
        color={chairColor}
      />
      
      {/* Base solida inferior */}
      <SolidCap 
        radius={baseBottomRadius * 1.15} 
        height={0.025} 
        position={[0, 0.0125, 0]}
        color="#1a1a2e"
      />
      
      {/* Eixo central da base */}
      <CentralAxis 
        height={chairLegHeight} 
        position={[0, chairLegHeight / 2, 0]}
        radius={0.012}
      />
      
      {/* Segmentos da base */}
      {baseSegments.map((seg) => (
        <Segment key={seg.key} {...(({ key: _k, ...rest }) => rest)(seg)} />
      ))}
      
      {/* Segmentos do encosto */}
      {backSegments.map((seg) => (
        <Segment key={seg.key} {...(({ key: _k, ...rest }) => rest)(seg)} />
      ))}
      
      {/* Fios da base */}
      {baseWires.map((wire) => (
        <Wire key={wire.key} points={wire.points} color={wire.color} lineWidth={1.2} />
      ))}
      
      {/* Fios do encosto */}
      {backWires.map((wire) => (
        <Wire key={wire.key} points={wire.points} color={wire.color} lineWidth={1.2} />
      ))}
    </group>
  );
}

// Mesa Segmentada - com base conica central como na mesa redonda
export function SegmentedTable({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const { params } = useFurniture();
  
  const {
    tableTopWidth,
    tableTopDepth,
    tableTopHeight,
    tableLegHeight,
    tableColor,
    segmentsPerLayer,
    textureMode,
    aiWaveParams,
  } = params;

  const topY = tableLegHeight + tableTopHeight / 2;
  const totalHeight = tableLegHeight + tableTopHeight;
  const segmentHeight = 0.012;
  
  // Base conica central (como na mesa redonda)
  const baseTopRadius = Math.min(tableTopWidth, tableTopDepth) * 0.25;
  const baseBottomRadius = Math.min(tableTopWidth, tableTopDepth) * 0.4;
  
  const { segments, wires } = useMemo(() => {
    return generateCylinderSegmentsWithWires(
      baseTopRadius,
      baseBottomRadius,
      tableLegHeight,
      [0, tableLegHeight / 2, 0],
      segmentHeight,
      0,
      totalHeight,
      segmentsPerLayer,
      tableColor,
      textureMode,
      aiWaveParams
    );
  }, [tableLegHeight, totalHeight, segmentHeight, segmentsPerLayer, baseTopRadius, baseBottomRadius, tableColor, textureMode, aiWaveParams]);
  
  return (
    <group position={position}>
      {/* Tampo solido */}
      <mesh position={[0, topY, 0]} castShadow receiveShadow>
        <boxGeometry args={[tableTopWidth, tableTopHeight, tableTopDepth]} />
        <meshStandardMaterial color={tableColor} roughness={0.5} metalness={0.2} />
      </mesh>
      
      {/* Base solida inferior */}
      <SolidCap 
        radius={baseBottomRadius * 1.15} 
        height={0.025} 
        position={[0, 0.0125, 0]}
        color="#1a1a2e"
      />
      
      {/* Eixo central */}
      <CentralAxis 
        height={tableLegHeight} 
        position={[0, tableLegHeight / 2, 0]}
        radius={0.015}
      />
      
      {/* Segmentos */}
      {segments.map((seg) => (
        <Segment key={seg.key} {...(({ key: _k, ...rest }) => rest)(seg)} />
      ))}
      
      {/* Fios */}
      {wires.map((wire) => (
        <Wire key={wire.key} points={wire.points} color={wire.color} lineWidth={1.2} />
      ))}
    </group>
  );
}

// Mesa Redonda Segmentada
export function SegmentedRoundTable({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const { params } = useFurniture();
  
  const {
    roundTableTopRadius,
    roundTableTopHeight,
    roundTableBaseTopRadius,
    roundTableBaseBottomRadius,
    roundTableBaseHeight,
    roundTableColor,
    segmentsPerLayer,
    textureMode,
    aiWaveParams,
  } = params;

  const totalHeight = roundTableBaseHeight + roundTableTopHeight;
  const segmentHeight = 0.015;
  
  const { segments, wires } = useMemo(() => {
    return generateCylinderSegmentsWithWires(
      roundTableBaseTopRadius,
      roundTableBaseBottomRadius,
      roundTableBaseHeight,
      [0, roundTableBaseHeight / 2, 0],
      segmentHeight,
      0,
      totalHeight,
      segmentsPerLayer,
      roundTableColor,
      textureMode,
      aiWaveParams
    );
  }, [roundTableBaseTopRadius, roundTableBaseBottomRadius, roundTableBaseHeight, segmentHeight, totalHeight, segmentsPerLayer, roundTableColor, textureMode, aiWaveParams]);
  
  return (
    <group position={position}>
      {/* Tampo solido */}
      <SolidCap 
        radius={roundTableTopRadius} 
        height={roundTableTopHeight} 
        position={[0, roundTableBaseHeight + roundTableTopHeight / 2, 0]}
        color={roundTableColor}
      />
      
      {/* Base solida */}
      <SolidCap 
        radius={roundTableBaseBottomRadius * 1.15} 
        height={0.025} 
        position={[0, 0.0125, 0]}
        color="#1a1a2e"
      />
      
      {/* Eixo central */}
      <CentralAxis 
        height={roundTableBaseHeight} 
        position={[0, roundTableBaseHeight / 2, 0]}
        radius={0.015}
      />
      
      {/* Segmentos */}
      {segments.map((seg) => (
        <Segment key={seg.key} {...(({ key: _k, ...rest }) => rest)(seg)} />
      ))}
      
      {/* Fios - mais visiveis */}
      {wires.map((wire) => (
        <Wire key={wire.key} points={wire.points} color={wire.color} lineWidth={1.2} />
      ))}
    </group>
  );
}

// Banco Mehinaku Segmentado - com dois paineis planos nas bordas
export function SegmentedBancoMehinaku({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const { params } = useFurniture();
  
  const {
    bancoMehinakuTopWidth,
    bancoMehinakuTopDepth,
    bancoMehinakuTopHeight,
    bancoMehinakuLegHeight,
    bancoMehinakuColor,
    segmentsPerLayer,
    textureMode,
    aiWaveParams,
  } = params;

  const topY = bancoMehinakuLegHeight + bancoMehinakuTopHeight / 2;
  const totalHeight = bancoMehinakuLegHeight + bancoMehinakuTopHeight;
  const segmentHeight = 0.012;
  
  // Largura dos paineis planos (um pouco menor que a largura do tampo)
  const panelWidth = bancoMehinakuTopWidth * 0.7;
  const cornerRadius = bancoMehinakuTopDepth * 0.4; // Raio das pontas curvas
  
  // Gera dois paineis planos nas bordas da tampa
  const { frontSegments, frontWires, backSegments, backWires } = useMemo(() => {
    // Painel frontal (na borda frontal da tampa)
    const { segments: frontSegs, wires: frontW } = generateFlatPanelSegmentsWithWires(
      panelWidth,
      bancoMehinakuLegHeight,
      [0, bancoMehinakuLegHeight / 2, bancoMehinakuTopDepth / 2 - 0.02],
      segmentHeight,
      0,
      totalHeight,
      Math.floor(segmentsPerLayer * 0.6),
      bancoMehinakuColor,
      "front",
      textureMode,
      aiWaveParams
    );

    // Painel traseiro (na borda traseira da tampa)
    const { segments: backSegs, wires: backW } = generateFlatPanelSegmentsWithWires(
      panelWidth,
      bancoMehinakuLegHeight,
      [0, bancoMehinakuLegHeight / 2, -bancoMehinakuTopDepth / 2 + 0.02],
      segmentHeight,
      0,
      totalHeight,
      Math.floor(segmentsPerLayer * 0.6),
      bancoMehinakuColor,
      "back",
      textureMode,
      aiWaveParams
    );
    
    return { 
      frontSegments: frontSegs, 
      frontWires: frontW,
      backSegments: backSegs.map(s => ({ ...s, key: `back-${s.key}` })),
      backWires: backW.map(w => ({ ...w, key: `back-${w.key}` }))
    };
  }, [bancoMehinakuTopDepth, bancoMehinakuLegHeight, totalHeight, segmentHeight, segmentsPerLayer, panelWidth, bancoMehinakuColor, textureMode, aiWaveParams]);
  
  // Geometria do tampo com pontas curvas
  const topGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const w = bancoMehinakuTopWidth / 2;
    const d = bancoMehinakuTopDepth / 2;
    const r = Math.min(cornerRadius, w, d);
    
    shape.moveTo(-w + r, -d);
    shape.lineTo(w - r, -d);
    shape.quadraticCurveTo(w, -d, w, -d + r);
    shape.lineTo(w, d - r);
    shape.quadraticCurveTo(w, d, w - r, d);
    shape.lineTo(-w + r, d);
    shape.quadraticCurveTo(-w, d, -w, d - r);
    shape.lineTo(-w, -d + r);
    shape.quadraticCurveTo(-w, -d, -w + r, -d);
    
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
    <group position={position}>
      {/* Tampo retangular com pontas curvas */}
      <group position={[0, topY, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh position={[0, 0, -bancoMehinakuTopHeight / 2]} geometry={topGeometry} receiveShadow>
          <meshStandardMaterial color={bancoMehinakuColor} />
        </mesh>
      </group>
      
      {/* Segmentos - semicirculo frontal */}
      {frontSegments.map((seg) => (
        <Segment key={seg.key} {...(({ key: _k, ...rest }) => rest)(seg)} />
      ))}
      
      {/* Segmentos - semicirculo traseiro */}
      {backSegments.map((seg) => (
        <Segment key={seg.key} {...(({ key: _k, ...rest }) => rest)(seg)} />
      ))}
      
      {/* Fios - frontal */}
      {frontWires.map((wire) => (
        <Wire key={wire.key} points={wire.points} color={wire.color} lineWidth={1.2} />
      ))}
      
      {/* Fios - traseiro */}
      {backWires.map((wire) => (
        <Wire key={wire.key} points={wire.points} color={wire.color} lineWidth={1.2} />
      ))}
    </group>
  );
}

// Banco Wauja Segmentado - com dois paineis planos nas bordas laterais
export function SegmentedBancoWauja({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const { params } = useFurniture();
  
  const {
    bancoWaujaWidth,
    bancoWaujaDepth,
    bancoWaujaHeight,
    bancoWaujaColor,
    segmentsPerLayer,
    textureMode,
    aiWaveParams,
  } = params;

  const totalHeight = bancoWaujaHeight;
  const segmentHeight = 0.012;
  
  // Profundidade dos paineis planos laterais
  const panelDepth = bancoWaujaDepth * 0.85;
  
  const { leftSegments, leftWires, rightSegments, rightWires } = useMemo(() => {
    // Painel esquerdo (lateral esquerda)
    const { segments: leftSegs, wires: leftW } = generateLateralFlatPanelSegmentsWithWires(
      panelDepth,
      bancoWaujaHeight,
      [-bancoWaujaWidth / 2 + 0.02, bancoWaujaHeight / 2, 0],
      segmentHeight,
      0,
      totalHeight,
      Math.floor(segmentsPerLayer * 0.6),
      bancoWaujaColor,
      "left",
      textureMode,
      aiWaveParams
    );

    // Painel direito (lateral direita)
    const { segments: rightSegs, wires: rightW } = generateLateralFlatPanelSegmentsWithWires(
      panelDepth,
      bancoWaujaHeight,
      [bancoWaujaWidth / 2 - 0.02, bancoWaujaHeight / 2, 0],
      segmentHeight,
      0,
      totalHeight,
      Math.floor(segmentsPerLayer * 0.6),
      bancoWaujaColor,
      "right",
      textureMode,
      aiWaveParams
    );
    
    return { 
      leftSegments: leftSegs, 
      leftWires: leftW,
      rightSegments: rightSegs.map(s => ({ ...s, key: `right-${s.key}` })),
      rightWires: rightW.map(w => ({ ...w, key: `right-${w.key}` }))
    };
  }, [bancoWaujaWidth, bancoWaujaHeight, totalHeight, segmentHeight, segmentsPerLayer, panelDepth, bancoWaujaColor, textureMode, aiWaveParams]);
  
  return (
    <group position={position}>
      {/* Tampo superior solido */}
      <mesh position={[0, bancoWaujaHeight - 0.015, 0]} castShadow receiveShadow>
        <boxGeometry args={[bancoWaujaWidth, 0.03, bancoWaujaDepth]} />
        <meshStandardMaterial color={bancoWaujaColor} />
      </mesh>
      
      {/* Segmentos - painel esquerdo */}
      {leftSegments.map((seg) => (
        <Segment key={seg.key} {...(({ key: _k, ...rest }) => rest)(seg)} />
      ))}
      
      {/* Segmentos - painel direito */}
      {rightSegments.map((seg) => (
        <Segment key={seg.key} {...(({ key: _k, ...rest }) => rest)(seg)} />
      ))}
      
      {/* Fios - esquerdo */}
      {leftWires.map((wire) => (
        <Wire key={wire.key} points={wire.points} color={wire.color} lineWidth={1.0} />
      ))}
      
      {/* Fios - direito */}
      {rightWires.map((wire) => (
        <Wire key={wire.key} points={wire.points} color={wire.color} lineWidth={1.0} />
      ))}
    </group>
  );
}
