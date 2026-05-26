"use client";

import { createContext, useContext, useState, useRef, ReactNode, RefObject } from "react";
import * as THREE from "three";

export type FurnitureTab = "chair" | "table" | "roundTable" | "bancoMehinaku" | "bancoWauja";
export type TextureMode = "solid" | "waveform" | "fft" | "spectrogram" | "combined";

export interface FurnitureParams {
  // Aba ativa
  activeTab: FurnitureTab;
  
  // Parâmetros da Cadeira
  chairSeatWidth: number;
  chairSeatDepth: number;
  chairSeatHeight: number;
  chairBackHeight: number;
  chairLegHeight: number;
  chairColor: string;
  
  // Parâmetros da Mesa
  tableTopWidth: number;
  tableTopDepth: number;
  tableTopHeight: number;
  tableLegHeight: number;
  tableColor: string;
  
  // Parâmetros da Mesa Redonda
  roundTableTopRadius: number;
  roundTableTopHeight: number;
  roundTableBaseTopRadius: number;
  roundTableBaseBottomRadius: number;
  roundTableBaseHeight: number;
  roundTableColor: string;
  
  // Parâmetros do Banco Mehinaku
  bancoMehinakuTopWidth: number;
  bancoMehinakuTopDepth: number;
  bancoMehinakuTopHeight: number;
  bancoMehinakuLegHeight: number;
  bancoMehinakuLegCurve: number;
  bancoMehinakuColor: string;
  
  // Parâmetros do Banco Waujá
  bancoWaujaWidth: number;
  bancoWaujaDepth: number;
  bancoWaujaHeight: number;
  bancoWaujaTopCurve: number;
  bancoWaujaColor: string;
  
  // Configurações de visualização
  autoRotate: boolean;
  rotationSpeed: number;
  showWireframe: boolean;
  showGrid: boolean;
  
  // Configurações de textura de áudio
  textureMode: TextureMode;
  waveIntensity: number;
  fftIntensity: number;
  spectrogramIntensity: number;
  animationSpeed: number;
  animationPaused: boolean;
  
  // Configurações de segmentos (modo segmentado)
  segmentLayers: number;
  segmentsPerLayer: number;
  segmentSize: number;
  segmentGap: number;
}

interface DesignContextType {
  params: FurnitureParams;
  setParams: (params: Partial<FurnitureParams>) => void;
  resetParams: () => void;
  sceneRef: RefObject<THREE.Group | null>;
}

const defaultParams: FurnitureParams = {
  // Aba ativa
  activeTab: "chair",
  
  // Cadeira
  chairSeatWidth: 0.45,
  chairSeatDepth: 0.45,
  chairSeatHeight: 0.05,
  chairBackHeight: 0.5,
  chairLegHeight: 0.45,
  chairColor: "#8B4513",
  
  // Mesa
  tableTopWidth: 1.2,
  tableTopDepth: 0.8,
  tableTopHeight: 0.05,
  tableLegHeight: 0.75,
  tableColor: "#654321",
  
  // Mesa Redonda
  roundTableTopRadius: 0.45,
  roundTableTopHeight: 0.04,
  roundTableBaseTopRadius: 0.18,
  roundTableBaseBottomRadius: 0.28,
  roundTableBaseHeight: 0.7,
  roundTableColor: "#8B5A2B",
  
  // Banco Mehinaku
  bancoMehinakuTopWidth: 0.55,
  bancoMehinakuTopDepth: 0.32,
  bancoMehinakuTopHeight: 0.04,
  bancoMehinakuLegHeight: 0.2,
  bancoMehinakuLegCurve: 0.3,
  bancoMehinakuColor: "#5D4037",
  
  // Banco Waujá
  bancoWaujaWidth: 0.5,
  bancoWaujaDepth: 0.3,
  bancoWaujaHeight: 0.25,
  bancoWaujaTopCurve: 0.05,
  bancoWaujaColor: "#6B4423",
  
  // Visualização
  autoRotate: true,
  rotationSpeed: 0.5,
  showWireframe: false,
  showGrid: true,
  
  // Textura de áudio
  textureMode: "waveform",
  waveIntensity: 0.8,
  fftIntensity: 0.8,
  spectrogramIntensity: 0.9,
  animationSpeed: 1.0,
  animationPaused: false,
  
  // Segmentos
  segmentLayers: 50,
  segmentsPerLayer: 32,
  segmentSize: 0.02,
  segmentGap: 0.005,
};

const DesignContext = createContext<DesignContextType | null>(null);

export function FurnitureProvider({ children }: { children: ReactNode }) {
  const [params, setParamsState] = useState<FurnitureParams>(defaultParams);
  const sceneRef = useRef<THREE.Group | null>(null);

  const setParams = (newParams: Partial<FurnitureParams>) => {
    setParamsState((prev) => ({ ...prev, ...newParams }));
  };

  const resetParams = () => {
    setParamsState(defaultParams);
  };

  return (
    <DesignContext.Provider value={{ params, setParams, resetParams, sceneRef }}>
      {children}
    </DesignContext.Provider>
  );
}

export function useFurniture() {
  const context = useContext(DesignContext);
  if (!context) {
    throw new Error("useFurniture must be used within a FurnitureProvider");
  }
  return context;
}
