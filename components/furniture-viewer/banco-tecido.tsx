"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useFurniture, TextureMode } from "@/lib/furniture-context";

type Point = [number, number, number];

const HEIGHT = 0.82;
const BASE_Y = 0.06;
const TOP_Y = 0.91;
const TOP_RADIUS = 0.43;
const BASE_RADIUS = 0.31;
const RING_RADIUS = 0.0065;
const THREAD_RADIUS = 0.0032;
const palette = ["#a94f2b", "#b85c32", "#9b472b", "#c66a36", "#a9512c"];

function signal(index: number, total: number, mode: TextureMode, intensity: number) {
  const t = total <= 1 ? 0 : index / (total - 1);
  const waveform = 0.5 + 0.5 * Math.sin(t * Math.PI * 8.5);
  const fft = 0.25 + 0.75 * Math.exp(-t * 1.8) * (0.72 + 0.28 * Math.sin(t * Math.PI * 7));
  const stft = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * Math.PI * 5)) * (0.7 + 0.3 * Math.cos(t * Math.PI * 2));
  const value = mode === "fft" ? fft : mode === "spectrogram" ? stft : mode === "combined" ? (waveform + fft + stft) / 3 : mode === "ai-image" ? waveform * 0.65 + stft * 0.35 : waveform;
  return THREE.MathUtils.lerp(0.82, value, Math.min(1, intensity));
}

function Yarn({ points, color, radius = THREAD_RADIUS }: { points: Point[]; color: string; radius?: number }) {
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)));
    return new THREE.TubeGeometry(curve, Math.max(8, points.length * 3), radius, 5, false);
  }, [points, radius]);
  return <mesh geometry={geometry} castShadow receiveShadow><meshStandardMaterial color={color} roughness={0.84} /></mesh>;
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
  // Fios finos e muito próximos para formar uma superfície contínua de tecido.
  const verticalCount = 76;
  const horizontalCount = 18;

  const verticalThreads = useMemo(() => Array.from({ length: verticalCount }, (_, index) => {
    const t = index / (verticalCount - 1);
    const angle = t * Math.PI * 2;
    const value = signal(index, verticalCount, mode, intensity);
    const radius = THREE.MathUtils.lerp(BASE_RADIUS, TOP_RADIUS * 0.82, t);
    const sway = (value - 0.5) * 0.018;
    return { angle, radius, sway, color: palette[index % palette.length] };
  }), [mode, intensity]);

  const horizontalRings = useMemo(() => Array.from({ length: horizontalCount }, (_, index) => {
    const t = index / (horizontalCount - 1);
    const value = signal(index, horizontalCount, mode, intensity);
    return {
      y: BASE_Y + t * (HEIGHT - 0.03),
      radius: THREE.MathUtils.lerp(BASE_RADIUS, TOP_RADIUS * 0.82, t),
      wave: (0.004 + value * 0.012) * Math.min(1, intensity + 0.25),
    };
  }), [mode, intensity]);

  return (
    <group position={position}>
      <LeatherTop />
      {horizontalRings.map((ring, index) => <Ring key={`ring-${index}`} {...ring} color={index % 2 ? "#e4c58e" : "#b9683c"} />)}
      <Ring y={BASE_Y} radius={BASE_RADIUS} color="#7d3e2b" />
      <Ring y={TOP_Y} radius={TOP_RADIUS * 0.82} color="#a8784a" />
      {verticalThreads.map(({ angle, radius, sway, color }, index) => {
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const wave = Math.sin(angle * 6) * (0.006 + intensity * 0.016);
        return <Yarn key={`warp-${index}`} color={color} points={[[x, BASE_Y, z], [x + sway + wave, BASE_Y + HEIGHT * 0.25, z + sway], [x - wave, BASE_Y + HEIGHT * 0.58, z + wave], [x, TOP_Y, z]]} />;
      })}
      <Yarn points={[[0, BASE_Y, 0], [0, TOP_Y, 0]]} color="#3b3029" radius={0.014} />
      <mesh position={[0, 0.025, 0]} receiveShadow>
        <cylinderGeometry args={[BASE_RADIUS * 0.98, BASE_RADIUS * 0.98, 0.035, 48]} />
        <meshStandardMaterial color="#6c6b65" metalness={0.55} roughness={0.5} transparent opacity={0.22} />
      </mesh>
    </group>
  );
}

export default BancoTecido;
