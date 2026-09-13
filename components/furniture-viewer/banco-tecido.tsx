"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useFurniture, TextureMode } from "@/lib/furniture-context";

type Point = [number, number, number];

const WIDTH = 0.82;
const SEAT_DEPTH = 0.48;
const SEAT_HEIGHT = 0.46;
const BACK_HEIGHT = 0.78;
const BACK_BOTTOM = 0.54;
const FRAME = 0.018;
const THREAD = 0.008;

const palette = ["#a94f2b", "#c66a36", "#7d3e2b", "#d6aa72", "#ead1a2"];

function signal(index: number, total: number, mode: TextureMode, intensity: number) {
  const t = total <= 1 ? 0 : index / (total - 1);
  const waveform = 0.5 + 0.5 * Math.sin(t * Math.PI * 8.5);
  const fft = 0.25 + 0.75 * Math.exp(-t * 1.8) * (0.72 + 0.28 * Math.sin(t * Math.PI * 7));
  const stft = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * Math.PI * 5)) * (0.7 + 0.3 * Math.cos(t * Math.PI * 2));
  const value = mode === "fft" ? fft : mode === "spectrogram" ? stft : mode === "combined" ? (waveform + fft + stft) / 3 : mode === "ai-image" ? waveform * 0.65 + stft * 0.35 : waveform;
  return THREE.MathUtils.lerp(0.82, value, Math.min(1, intensity));
}

function Thread({ points, color, radius = THREAD }: { points: Point[]; color: string; radius?: number }) {
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)));
    return new THREE.TubeGeometry(curve, Math.max(8, points.length * 3), radius, 5, false);
  }, [points, radius]);

  return <mesh geometry={geometry} castShadow receiveShadow><meshStandardMaterial color={color} roughness={0.86} /></mesh>;
}

function FabricPanel({ width, height, y, z, horizontal = false, mode, intensity }: { width: number; height: number; y: number; z: number; horizontal?: boolean; mode: TextureMode; intensity: number }) {
  const count = horizontal ? Math.max(20, Math.round(width / 0.035)) : Math.max(14, Math.round(height / 0.045));
  const lines = useMemo(() => Array.from({ length: count }, (_, index) => {
    const p = signal(index, count, mode, intensity);
    const progress = count <= 1 ? 0.5 : index / (count - 1);
    const curve = (p - 0.5) * 0.018;
    const color = palette[index % palette.length];
    if (horizontal) {
      const x = -width / 2 + progress * width;
      return { color, points: [[x, y + curve, z], [x + curve * 0.4, y + curve * 0.8, z + height * 0.5], [x, y + curve, z + height]] as Point[] };
    }
    const x = -width / 2 + progress * width;
    return { color, points: [[x, y, z + curve], [x + curve, y + height * 0.5, z + curve], [x, y + height, z + curve]] as Point[] };
  }), [count, height, width, y, z, horizontal, mode, intensity]);

  return <>{lines.map((line, index) => <Thread key={`${horizontal ? "weft" : "warp"}-${index}`} points={line.points} color={line.color} />)}</>;
}

function Frame({ position, scale }: { position: Point; scale: Point }) {
  return <mesh position={position} scale={scale} castShadow><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#77766f" metalness={0.55} roughness={0.42} /></mesh>;
}

export function BancoTecido({ position = [0, 0, 0] as Point }) {
  const { params } = useFurniture();
  const mode = params.textureMode === "solid" ? "waveform" : params.textureMode;
  const intensity = params.textureMode === "fft" ? params.fftIntensity : params.textureMode === "spectrogram" ? params.spectrogramIntensity : params.waveIntensity;
  const pulse = signal(4, 9, mode, intensity);
  const seatWidth = WIDTH * (0.96 + pulse * 0.04);
  const backWidth = WIDTH * 0.92;

  return (
    <group position={position}>
      {/* Estrutura discreta atrás do revestimento */}
      <Frame position={[0, SEAT_HEIGHT, 0]} scale={[seatWidth, FRAME, SEAT_DEPTH]} />
      <Frame position={[-backWidth / 2, BACK_BOTTOM + BACK_HEIGHT / 2, 0]} scale={[FRAME, BACK_HEIGHT, FRAME]} />
      <Frame position={[backWidth / 2, BACK_BOTTOM + BACK_HEIGHT / 2, 0]} scale={[FRAME, BACK_HEIGHT, FRAME]} />
      <Frame position={[0, BACK_BOTTOM + BACK_HEIGHT, 0]} scale={[backWidth, FRAME, FRAME]} />
      <Frame position={[-backWidth * 0.42, 0.25, 0]} scale={[FRAME, 0.42, FRAME]} />
      <Frame position={[backWidth * 0.42, 0.25, 0]} scale={[FRAME, 0.42, FRAME]} />

      {/* Assento: urdidura longitudinal e trama transversal formando uma superfície estrutural */}
      <FabricPanel width={seatWidth} height={SEAT_DEPTH} y={SEAT_HEIGHT + 0.015} z={-SEAT_DEPTH / 2 + 0.035} mode={mode} intensity={intensity} />
      <FabricPanel width={SEAT_DEPTH} height={seatWidth} y={SEAT_HEIGHT + 0.023} z={-SEAT_DEPTH / 2 + 0.048} horizontal mode={mode} intensity={intensity} />

      {/* Encosto amplo, levemente afunilado e inteiramente tecido */}
      <FabricPanel width={backWidth} height={BACK_HEIGHT} y={BACK_BOTTOM} z={-0.015} mode={mode} intensity={intensity} />
      <FabricPanel width={backWidth} height={BACK_HEIGHT} y={BACK_BOTTOM} z={0.012} horizontal mode={mode} intensity={intensity} />

      {/* Bordas encapadas, mantendo os fios presos à estrutura */}
      <Thread points={[[-seatWidth / 2, SEAT_HEIGHT + 0.03, -SEAT_DEPTH / 2], [seatWidth / 2, SEAT_HEIGHT + 0.03, -SEAT_DEPTH / 2]]} color="#d1ad78" radius={FRAME} />
      <Thread points={[[-backWidth / 2, BACK_BOTTOM, 0], [-backWidth / 2, BACK_BOTTOM + BACK_HEIGHT, 0], [backWidth / 2, BACK_BOTTOM + BACK_HEIGHT, 0], [backWidth / 2, BACK_BOTTOM, 0]]} color="#d1ad78" radius={FRAME} />
    </group>
  );
}

export default BancoTecido;
