"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { useFurniture, TextureMode } from "@/lib/furniture-context";

type Point = [number, number, number];

const HEIGHT = 0.82;
const BASE_Y = 0.06;
const TOP_Y = 0.91;
const TOP_RADIUS = 0.43;
const BASE_RADIUS = 0.31;
const RING_RADIUS = 0.0046;
const THREAD_RADIUS = 0.0047;

const BASE_COLOR = "#a94f2b";
const BASE_COLOR_DARK = "#8f3f24";
const ACCENT_COLOR = "#e7cd97";

function signal(index: number, total: number, mode: TextureMode, intensity: number) {
  const t = total <= 1 ? 0 : index / (total - 1);
  const waveform = 0.5 + 0.5 * Math.sin(t * Math.PI * 8.5);
  const fft = 0.25 + 0.75 * Math.exp(-t * 1.8) * (0.72 + 0.28 * Math.sin(t * Math.PI * 7));
  const stft = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * Math.PI * 5)) * (0.7 + 0.3 * Math.cos(t * Math.PI * 2));
  const value = mode === "fft" ? fft : mode === "spectrogram" ? stft : mode === "combined" ? (waveform + fft + stft) / 3 : mode === "ai-image" ? waveform * 0.65 + stft * 0.35 : waveform;
  return THREE.MathUtils.lerp(0.82, value, Math.min(1, intensity));
}

// Desenho embutido no tecido: faixas horizontais que ondulam ao redor do banco,
// imitando a forma de onda do modo de textura de áudio. Retorna true no traço bege.
function isAccent(angle: number, h: number, mode: TextureMode, intensity: number) {
  const amp = 0.055 + Math.min(1, intensity) * 0.07;
  const band = 0.05;
  let centers: number[];
  let freq: number;
  if (mode === "fft") {
    centers = [0.3, 0.48, 0.64, 0.79];
    freq = 5;
  } else if (mode === "spectrogram") {
    centers = [0.26, 0.4, 0.54, 0.68, 0.82];
    freq = 9;
  } else if (mode === "combined") {
    centers = [0.3, 0.45, 0.6, 0.75];
    freq = 6;
  } else {
    centers = [0.34, 0.52, 0.7];
    freq = 7;
  }
  for (let i = 0; i < centers.length; i++) {
    const dir = i % 2 === 0 ? 1 : -1;
    const center = centers[i] + dir * amp * Math.sin(angle * freq + i * 0.9);
    if (Math.abs(h - center) < band) return true;
  }
  return false;
}

function Yarn({ points, color, radius = THREAD_RADIUS }: { points: Point[]; color: string; radius?: number }) {
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)));
    return new THREE.TubeGeometry(curve, Math.max(8, points.length * 3), radius, 6, false);
  }, [points, radius]);
  return <mesh geometry={geometry} castShadow receiveShadow><meshBasicMaterial color={color} /></mesh>;
}

function Ring({ y, radius, color = "#8d8b84", wave = 0 }: { y: number; radius: number; color?: string; wave?: number }) {
  const points = useMemo(() => Array.from({ length: 65 }, (_, index) => {
    const angle = (index / 64) * Math.PI * 2;
    const pulse = wave * Math.sin(angle * 6 + y * 8);
    return [Math.cos(angle) * (radius + pulse), y + wave * 0.35 * Math.sin(angle * 6 + 0.8), Math.sin(angle) * (radius + pulse)] as Point;
  }), [radius, y, wave]);
  return <Yarn points={points} color={color} radius={RING_RADIUS} />;
}

function LeatherTop() {
  return (
    <group position={[0, TOP_Y + 0.045, 0]}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[TOP_RADIUS, TOP_RADIUS, 0.1, 48]} />
        <meshStandardMaterial color="#80502e" roughness={0.7} />
      </mesh>
      <Ring y={0.055} radius={TOP_RADIUS * 0.98} color="#a8784a" />
    </group>
  );
}

