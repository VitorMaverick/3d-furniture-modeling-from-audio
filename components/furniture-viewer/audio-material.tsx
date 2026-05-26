"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useFurniture, TextureMode } from "@/lib/furniture-context";
import { audioVertexShader, audioFragmentShader } from "@/lib/audio-texture-shader";

interface AudioMaterialProps {
  baseColor: string;
  roughness?: number;
  metalness?: number;
}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255,
      ]
    : [0.5, 0.3, 0.1];
}

function getPatternType(mode: TextureMode): number {
  switch (mode) {
    case "waveform":
      return 0;
    case "fft":
      return 1;
    case "spectrogram":
      return 2;
    case "combined":
      return 3;
    default:
      return -1;
  }
}

export function AudioShaderMaterial({ baseColor, roughness = 0.6, metalness = 0.1 }: AudioMaterialProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { params } = useFurniture();
  
  // Uniforms are initialized once and mutated imperatively inside useFrame on every frame.
  // The empty dependency array is intentional: recreating the uniforms object would reset
  // the shader material reference, causing a flicker. All values are kept in sync via useFrame.
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uBaseColor: { value: new THREE.Vector3(...hexToRgb(baseColor)) },
      uWaveIntensity: { value: params.waveIntensity },
      uFFTIntensity: { value: params.fftIntensity },
      uSpectrogramIntensity: { value: params.spectrogramIntensity },
      uPatternType: { value: getPatternType(params.textureMode) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime * params.animationSpeed;
      materialRef.current.uniforms.uBaseColor.value.set(...hexToRgb(baseColor));
      materialRef.current.uniforms.uWaveIntensity.value = params.waveIntensity;
      materialRef.current.uniforms.uFFTIntensity.value = params.fftIntensity;
      materialRef.current.uniforms.uSpectrogramIntensity.value = params.spectrogramIntensity;
      materialRef.current.uniforms.uPatternType.value = getPatternType(params.textureMode);
    }
  });
  
  if (params.textureMode === "solid" || params.showWireframe) {
    return (
      <meshStandardMaterial
        color={baseColor}
        wireframe={params.showWireframe}
        roughness={roughness}
        metalness={metalness}
      />
    );
  }
  
  return (
    <shaderMaterial
      ref={materialRef}
      vertexShader={audioVertexShader}
      fragmentShader={audioFragmentShader}
      uniforms={uniforms}
      side={THREE.DoubleSide}
    />
  );
}

// Componente de mesh com material de áudio
interface AudioMeshProps {
  geometry: React.ReactNode;
  position?: [number, number, number];
  rotation?: [number, number, number];
  baseColor: string;
  castShadow?: boolean;
  receiveShadow?: boolean;
}

export function AudioMesh({
  geometry,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  baseColor,
  castShadow = true,
  receiveShadow = false,
}: AudioMeshProps) {
  return (
    <mesh position={position} rotation={rotation} castShadow={castShadow} receiveShadow={receiveShadow}>
      {geometry}
      <AudioShaderMaterial baseColor={baseColor} />
    </mesh>
  );
}
