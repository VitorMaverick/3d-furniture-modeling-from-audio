"use client";

import { useThree } from "@react-three/fiber";
import { useCallback } from "react";
import * as THREE from "three";

export type ImageFormat = "png" | "jpeg" | "webp";
export type ImageResolution = "1080p" | "4k";

const RESOLUTIONS: Record<ImageResolution, { width: number; height: number }> = {
  "1080p": { width: 1920, height: 1080 },
  "4k": { width: 3840, height: 2160 },
};

function downloadDataURL(dataURL: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataURL;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function useExportImage() {
  const { gl, scene, camera } = useThree();

  const captureImage = useCallback(
    (format: ImageFormat = "png", resolution: ImageResolution = "1080p") => {
      const mimeType = `image/${format}`;
      const quality = format === "png" ? undefined : 0.95;
      const { width, height } = RESOLUTIONS[resolution];

      // Save original viewport size
      const originalWidth = gl.domElement.width;
      const originalHeight = gl.domElement.height;
      const originalPixelRatio = gl.getPixelRatio();

      // Offscreen render target at requested resolution
      const renderTarget = new THREE.WebGLRenderTarget(width, height, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        type: THREE.UnsignedByteType,
      });

      gl.setRenderTarget(renderTarget);
      gl.setSize(width, height, false);
      gl.render(scene, camera);

      // Read pixels
      const pixels = new Uint8Array(width * height * 4);
      gl.readRenderTargetPixels(renderTarget, 0, 0, width, height, pixels);

      // Restore renderer
      gl.setRenderTarget(null);
      gl.setSize(originalWidth / originalPixelRatio, originalHeight / originalPixelRatio, false);
      gl.setPixelRatio(originalPixelRatio);
      renderTarget.dispose();

      // Flip vertically (WebGL is bottom-to-top)
      const flipped = new Uint8ClampedArray(width * height * 4);
      for (let row = 0; row < height; row++) {
        const srcRow = height - 1 - row;
        for (let col = 0; col < width; col++) {
          const srcIdx = (srcRow * width + col) * 4;
          const dstIdx = (row * width + col) * 4;
          flipped[dstIdx + 0] = pixels[srcIdx + 0];
          flipped[dstIdx + 1] = pixels[srcIdx + 1];
          flipped[dstIdx + 2] = pixels[srcIdx + 2];
          flipped[dstIdx + 3] = pixels[srcIdx + 3];
        }
      }

      // Paint to offscreen canvas -> dataURL
      const offscreen = document.createElement("canvas");
      offscreen.width = width;
      offscreen.height = height;
      const ctx2d = offscreen.getContext("2d")!;
      ctx2d.putImageData(new ImageData(flipped, width, height), 0, 0);

      const dataURL = offscreen.toDataURL(mimeType, quality);
      const ext = format === "jpeg" ? "jpg" : format;
      downloadDataURL(dataURL, `furniture-${resolution}.${ext}`);
    },
    [gl, scene, camera]
  );

  return { captureImage };
}