export function BancoTecido({ position = [0, 0, 0] as Point }) {
  const { params } = useFurniture();
  const mode = params.textureMode === "solid" ? "waveform" : params.textureMode;
  const intensity = params.textureMode === "fft" ? params.fftIntensity : params.textureMode === "spectrogram" ? params.spectrogramIntensity : params.waveIntensity;

  // Muitos fios finos e encostados formam a superfície de tecido. Cada fio é dividido em
  // segmentos verticais coloridos (base ou bege) para desenhar o padrão de ondas na malha.
  const verticalCount = 200;
  const segmentsPerThread = 40;
  const horizontalCount = 26;

  const { baseGeometry, accentGeometry } = useMemo(() => {
    const baseParts: THREE.BufferGeometry[] = [];
    const accentParts: THREE.BufferGeometry[] = [];

    for (let i = 0; i < verticalCount; i++) {
      const angle = (i / verticalCount) * Math.PI * 2;
      const value = signal(i, verticalCount, mode, intensity);
      const sway = (value - 0.5) * 0.012;
      const wave = Math.sin(angle * 6) * (0.004 + intensity * 0.01);
      const x = Math.cos(angle) * BASE_RADIUS;
      const z = Math.sin(angle) * BASE_RADIUS;

      const controlPoints = [
        new THREE.Vector3(x, BASE_Y, z),
        new THREE.Vector3(x + sway + wave, BASE_Y + HEIGHT * 0.25, z + sway),
        new THREE.Vector3(x - wave, BASE_Y + HEIGHT * 0.58, z + wave),
        new THREE.Vector3(x, TOP_Y, z),
      ];
      const curve = new THREE.CatmullRomCurve3(controlPoints);
      const pts = curve.getSpacedPoints(segmentsPerThread);

      for (let k = 0; k < segmentsPerThread; k++) {
        const h = (k + 0.5) / segmentsPerThread;
        const segCurve = new THREE.LineCurve3(pts[k], pts[k + 1]);
        const tube = new THREE.TubeGeometry(segCurve, 1, THREAD_RADIUS, 6, false);
        if (isAccent(angle, h, mode, intensity)) accentParts.push(tube);
        else baseParts.push(tube);
      }
    }

    return {
      baseGeometry: mergeGeometries(baseParts, false),
      accentGeometry: accentParts.length ? mergeGeometries(accentParts, false) : null,
    };
  }, [mode, intensity]);

  const horizontalRings = useMemo(() => Array.from({ length: horizontalCount }, (_, index) => {
    const t = index / (horizontalCount - 1);
    const value = signal(index, horizontalCount, mode, intensity);
    return {
      y: BASE_Y + t * (HEIGHT - 0.03),
      radius: BASE_RADIUS,
      wave: (0.003 + value * 0.008) * Math.min(1, intensity + 0.25),
    };
  }), [mode, intensity]);

  return (
    <group position={position}>
      <LeatherTop />
      {horizontalRings.map((ring, index) => <Ring key={`ring-${index}`} {...ring} color={index % 2 ? BASE_COLOR : BASE_COLOR_DARK} />)}
      <Ring y={BASE_Y} radius={BASE_RADIUS} color="#7d3e2b" />
      <Ring y={TOP_Y} radius={BASE_RADIUS} color="#a8784a" />
      {baseGeometry && (
        <mesh geometry={baseGeometry} castShadow receiveShadow>
          <meshBasicMaterial color={BASE_COLOR} />
        </mesh>
      )}
      {accentGeometry && (
        <mesh geometry={accentGeometry} castShadow receiveShadow>
          <meshBasicMaterial color={ACCENT_COLOR} />
        </mesh>
      )}
      <Yarn points={[[0, BASE_Y, 0], [0, TOP_Y, 0]]} color="#3b3029" radius={0.014} />
      <mesh position={[0, 0.025, 0]} receiveShadow>
        <cylinderGeometry args={[BASE_RADIUS * 0.98, BASE_RADIUS * 0.98, 0.035, 48]} />
        <meshStandardMaterial color="#6c6b65" metalness={0.55} roughness={0.5} transparent opacity={0.22} />
      </mesh>
    </group>
  );
}

export default BancoTecido;
