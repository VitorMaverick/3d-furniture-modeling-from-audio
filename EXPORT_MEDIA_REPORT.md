# Export Media — Implementation Report

**Date:** 2026-05-27  
**Branch:** feature/ai-generative-initial  
**Result:** SUCCESS — build passes, 0 TypeScript errors

---

## Files Created

| File | Purpose |
|------|---------|
| `lib/recording-context.tsx` | React context holding recording state + refs to gl renderer and canvas |
| `lib/image-capture-context.tsx` | Bridge context to pass `captureImage` from inside Canvas to outside (Sidebar) |
| `hooks/useExportImage.ts` | R3F hook: high-res image capture via WebGLRenderTarget + readRenderTargetPixels |
| `hooks/useExportVideo.ts` | Browser hook: 360° video via captureStream() + MediaRecorder |
| `hooks/useExportGIF.ts` | Browser hook: animated GIF via gif.js with dynamic import (avoids SSR crash) |
| `components/furniture-viewer/recording-controller.tsx` | R3F component inside Canvas: drives Y-axis rotation during recording via useFrame |
| `components/furniture-viewer/image-capture-bridge.tsx` | R3F component inside Canvas: registers captureImage in the bridge context |
| `public/gif.worker.js` | Web Worker required by gif.js for GIF encoding (copied from node_modules) |
| `EXPORT_MEDIA_PLAN.md` | Implementation plan |

## Files Modified

| File | Change |
|------|--------|
| `components/furniture-viewer/scene.tsx` | Added `preserveDrawingBuffer: true` to Canvas gl prop; imported and rendered `RecordingController` + `ImageCaptureBridge` |
| `components/furniture-viewer/index.tsx` | Wrapped providers: `RecordingProvider` + `ImageCaptureProvider` around the viewer |
| `components/furniture-viewer/sidebar.tsx` | Added full "Exportar Mídia" section (image/video/GIF) + recording progress overlay with cancel button |

## Dependencies Installed

| Package | Version | Note |
|---------|---------|------|
| `gif.js` | ^0.2.0 | GIF encoding |
| `@types/gif.js` | ^0.2.5 | TypeScript types |

Installed via `pnpm` (npm had an arborist bug with this project's pnpm node_modules layout).

---

## Formats Supported

### Image
- **PNG** — lossless, full alpha
- **JPEG** — compressed (0.95 quality)
- **WebP** — compressed (0.95 quality)
- Resolutions: **1080p** (1920×1080) and **4K** (3840×2160)
- Captured via `WebGLRenderTarget` + `readRenderTargetPixels` → offscreen canvas → `toDataURL`

### Video
- **WebM** (VP9 → VP8 → generic WebM fallback; MP4 if browser supports)
- Durations: 3s / 5s / 10s
- FPS: 24 / 30
- Captured via `canvas.captureStream(fps)` + `MediaRecorder`
- Furniture group auto-rotates 360° during recording

### Animated GIF
- **GIF** (gif.js encoder with Web Worker)
- Durations: 3s / 5s
- FPS: 10 / 15
- Downscaled to max 640px wide for reasonable file size
- Furniture group auto-rotates during recording

---

## Architecture Notes

- `preserveDrawingBuffer: true` is required for `toDataURL()` on the WebGL canvas — added to `<Canvas gl={...}>`.
- `gif.js/dist/gif.js` accesses `navigator` at module scope (SSR crash). Fixed by using dynamic `import()` inside the hook's async function — only loads in the browser.
- The `useExportImage` hook uses `useThree()` and must be inside the R3F Canvas. The `ImageCaptureBridge` component registers the function into `ImageCaptureContext` so the Sidebar can call `triggerCapture()` from outside the Canvas.
- Recording rotation is driven by `RecordingController` (a null-render R3F component using `useFrame`), completely independent of the existing `OrbitControls` autoRotate feature.

## Known Limitations

1. **Video codec**: MP4 is rarely supported by `MediaRecorder` in browsers (it's a Chrome experiment). Output will almost always be WebM. Users can convert with ffmpeg if needed.
2. **GIF file size**: Even at 640px, a 5s 15fps GIF can be 2–10 MB. Quality setting of 10 (gif.js scale: lower = better) provides a reasonable tradeoff.
3. **Image quality**: The offscreen `WebGLRenderTarget` renders the scene without the browser's anti-aliasing pass. MSAA is configured via the main Canvas `antialias: true` but the render target uses a single sample. Result is still high-quality at 4K.
4. **OBJ/STL exports**: Unchanged and verified to still work — they operate on `sceneRef.current` (THREE.Group), unaffected by the new providers.
