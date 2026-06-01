# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Development Server:** `pnpm dev`
- **Build Project:** `pnpm build`
- **Run Production:** `pnpm start`
- **Code Linting:** `pnpm lint`
- **TypeScript Type-checking:** `pnpm exec tsc --noEmit`
- **Test Suite:** No testing framework is currently configured in this repository.

---

## High-Level Architecture & Structure

This project is an interactive parametric 3D modeling web application built with **Next.js** and **React Three Fiber (Three.js)**. It models furniture inspired by indigenous Brazilian designs (such as Mehinaku and Wauja) and procedurally deforms them based on audio or generated AI parameters.

### 1. State Management
- **`lib/furniture-context.tsx`**: The main global context (`FurnitureProvider`). Manages active tab/furniture type, individual parametric dimensions, texture modes (`solid`, `waveform`, `fft`, `spectrogram`, `combined`, `ai-image`), visual parameters, and AI-generated Wave parameters (`aiWaveParams`).
- **`lib/recording-context.tsx`**: Manages video/image capture and export state.
- **`lib/image-capture-context.tsx`**: Coordinates WebGL rendering buffer captures.

### 2. Rendering & 3D Engine
- **`components/furniture-viewer/scene.tsx`**: Configures the Three.js canvas, perspective camera, lights, contact shadows, reference grids, and orbits. Due to WebGL SSR limitations, it is dynamically imported with `ssr: false` in `components/furniture-viewer/index.tsx`.
- **Procedural Geometry (`components/furniture-viewer/segmented-furniture.tsx`)**: Contains mathematical functions mapping frequencies, times, and AI parameters (complexity, density, roughness, rhythm regularity, sub-bass energy, bass/treble etc.) to geometric transformations (radial displacement, spacing, height, thickness, fine texture, and colors).
- **Furniture Components**: Contains parametric mesh implementations such as `chair.tsx`, `table.tsx`, `round-table.tsx`, `banco-mehinaku.tsx` (threaded screws), `banco-mehinaku-perfurado.tsx` (clover/cross holes), and `banco-wauja.tsx`.

### 3. Audio & Shaders
- **`lib/audio-texture-shader.ts`**: Implements custom GLSL Shaders for audio material render visualization.
- **`lib/ai-wave-provider.ts`**: Provides fallback structures and helpers for AI/frequency analysis data.

### 4. Utilities & Exports
- **`lib/stl-exporter.ts`**: Exporters for OBJ and STL 3D-printable formats.
- **Export Hooks (`hooks/`)**: Client-side media recording/saving features (`useExportGIF`, `useExportVideo`, `useExportImage`).

---
