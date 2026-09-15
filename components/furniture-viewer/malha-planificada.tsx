"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { useFurniture } from "@/lib/furniture-context";
import { getTextureColor, getInitialDisplacement } from "./segmented-furniture";

type Point = [number, number, number];

// Escala centímetros -> unidades da cena
const CM = 0.055;

// PLANIFICAÇÃO (gabarito plano da malha) — setor de anel conforme o documento:
// raio interno 9,4 (arco do topo, Ø4,0) e raio externo 25,1 (arco da base, Ø10,7),
// abrindo um setor de 76,9°. Uma única emenda vertical.
const R_I = 9.4 * CM;
const R_O = 25.1 * CM;
const THETA = (76.9 * Math.PI) / 180;

// Mesma densidade de camadas de segmentos da base da Cadeira (cone segmentado).
const LAYERS = 22; // fileiras radiais (camadas)
const COLS = 44; // colunas angulares (segmentos por camada)

const CENTER_Y = (R_I + R_O) / 2; // centraliza a planificação na vertical
const UNIT = 0.012; // unidade base dos segmentos (igual à Cadeira)
const ROPE = 0.004; // fios finos da rede

export function MalhaPlanificada({ position = [0, 0.6, 0] as Point }) {
  const { params } = useFurniture();
  const mode = params.textureMode === "solid" ? "waveform" : params.textureMode;
  const intensity =
    params.textureMode === "fft"
      ? params.fftIntensity
      : params.textureMode === "spectrogram"
        ? params.spectrogramIntensity
        : params.waveIntensity;

  const relief = (R_O - R_I) * 0.07 * Math.min(1.4, 0.5 + intensity);

  const { segments, netGeometry } = useMemo(() => {
    const radSpacing = (R_O - R_I) / LAYERS;
    const nodes: THREE.Vector3[][] = [];
    const segs: Array<{
      key: string;
      position: Point;
      rotation: Point;
      scale: Point;
      color: THREE.Color;
    }> = [];

    for (let i = 0; i < LAYERS; i++) {
      const nl = i / (LAYERS - 1); // 0 na base (arco externo) -> 1 no topo (arco interno)
      const rho = R_O - nl * (R_O - R_I);
      const arcSpacing = (rho * THETA) / COLS;
      const rowNodes: THREE.Vector3[] = [];

      for (let j = 0; j <= COLS; j++) {
        const ns = j / COLS;
        const phi = -THETA / 2 + ns * THETA;

        // Relevo (formato de ondas) e escala idênticos à base da Cadeira.
        const { scale: scaleMod } = getInitialDisplacement(
          i,
          LAYERS,
          j,
          COLS,
          [rho * Math.sin(phi) + 0.1, 0, rho * Math.cos(phi)],
          mode,
          0.8,
          params.aiWaveParams,
        );

        const z = (scaleMod - 0.9) * relief;
        const px = rho * Math.sin(phi);
        const py = rho * Math.cos(phi) - CENTER_Y;
        rowNodes.push(new THREE.Vector3(px, py, z));

        if (j === COLS) continue; // nó extra só fecha a rede

        const color = getTextureColor(nl, ns, undefined, mode, params.aiWaveParams);

        // Tiles densos e encostados -> superfície de tecido contínua.
        const w = arcSpacing * 0.92 * scaleMod;
        const h = radSpacing * 0.78 * scaleMod;
        const d = UNIT * 0.55 * scaleMod;

        segs.push({
          key: `seg-${i}-${j}`,
          position: [px, py, z],
          rotation: [0, 0, -phi],
          scale: [w, h, d],
          color,
        });
      }
      nodes.push(rowNodes);
    }

    // Rede de fios (urdidura + trama) conectando os nós, como na base da Cadeira.
    const wires: THREE.BufferGeometry[] = [];
    const tube = (a: THREE.Vector3, b: THREE.Vector3) =>
      new THREE.TubeGeometry(new THREE.LineCurve3(a, b), 1, ROPE, 4, false);

    for (let i = 0; i < LAYERS; i++) {
      for (let j = 0; j <= COLS; j++) {
        if (j < COLS) wires.push(tube(nodes[i][j], nodes[i][j + 1])); // trama horizontal
        if (i < LAYERS - 1) wires.push(tube(nodes[i][j], nodes[i + 1][j])); // urdidura vertical
      }
    }
    const netGeometry = mergeGeometries(wires, false);

    return { segments: segs, netGeometry };
  }, [mode, intensity, relief, params.aiWaveParams]);

  // 4 aros metálicos (topo, dois intermediários e base) onde a rede é amarrada.
  const aros = useMemo(() => {
    return [0, 7, 14, 21].map((i) => {
      const nl = i / (LAYERS - 1);
      const rho = R_O - nl * (R_O - R_I);
      const pts = Array.from({ length: COLS + 1 }, (_, j) => {
        const phi = -THETA / 2 + (j / COLS) * THETA;
        return new THREE.Vector3(rho * Math.sin(phi), rho * Math.cos(phi) - CENTER_Y, 0);
      });
      return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), COLS, ROPE * 2.2, 6, false);
    });
  }, []);

  return (
    <group position={position}>
      {segments.map((s) => (
        <mesh key={s.key} position={s.position} rotation={s.rotation} scale={s.scale} castShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color={s.color}
            emissive={s.color}
            emissiveIntensity={0.25}
            roughness={0.35}
            metalness={0.25}
          />
        </mesh>
      ))}

      {netGeometry && (
        <mesh geometry={netGeometry}>
          <meshStandardMaterial color="#5b6472" metalness={0.3} roughness={0.6} />
        </mesh>
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
