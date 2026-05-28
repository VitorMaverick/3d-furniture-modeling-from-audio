"use client";

import { useCallback, useRef, useState } from "react";
import { useRecording } from "@/lib/recording-context";

export type VideoDuration = 3 | 5 | 10;
export type VideoFPS = 24 | 30;

function getBestMimeType(): string {
  const candidates = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
    "video/mp4",
  ];
  for (const candidate of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(candidate)) {
      return candidate;
    }
  }
  return "video/webm";
}

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

export function useExportVideo() {
  const { canvasRef, setRecordingState } = useRecording();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const cancelledRef = useRef(false);
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = useCallback(
    (durationSec: VideoDuration = 5, fps: VideoFPS = 30) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        console.warn("[useExportVideo] canvas not available yet");
        return;
      }

      cancelledRef.current = false;
      chunksRef.current = [];

      const stream = (canvas as HTMLCanvasElement & { captureStream: (fps: number) => MediaStream }).captureStream(fps);
      const mimeType = getBestMimeType();
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      const totalMs = durationSec * 1000;

      recorder.onstop = async () => {
        if (!cancelledRef.current) {
          const ext = mimeType.startsWith("video/mp4") ? "mp4" : "webm";
          const rawBlob = new Blob(chunksRef.current, { type: mimeType });
          // MediaRecorder produces WebM without a Duration tag in the EBML header,
          // which makes most players (and HTML5 <video>) unable to seek or report length.
          // Patch the blob with the actual duration before downloading.
          let outBlob = rawBlob;
          if (ext === "webm") {
            try {
              const { default: fixWebmDuration } = await import("fix-webm-duration");
              outBlob = await fixWebmDuration(rawBlob, totalMs, { logger: false });
            } catch (err) {
              console.warn("[useExportVideo] failed to patch WebM duration, downloading raw blob", err);
            }
          }
          downloadBlob(outBlob, `furniture-360.${ext}`);
        }
        setIsRecording(false);
        setRecordingState({ isRecording: false, recordingType: null, progress: 0 });
      };

      recorder.start(100); // collect data every 100ms
      setIsRecording(true);
      setRecordingState({ isRecording: true, recordingType: "video", progress: 0 });

      const startTime = performance.now();

      const tick = () => {
        if (cancelledRef.current) return;
        const elapsed = performance.now() - startTime;
        const progress = Math.min(100, (elapsed / totalMs) * 100);
        setRecordingState({ progress });

        if (elapsed < totalMs) {
          requestAnimationFrame(tick);
        } else {
          recorder.stop();
        }
      };
      requestAnimationFrame(tick);
    },
    [canvasRef, setRecordingState]
  );

  const cancelRecording = useCallback(() => {
    cancelledRef.current = true;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setRecordingState({ isRecording: false, recordingType: null, progress: 0 });
  }, [setRecordingState]);

  return { isRecording, startRecording, cancelRecording };
}
