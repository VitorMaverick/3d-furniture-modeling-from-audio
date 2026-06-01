"use client";

import { useRef, useMemo, useLayoutEffect } from "react";
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
  
  // Allow quick debug of UVs using ?debug_uv=1 in the URL (development only)
  let fragmentToUse = audioFragmentShader;
  try {
    if (typeof window !== 'undefined' && window.location.search.includes('debug_uv=1')) {
      fragmentToUse = `
        varying vec2 vUv;
        void main() {
          gl_FragColor = vec4(vUv.x, vUv.y, 0.0, 1.0);
        }
      `;
    }
  } catch (e) {
    // ignore
  }

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
      fragmentShader={fragmentToUse}
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
  const meshRef = useRef<THREE.Mesh>(null);

  // If geometry lacks UVs, generate planar UVs on the client so shader can use vUv.
  // Use a layout effect and poll via requestAnimationFrame until the geometry is attached
  // (in R3F the <primitive attach="geometry" /> child may mount slightly after parent).
  useLayoutEffect(() => {
    let mounted = true;
    let didLog = false;

    const ensureUVs = () => {
      if (!mounted) return;
      const mesh = meshRef.current;
      if (!mesh) return requestAnimationFrame(ensureUVs);

      let geom = mesh.geometry as THREE.BufferGeometry | undefined;
      if (!geom) return requestAnimationFrame(ensureUVs);

      // If indexed, convert to non-indexed to ensure attribute counts match
      if ((geom as any).index) {
        try {
          geom = geom.toNonIndexed();
          mesh.geometry = geom;
        } catch (e) {
          // log once
          if (!didLog) {
            // eslint-disable-next-line no-console
            console.warn('[AudioMesh] toNonIndexed failed', e);
            didLog = true;
          }
        }
      }

      const hasUV = !!geom.getAttribute('uv');
      if (!hasUV) {
        try {
          geom.computeBoundingBox();
          const bbox = geom.boundingBox!;
          const size = new THREE.Vector3();
          bbox.getSize(size);

          const pos = geom.getAttribute('position');
          const uv = new Float32Array((pos.count) * 2);

          for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);

            const u = size.x > 0 ? (x - bbox.min.x) / size.x : 0.5;
            const v = size.y > 0 ? (y - bbox.min.y) / size.y : 0.5;

            uv[i * 2] = u;
            uv[i * 2 + 1] = v;
          }

          geom.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
          // eslint-disable-next-line no-console
          console.info('[AudioMesh] generated planar UVs for geometry', geom);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn('[AudioMesh] failed to generate UVs', e);
        }
      } else {
        // eslint-disable-next-line no-console
        console.info('[AudioMesh] geometry already has UVs', geom.getAttribute('uv'));
      }
    };

    requestAnimationFrame(ensureUVs);

    return () => {
      mounted = false;
    };
  }, []);


  return (
    <mesh ref={meshRef} position={position} rotation={rotation} castShadow={castShadow} receiveShadow={receiveShadow}>
      {geometry}
      <AudioShaderMaterial baseColor={baseColor} />
    </mesh>
  );
}
