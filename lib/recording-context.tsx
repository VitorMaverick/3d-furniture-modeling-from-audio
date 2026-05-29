"use client";

import { createContext, useContext, useState, useRef, useCallback, ReactNode, MutableRefObject } from "react";
import * as THREE from "three";

export type RecordingType = "video" | "gif" | null;

export interface RecordingState {
  isRecording: boolean;
  recordingType: RecordingType;
  progress: number; // 0-100
}

interface RecordingContextType {
  recordingState: RecordingState;
  setRecordingState: (state: Partial<RecordingState>) => void;
  glRef: MutableRefObject<THREE.WebGLRenderer | null>;
  canvasRef: MutableRefObject<HTMLCanvasElement | null>;
  // When set, the RecordingController applies this exact rotation (radians)
  // instead of advancing rotation by delta. Used by GIF capture to keep
  // rotation in lockstep with frame index.
  rotationOverrideRef: MutableRefObject<number | null>;
}

const RecordingContext = createContext<RecordingContextType | null>(null);

export function RecordingProvider({ children }: { children: ReactNode }) {
  const [recordingState, setRecordingStateRaw] = useState<RecordingState>({
    isRecording: false,
    recordingType: null,
    progress: 0,
  });

  const glRef = useRef<THREE.WebGLRenderer | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rotationOverrideRef = useRef<number | null>(null);

  const setRecordingState = useCallback((partial: Partial<RecordingState>) => {
    setRecordingStateRaw((prev) => ({ ...prev, ...partial }));
  }, []);

  return (
    <RecordingContext.Provider value={{ recordingState, setRecordingState, glRef, canvasRef, rotationOverrideRef }}>
      {children}
    </RecordingContext.Provider>
  );
}

export function useRecording() {
  const ctx = useContext(RecordingContext);
  if (!ctx) throw new Error("useRecording must be used within RecordingProvider");
  return ctx;
}
