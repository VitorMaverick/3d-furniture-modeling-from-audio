"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useFurniture, TextureMode } from "@/lib/furniture-context";

type Point = [number, number, number];

const seatRadius = 0.34;
const seatHeight = 0.43;
const frameRadius = 0.025;
const yarnRadius = 0.006;

function audioPulse(index: number, total: number, mode: TextureMode) {
  const t = total <= 1 ? 0 : index / (total - 1);
  const waveform = 0.5 + 0.5 * Math.sin(t * Math.PI * 8) * (0.6 + 0.4 * Math.sin(t * Math.PI));
  const fft = Math.exp(-t * 1.7) * (0.72 + 0.28 * Math.sin(t * Math.PI * 7));
  const stft = (0.55 + 0.45 * Math.sin(t * Math.PI * 5)) * (0.7 + 0.3 * Math.cos(t * Math.PI * 2));

  if (mode === "fft") return Math.max(0.12, fft);
  if (mode === "spectrogram") return Math.max(0.12, stft);
  if (mode === "combined") return Math.max(0.12, (waveform + fft + stft) / 3);
  if (mode === "ai-image") return Math.max(0.12, waveform * 0.65 + stft * 0.35);
  return Math.max(0.12, waveform);
}

function Yarn({ points, radius, color }: { points: Point[]; radius: number; color: string }) {
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)));
    return new THREE.TubeGeometry(curve, Math.max(8, points.length * 4), radius, 6, false);
  }, [points, radius]);

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial color={color} roughness={0.82} metalness={0.02} />
    </mesh>
  );
}

function Leg({ angle, length }: { angle: number; length: number }) {
  const x = Math.cos(angle) * 0.22;
  const z = Math.sin(angle) * 0.22;
  return <Yarn points={[[x * 0.82, 0.04, z * 0.82], [x, length * 0.48, z], [x * 0.94, length, z * 0.94]]} radius={frameRadius} color="#9b9b8d" />;
}

export function BancoTecido({ position = [0, 0, 0] as Point }) {
  const { params } = useFurniture();
  const mode = params.textureMode === "solid" ? "waveform" : params.textureMode;
  const yarnCount = Math.max(28, Math.min(64, params.segmentsPerLayer + 8));
  const ringCount = Math.max(5, Math.min(10, Math.round(params.segmentLayers / 5)));
  const colors = ["#b75d32", "#c8753e", "#8e4c32", "#d4a36a", "#ead0a0"];

  const radialYarns = useMemo(() => Array.from({ length: yarnCount }, (_, index) => {
    const angle = (index / yarnCount) * Math.PI * 2;
    const pulse = audioPulse(index, yarnCount, mode);
    const sag = (1 - pulse) * 0.035;
    const inner = 0.025;
    const outer = seatRadius - 0.025;
    return {
      points: [
        [Math.cos(angle) * inner, seatHeight + 0.012, Math.sin(angle) * inner] as Point,
        [Math.cos(angle + 0.03) * (seatRadius * 0.52), seatHeight + 0.012 - sag, Math.sin(angle + 0.03) * (seatRadius * 0.52)] as Point,
        [Math.cos(angle) * outer, seatHeight + 0.012, Math.sin(angle) * outer] as Point,
      ],
      color: colors[index % colors.length],
    };
  }), [mode, yarnCount]);

  const rings = useMemo(() => Array.from({ length: ringCount }, (_, index) => {
    const radius = 0.045 + (index / (ringCount - 1)) * (seatRadius - 0.07);
    const pulse = audioPulse(index, ringCount, mode);
    const y = seatHeight + 0.016 + (1 - pulse) * 0.012;
    const points = Array.from({ length: 17 }, (_, pointIndex) => {
      const angle = (pointIndex / 16) * Math.PI * 2;
      return [Math.cos(angle) * radius, y, Math.sin(angle) * radius] as Point;
    });
    return { points, color: colors[(index + 2) % colors.length] };
  }), [mode, ringCount]);

  return (
    <group position={position}>
      <Yarn points={Array.from({ length: 25 }, (_, index) => { const angle = (index / 24) * Math.PI * 2; return [Math.cos(angle) * seatRadius, seatHeight, Math.sin(angle) * seatRadius] as Point; })} radius={frameRadius} color="#a98b68" />
      {radialYarns.map((yarn, index) => <Yarn key={`radial-${index}`} points={yarn.points} radius={yarnRadius} color={yarn.color} />)}
      {rings.map((ring, index) => <Yarn key={`ring-${index}`} points={ring.points} radius={yarnRadius * 1.12} color={ring.color} />)}
      {[0, 1, 2, 3].map((index) => <Leg key={`leg-${index}`} angle={Math.PI / 4 + index * Math.PI / 2} length={seatHeight - 0.03} />)}
      <Yarn points={[[-0.24, 0.09, -0.04], [0, 0.14, -0.09], [0.24, 0.09, -0.04]]} radius={frameRadius * 0.72} color="#9b9b8d" />
      <Yarn points={[[-0.04, 0.09, -0.24], [0, 0.14, -0.09], [0.04, 0.09, 0.24]]} radius={frameRadius * 0.72} color="#9b9b8d" />
    </group>
  );
}

export default BancoTecido;
