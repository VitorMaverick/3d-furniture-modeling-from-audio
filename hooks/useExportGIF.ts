"use client";

import { useCallback, useRef, useState } from "react";
import { useRecording } from "@/lib/recording-context";
import type GIFType from "gif.js";

export type GIFDuration = 3 | 5;
export type GIFFPS = 10 | 15;

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function useExportGIF() {
  const { canvasRef, setRecordingState, rotationOverrideRef } = useRecording();
  const cancelledRef = useRef(false);
  const gifRef = useRef<GIFType | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = useCallback(
    async (durationSec: GIFDuration = 3, fps: GIFFPS = 10) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        console.warn("[useExportGIF] canvas not available");
        return;
      }

      cancelledRef.current = false;

      // Dynamic import to avoid SSR issues (gif.js accesses navigator at module scope)
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const GIFClass = (await import("gif.js/dist/gif.js" as string)).default as unknown as new (
        options?: GIFType.Options
      ) => GIFType;

      // Downscale GIF to 640xAuto for reasonable file size
      const scale = Math.min(1, 640 / canvas.width);
      const gifWidth = Math.round(canvas.width * scale);
      const gifHeight = Math.round(canvas.height * scale);

      const gif = new GIFClass({
        workers: 2,
        quality: 10,
        width: gifWidth,
        height: gifHeight,
        workerScript: "/gif.worker.js",
        repeat: 0, // loop forever
      });
      gifRef.current = gif;

      const totalFrames = durationSec * fps;
      const frameDelay = Math.round(1000 / fps);
      let framesCaptured = 0;

      setIsRecording(true);
      setRecordingState({ isRecording: true, recordingType: "gif", progress: 0 });

      // Offscreen canvas for downscaling
      const offscreen = document.createElement("canvas");
      offscreen.width = gifWidth;
      offscreen.height = gifHeight;
      const offCtx = offscreen.getContext("2d")!;

      // Lock rotation to frame index so each captured frame shows exactly the
      // rotation that will be displayed at GIF playback. Avoids "too fast"
      // playback caused by encoder jitter (when the capture loop runs slower
      // than wall-clock, the canvas rotates further than 1 frame's worth).
      const captureFrame = () => {
        if (cancelledRef.current) return;

        // Drive rotation by frame index: one full revolution across all frames.
        rotationOverrideRef.current = (framesCaptured / totalFrames) * Math.PI * 2;

        // Wait two rAFs so RecordingController applies the override and the
        // canvas paints with the new rotation before we sample it.
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (cancelledRef.current) return;

            offCtx.drawImage(canvas, 0, 0, gifWidth, gifHeight);
            gif.addFrame(offCtx, { copy: true, delay: frameDelay });

            framesCaptured++;
            const progress = Math.round((framesCaptured / totalFrames) * 80); // 0-80% for frame capture
            setRecordingState({ progress });

            if (framesCaptured < totalFrames) {
              captureFrame();
            } else {
              gif.render();
            }
          });
        });
      };

      gif.on("progress", (p) => {
        if (!cancelledRef.current) {
          setRecordingState({ progress: 80 + Math.round(p * 20) }); // 80-100% for encoding
        }
      });

      gif.on("finished", (blob) => {
        rotationOverrideRef.current = null;
        if (!cancelledRef.current) {
          downloadBlob(blob, "furniture-360.gif");
        }
        setIsRecording(false);
        setRecordingState({ isRecording: false, recordingType: null, progress: 0 });
      });

      captureFrame();
    },
    [canvasRef, setRecordingState]
  );

  const cancelRecording = useCallback(() => {
    cancelledRef.current = true;
    rotationOverrideRef.current = null;
    if (gifRef.current) {
      gifRef.current.abort();
      gifRef.current = null;
    }
    setIsRecording(false);
    setRecordingState({ isRecording: false, recordingType: null, progress: 0 });
  }, [setRecordingState, rotationOverrideRef]);

  return { isRecording, startRecording, cancelRecording };
}
