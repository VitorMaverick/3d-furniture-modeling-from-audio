"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { useFurniture, TextureMode } from "@/lib/furniture-context";
import type { AIWaveParams } from "@/lib/furniture-context";

type Point = [number, number, number];

// Escala centímetros -> unidades da cena
const CM = 0.055;

// PLANIFICAÇÃO (gabarito plano da malha) — setor de anel conforme o documento:
// raio interno 9,4 (arco do topo, Ø4,0) e raio externo 25,1 (arco da base, Ø10,7),
// abrindo um setor de 76,9°. Uma única emenda vertical.
const R_I = 9.4 * CM;
const R_O = 25.1 * CM;
const THETA = (76.9 * Math.PI) / 180;

// Rede em losango: 40 colunas verticais x 16 fileiras (17 linhas de nós).
const ROWS = 16;
const COLS = 40;
const STEPS = COLS * 2; // dois passos angulares por losango (nós em xadrez)

const ROPE = 0.0085; // corda náutica Ø0,5 cm
const KNOT = 0.013; // nó quadrado (macramé)
const CENTER_Y = (R_I + R_O) / 2; // centraliza a planificação na vertical

// 8 tons de azul da corda — do mais claro no topo (T1) ao mais escuro na base (T8).
const BLUE_TONES = [
  "#d5ebff",
  "#a9d3f5",
  "#7fbaec",
  "#559adb",
  "#347fc6",
  "#215f9f",
  "#164073",
  "#0d2545",
];

// Número de oscilações angulares das fileiras, por modo de áudio (formato de ondas).
function angularFreq(mode: TextureMode): number {
  if (mode === "fft") return 5;
  if (mode === "spectrogram") return 9;
  if (mode === "combined") return 6;
  return 7;
}

// Energia sonora de cada faixa de tom (T1..T8). Define o brilho de cada banda,
// seguindo a energia real do trecho da faixa (via IA) ou um padrão por modo.
function bandEnergy(
  b: number,
  mode: TextureMode,
  intensity: number,
  ai?: AIWaveParams | null,
): number {
  const t = b / 7;
  let e: number;
  if (mode === "ai-image" && ai) {
    const bands = [
      ai.subBassEnergy,
      ai.bassEnergy,
      ai.lowMidEnergy,
      ai.midEnergy,
      ai.highMidEnergy,
      ai.trebleEnergy,
    ].map((v) => v ?? 0);
    const hasSub = bands.some((v) => v > 0);
    if (hasSub) {
      const idx = Math.min(bands.length - 1, Math.round(t * (bands.length - 1)));
      const max = Math.max(...bands, 0.001);
      e = bands[idx] / max;
    } else {
      e = t < 0.5 ? ai.lowFreqAmplitude : t < 0.8 ? ai.midFreqAmplitude : ai.highFreqAmplitude;
    }
  } else if (mode === "fft") {
    e = Math.exp(-t * 1.9) * 0.9 + 0.1;
  } else if (mode === "spectrogram") {
    e = 0.4 + 0.5 * (0.5 + 0.5 * Math.sin(t * Math.PI * 3));
  } else if (mode === "combined") {
    e = (Math.exp(-t * 1.5) + (0.5 + 0.5 * Math.sin(t * Math.PI * 4))) / 2;
  } else {
    e = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * Math.PI * 2.4));
  }
  return THREE.MathUtils.clamp(THREE.MathUtils.lerp(0.55, e, Math.min(1, intensity)), 0, 1);
}

// Posição de um nó (i = fileira radial, m = passo angular) no plano da planificação.
// As fileiras intermediárias ondulam (turbulência); topo e base ficam firmes nos aros.
function nodePos(i: number, m: number, freq: number, amp: number): THREE.Vector3 {
  const u = i / ROWS;
  const rho0 = R_I + u * (R_O - R_I);
  const phi = -THETA / 2 + (m / STEPS) * THETA;
  const edgeFade = Math.sin(Math.PI * u);
  const rho = rho0 + amp * edgeFade * Math.sin(phi * freq + i * 0.6);
  return new THREE.Vector3(rho * Math.sin(phi), rho * Math.cos(phi) - CENTER_Y, 0);
}

export function MalhaPlanificada({ position = [0, 0.6, 0] as Point }) {
  const { params } = useFurniture();
  const mode = params.textureMode === "solid" ? "waveform" : params.textureMode;
  const intensity =
    params.textureMode === "fft"
      ? params.fftIntensity
      : params.textureMode === "spectrogram"
        ? params.spectrogramIntensity
        : params.waveIntensity;

  const freq = angularFreq(mode);
  const amp = (R_O - R_I) * 0.055 * Math.min(1, intensity + 0.15);

  const { bands, aros } = useMemo(() => {
    const groups: THREE.BufferGeometry[][] = Array.from({ length: 8 }, () => []);
    const knotGeo = new THREE.SphereGeometry(KNOT, 6, 6);

    for (let i = 0; i <= ROWS; i++) {
      const b = Math.min(7, Math.floor(i / 2));
      for (let m = 0; m <= STEPS; m++) {
        if ((i + m) % 2 !== 0) continue; // nós em padrão xadrez -> losangos
        const p = nodePos(i, m, freq, amp);

        const knot = knotGeo.clone();
        knot.translate(p.x, p.y, p.z);
        groups[b].push(knot);

        // Cordas diagonais para os dois nós da fileira seguinte -> losango
        if (i < ROWS) {
          for (const dm of [-1, 1]) {
            const mm = m + dm;
            if (mm < 0 || mm > STEPS) continue;
            const q = nodePos(i + 1, mm, freq, amp);
            groups[b].push(
              new THREE.TubeGeometry(new THREE.LineCurve3(p, q), 1, ROPE, 5, false),
            );
          }
        }
      }
    }

    const bands = groups.map((parts, b) => {
      const color = new THREE.Color(BLUE_TONES[b]);
      color.lerp(
        new THREE.Color("#ffffff"),
        bandEnergy(b, mode, intensity, params.aiWaveParams) * 0.16,
      );
      return {
        geometry: parts.length ? mergeGeometries(parts, false) : null,
        color,
      };
    });

    // 4 aros metálicos (topo, dois intermediários e base) onde a rede é amarrada.
    const aros = [0, 5, 11, 16].map((i) => {
      const pts = Array.from({ length: STEPS + 1 }, (_, m) => nodePos(i, m, freq, amp));
      const curve = new THREE.CatmullRomCurve3(pts);
      return new THREE.TubeGeometry(curve, STEPS, ROPE * 1.7, 6, false);
    });

    return { bands, aros };
  }, [mode, intensity, freq, amp, params.aiWaveParams]);

  return (
    <group position={position}>
      {/* Emenda vertical / bordas radiais do gabarito */}
      {bands.map((band, b) =>
        band.geometry ? (
          <mesh key={`band-${b}`} geometry={band.geometry} castShadow receiveShadow>
            <meshBasicMaterial color={band.color} />
          </mesh>
        ) : null,
      )}
      {aros.map((geo, i) => (
        <mesh key={`aro-${i}`} geometry={geo}>
          <meshStandardMaterial color="#9aa3b0" metalness={0.7} roughness={0.35} />
        </mesh>
      ))}
    </group>
  );
}

export default MalhaPlanificada;
