"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useRecording } from "@/lib/recording-context";
import { useFurniture } from "@/lib/furniture-context";

/**
 * RecordingController lives INSIDE the R3F Canvas.
 * Responsibilities:
 *  1. Store gl and canvas refs so hooks outside Canvas can access them
 *  2. Rotate the furniture group during recording
 */
export function RecordingController() {
  const { gl } = useThree();
  const { recordingState, glRef, canvasRef, rotationOverrideRef } = useRecording();
  const { sceneRef } = useFurniture();

  // Store renderer and canvas refs once on mount
  useEffect(() => {
    glRef.current = gl;
    canvasRef.current = gl.domElement;
  }, [gl, glRef, canvasRef]);

  // Rotation state for recording animation
  const rotationRef = useRef(0);

  useFrame((_, delta) => {
    if (!recordingState.isRecording) return;
    if (!sceneRef.current) return;

    // If a frame-driven override is set (used by GIF capture), apply it directly.
    // This keeps rotation locked to frame index instead of wall-clock time,
    // so the GIF doesn't appear to rotate faster than intended when the
    // encoder slows the capture loop.
    if (rotationOverrideRef.current !== null) {
      sceneRef.current.rotation.y = rotationOverrideRef.current;
      rotationRef.current = rotationOverrideRef.current;
      return;
    }

    // Default: one full revolution per recording duration.
    // Video recording uses real-time capture so wall-clock-based rotation is fine.
    rotationRef.current += (delta * Math.PI * 2) / 5;
    sceneRef.current.rotation.y = rotationRef.current;
  });

  // Reset rotation when recording stops
  useEffect(() => {
    if (!recordingState.isRecording && sceneRef.current) {
      sceneRef.current.rotation.y = 0;
      rotationRef.current = 0;
      rotationOverrideRef.current = null;
    }
  }, [recordingState.isRecording, sceneRef, rotationOverrideRef]);

  return null;
}
