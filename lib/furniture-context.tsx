"use client";

import { createContext, useContext, useState, useRef, useCallback, ReactNode, RefObject } from "react";
import * as THREE from "three";

export type FurnitureTab = "chair" | "table" | "roundTable" | "bancoMehinaku" | "bancoMehinakuPerfurado" | "bancoWauja";
export type TextureMode = "solid" | "waveform" | "fft" | "spectrogram" | "combined" | "ai-image";

export interface AIWaveParams {
  lowFreqAmplitude: number;
  midFreqAmplitude: number;
  highFreqAmplitude: number;
  complexity: number;
  density: number;
  dominantBand: "low" | "mid" | "high";
  colorPalette: string[];
  message: string;
  
  // Novos campos (opcionais para retrocompatibilidade)
  roughness?: number;
  brightness?: number;
  temporalVariance?: number;
  rhythmicRegularity?: number;
  subBassEnergy?: number;
  bassEnergy?: number;
  lowMidEnergy?: number;
  midEnergy?: number;
  highMidEnergy?: number;
  trebleEnergy?: number;
}

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
  bancoMehinakuColumnRadius: number; // Raio das colunas (parafusos de rosca)
  
  // Parâmetros do Banco Mehinaku Perfurado
  bancoMehinakuPerfuradoTopWidth: number;
  bancoMehinakuPerfuradoTopDepth: number;
  bancoMehinakuPerfuradoTopHeight: number;
  bancoMehinakuPerfuradoLegHeight: number;
  bancoMehinakuPerfuradoColor: string;
  bancoMehinakuPerfuradoHoleSize: number; // Tamanho dos furos na chapa
  bancoMehinakuPerfuradoPlateThickness: number; // Espessura da chapa
  bancoMehinakuPerfuradoHolePattern: "clover" | "cross"; // Padrão dos furos
  
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

  // Modo IA — parâmetros gerados pela análise de imagem de frequência
  aiWaveParams: AIWaveParams | null;
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
  bancoMehinakuColumnRadius: 0.018, // Raio das colunas (parafusos de rosca) - aumentado para maior robustez
  
  // Banco Mehinaku Perfurado
  bancoMehinakuPerfuradoTopWidth: 0.55,
  bancoMehinakuPerfuradoTopDepth: 0.32,
  bancoMehinakuPerfuradoTopHeight: 0.04,
  bancoMehinakuPerfuradoLegHeight: 0.2,
  bancoMehinakuPerfuradoColor: "#424242", // Cor metálica
  bancoMehinakuPerfuradoHoleSize: 0.025, // Tamanho dos furos - definido para máximo por padrão
  bancoMehinakuPerfuradoPlateThickness: 0.004, // Espessura da chapa - aumentado para mais resistência
  bancoMehinakuPerfuradoHolePattern: "clover" as const, // Padrão dos furos: "clover" (trevo) ou "cross" (cruz)
  
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

  // Modo IA
  aiWaveParams: null,
};

const DesignContext = createContext<DesignContextType | null>(null);

export function FurnitureProvider({ children }: { children: ReactNode }) {
  const [params, setParamsState] = useState<FurnitureParams>(defaultParams);
  const sceneRef = useRef<THREE.Group | null>(null);

  const setParams = useCallback((newParams: Partial<FurnitureParams>) => {
    setParamsState((prev) => ({ ...prev, ...newParams }));
  }, []);

  const resetParams = useCallback(() => {
    setParamsState(defaultParams);
  }, []);

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
