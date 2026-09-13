"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useFurniture, TextureMode } from "@/lib/furniture-context";

function audioPulse(index: number, total: number, mode: TextureMode) {
  const t = total <= 1 ? 0 : index / (total - 1);
  const wave = 0.5 + 0.5 * Math.sin(t * Math.PI * 10) * (0.45 + 0.55 * Math.sin(t * Math.PI));
  const fft = Math.exp(-t * 1.8) * (0.72 + 0.28 * Math.sin(t * Math.PI * 8));
  const stft = (0.55 + 0.45 * Math.sin(t * Math.PI * 6)) * (0.65 + 0.35 * Math.cos(t * Math.PI * 2));

  if (mode === "fft") return Math.max(0.08, fft);
  if (mode === "spectrogram") return Math.max(0.08, stft);
  if (mode === "combined") return Math.max(0.08, (wave + fft + stft) / 3);
  if (mode === "ai-image") return Math.max(0.08, 0.65 * wave + 0.35 * stft);
  return Math.max(0.08, wave);
}

function Yarn({ start, end, radius, color, roughness = 0.78 }: {
  start: [number, number, number];
  end: [number, number, number];
  radius: number;
  color: string;
  roughness?: number;
}) {
  const geometry = useMemo(() => {
    const curve = new THREE.LineCurve3(new THREE.Vector3(...start), new THREE.Vector3(...end));
    return new THREE.TubeGeometry(curve, 8, radius, 6, false);
  }, [end, radius, start]);

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial color={color} roughness={roughness} metalness={0.02} />
    </mesh>
  );
}

export function BancoTear({ position = [0, 0, 0] as [number, number, number] }) {
  const { params } = useFurniture();
  const width = 0.72;
  const depth = 0.52;
  const seatHeight = 0.34;
  const frameRadius = 0.025;
  const yarnRadius = 0.0065;
  const yarnCount = Math.max(18, Math.min(48, params.segmentsPerLayer));
  const horizontalCount = Math.max(7, Math.min(18, Math.round(params.segmentLayers / 3)));
  const audioMode = params.textureMode === "solid" ? "waveform" : params.textureMode;

  const verticalYarns = useMemo(() => Array.from({ length: yarnCount }, (_, index) => {
    const x = -width / 2 + (index / (yarnCount - 1)) * width;
    const pulse = audioPulse(index, yarnCount, audioMode);
    const sag = (1 - pulse) * 0.035;
    const color = new THREE.Color(params.bancoWaujaColor).lerp(new THREE.Color("#c88a4a"), pulse * 0.5).getStyle();
    return { x, sag, color };
  }), [audioMode, params.bancoWaujaColor, yarnCount]);

  const horizontalYarns = useMemo(() => Array.from({ length: horizontalCount }, (_, index) => {
    const y = seatHeight - 0.025 - (index / (horizontalCount - 1)) * 0.24;
    const pulse = audioPulse(index, horizontalCount, audioMode);
    const inset = 0.02 + (1 - pulse) * 0.025;
    return { y, inset, color: "#d4a56c" };
  }), [audioMode, horizontalCount]);

  return (
    <group position={position}>
      <Yarn start={[-width / 2, seatHeight, -depth / 2]} end={[width / 2, seatHeight, -depth / 2]} radius={frameRadius} color="#b77b3d" />
      <Yarn start={[-width / 2, seatHeight, depth / 2]} end={[width / 2, seatHeight, depth / 2]} radius={frameRadius} color="#b77b3d" />
      <Yarn start={[-width / 2, 0.02, -depth / 2]} end={[-width / 2, seatHeight, -depth / 2]} radius={frameRadius} color="#d0a26a" />
      <Yarn start={[width / 2, 0.02, -depth / 2]} end={[width / 2, seatHeight, -depth / 2]} radius={frameRadius} color="#d0a26a" />
      <Yarn start={[-width / 2, 0.02, depth / 2]} end={[-width / 2, seatHeight, depth / 2]} radius={frameRadius} color="#d0a26a" />
      <Yarn start={[width / 2, 0.02, depth / 2]} end={[width / 2, seatHeight, depth / 2]} radius={frameRadius} color="#d0a26a" />

      {verticalYarns.map(({ x, sag, color }, index) => (
        <Yarn key={`warp-${index}`} start={[x, 0.02, -depth / 2 + 0.035]} end={[x, seatHeight - sag, depth / 2 - 0.035]} radius={yarnRadius} color={color} />
      ))}

      {horizontalYarns.map(({ y, inset, color }, index) => (
        <Yarn key={`weft-${index}`} start={[-width / 2 + inset, y, -depth / 2 + 0.025]} end={[width / 2 - inset, y, depth / 2 - 0.025]} radius={yarnRadius * 1.15} color={color} />
      ))}
    </group>
  );
}

export default BancoTear;
