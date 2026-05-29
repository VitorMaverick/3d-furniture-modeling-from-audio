# Export Media — Implementation Plan

**Date:** 2026-05-27  
**Branch:** feature/ai-generative-initial

## Analysis Summary

- Canvas is in `components/furniture-viewer/scene.tsx`, uses `gl={{ antialias: true, alpha: true }}` — needs `preserveDrawingBuffer: true` added
- The `sceneRef` (THREE.Group) is already in `FurnitureContext` and references the active furniture group
- `OrbitControls` has `autoRotate`/`autoRotateSpeed` props already wired — we'll use a **separate recording rotation** via a ref + useFrame so it doesn't interfere with user controls
- Sidebar is in `components/furniture-viewer/sidebar.tsx` — styled with shadcn/radix components; we'll follow the exact same pattern as the "Exportar Modelo 3D" section
- Hooks live in `hooks/` folder

## Steps

1. **Canvas** — add `preserveDrawingBuffer: true` to `gl` prop in `scene.tsx`
2. **Recording context** — extend `FurnitureContext` with `isRecording: boolean` + `recordingRotation: number` ref so R3F components can read it during useFrame; OR use a new lightweight `RecordingContext`
   - Decision: add a `glRef` (WebGLRenderer ref) and `recordingState` to FurnitureContext so hooks inside Canvas can access the renderer
3. **`hooks/useExportImage.ts`** — pure function that reads `gl.domElement.toDataURL()`. Must be called from inside a component that uses `useThree()`. Expose `captureImage(format, resolution)`.
4. **`hooks/useExportVideo.ts`** — uses `canvas.captureStream(fps)` + MediaRecorder. Drives rotation via a shared `isRecording` flag read by `SceneContent` via `useFrame`.
5. **`hooks/useExportGIF.ts`** — installs `gif.js`, copies worker to `public/`, captures frames, encodes GIF.
6. **`components/furniture-viewer/recording-controller.tsx`** — R3F component (lives inside Canvas) that uses `useFrame` to apply rotation during recording. Reads/writes a shared `RecordingContext`.
7. **`lib/recording-context.tsx`** — lightweight context holding `{ isRecording, setIsRecording, rotationProgress }` accessible both inside and outside Canvas.
8. **Sidebar** — new "Exportar Mídia" section after "Exportar Modelo 3D", with Image/Video/GIF sub-sections and a progress overlay.

## Dependencies to install

```
npm install gif.js
npm install --save-dev @types/gif.js
```

## Key constraints respected

- No `useFBO`, no third-party recorder libs
- `"use client"` on all client components
- Hooks using `useThree()` are used inside Canvas-scoped components
- gif.js worker copied to `public/gif.worker.js`
