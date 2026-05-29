"use client";

import { createContext, useContext, useRef, useCallback, ReactNode, MutableRefObject } from "react";
import type { ImageFormat, ImageResolution } from "@/hooks/useExportImage";

interface ImageCaptureContextType {
  captureRef: MutableRefObject<((format: ImageFormat, resolution: ImageResolution) => void) | null>;
  triggerCapture: (format: ImageFormat, resolution: ImageResolution) => void;
}

const ImageCaptureContext = createContext<ImageCaptureContextType | null>(null);

export function ImageCaptureProvider({ children }: { children: ReactNode }) {
  const captureRef = useRef<((format: ImageFormat, resolution: ImageResolution) => void) | null>(null);

  const triggerCapture = useCallback((format: ImageFormat, resolution: ImageResolution) => {
    if (captureRef.current) {
      captureRef.current(format, resolution);
    } else {
      console.warn("[ImageCaptureContext] capture function not yet registered");
    }
  }, []);

  return (
    <ImageCaptureContext.Provider value={{ captureRef, triggerCapture }}>
      {children}
    </ImageCaptureContext.Provider>
  );
}

export function useImageCapture() {
  const ctx = useContext(ImageCaptureContext);
  if (!ctx) throw new Error("useImageCapture must be used within ImageCaptureProvider");
  return ctx;
}
