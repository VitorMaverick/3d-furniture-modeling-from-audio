"use client";

import { useEffect } from "react";
import { useExportImage } from "@/hooks/useExportImage";
import { useImageCapture } from "@/lib/image-capture-context";

/**
 * Lives inside R3F Canvas. Registers the captureImage function
 * into ImageCaptureContext so that the Sidebar (outside Canvas) can trigger it.
 */
export function ImageCaptureBridge() {
  const { captureImage } = useExportImage();
  const { captureRef } = useImageCapture();

  useEffect(() => {
    captureRef.current = captureImage;
    return () => {
      captureRef.current = null;
    };
  }, [captureImage, captureRef]);

  return null;
}
