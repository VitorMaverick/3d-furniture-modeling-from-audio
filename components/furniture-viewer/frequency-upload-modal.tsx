"use client";

import { useState } from "react";
import { useFurniture } from "@/lib/furniture-context";
import type { AIWaveParams } from "@/lib/furniture-context";
import { Button } from "@/components/ui/button";
import { Sparkles, X, CheckCircle } from "lucide-react";

interface AnalysisResult {
  params: AIWaveParams;
  provider: string;
}

export function FrequencyUploadSection() {
  const { setParams, params } = useFurniture();
  const [isOpen, setIsOpen] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [audioParamsText, setAudioParamsText] = useState("");

  const isAIActive = params.textureMode === "ai-image";

  function handleApplyJSON() {
    setError(null);
    if (!audioParamsText.trim()) {
      setError("Por favor, insira o JSON com os parâmetros.");
      return;
    }

    try {
      const parsed = JSON.parse(audioParamsText);

      if (typeof parsed !== "object" || parsed === null) {
        setError("O JSON deve ser um objeto.");
        return;
      }

      // Valida se contém os campos obrigatórios
      if (typeof parsed.lowFreqAmplitude !== "number") {
        setError("O campo 'lowFreqAmplitude' é obrigatório e deve ser um número.");
        return;
      }
      if (typeof parsed.midFreqAmplitude !== "number") {
        setError("O campo 'midFreqAmplitude' é obrigatório e deve ser um número.");
        return;
      }
      if (typeof parsed.highFreqAmplitude !== "number") {
        setError("O campo 'highFreqAmplitude' é obrigatório e deve ser um número.");
        return;
      }

      if (!Array.isArray(parsed.colorPalette)) {
        setError("O campo 'colorPalette' é obrigatório e deve ser uma array de cores (strings).");
        return;
      }
      if (parsed.colorPalette.some((c: any) => typeof c !== "string")) {
        setError("Todos os itens de 'colorPalette' devem ser strings (ex: '#ffffff').");
        return;
      }
      if (parsed.colorPalette.length === 0) {
        setError("A array 'colorPalette' não pode estar vazia.");
        return;
      }

      // Calcula dominantBand se não estiver presente no JSON
      let dominantBand = parsed.dominantBand;
      if (dominantBand !== "low" && dominantBand !== "mid" && dominantBand !== "high") {
        const low = parsed.lowFreqAmplitude;
        const mid = parsed.midFreqAmplitude;
        const high = parsed.highFreqAmplitude;
        if (low >= mid && low >= high) {
          dominantBand = "low";
        } else if (high >= low && high >= mid) {
          dominantBand = "high";
        } else {
          dominantBand = "mid";
        }
      }

      const validatedParams: AIWaveParams = {
        lowFreqAmplitude: parsed.lowFreqAmplitude,
        midFreqAmplitude: parsed.midFreqAmplitude,
        highFreqAmplitude: parsed.highFreqAmplitude,
        complexity: typeof parsed.complexity === "number" ? parsed.complexity : 0.5,
        density: typeof parsed.density === "number" ? parsed.density : 0.5,
        dominantBand,
        colorPalette: parsed.colorPalette,
        message: typeof parsed.message === "string" ? parsed.message : "Parâmetros JSON aplicados com sucesso",
        ...parsed,
      };

      setResult({ params: validatedParams, provider: "JSON Manual" });
      setParams({ textureMode: "ai-image", aiWaveParams: validatedParams });
    } catch (err) {
      setError(err instanceof Error ? `Erro de sintaxe JSON: ${err.message}` : "Erro ao processar JSON.");
    }
  }

  function handleReset() {
    setResult(null);
    setError(null);
    if (params.textureMode === "ai-image") {
      setParams({ textureMode: "waveform", aiWaveParams: null });
    }
  }

  function handleApply() {
    if (!result) return;
    setParams({ textureMode: "ai-image", aiWaveParams: result.params });
  }

  return (
    <div className="space-y-3 rounded-lg border border-border/50 bg-card/50 p-4">
      {/* Header — clickable toggle */}
      <button
        className="flex w-full items-center justify-between"
        onClick={() => setIsOpen((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Modelagem Paramétrica</h2>
        </div>
        <div className="flex items-center gap-1.5">
          {isAIActive && (
            <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary">
              ATIVO
            </span>
          )}
          <span className="text-xs text-muted-foreground">{isOpen ? "▲" : "▼"}</span>
        </div>
      </button>

      {!isOpen && (
        <p className="text-xs text-muted-foreground">
          Ajuste os parâmetros para modelar a geometria do móvel.
        </p>
      )}

      {isOpen && (
        <div className="space-y-3 pt-1">
          {/* Campo para parametros do Python */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">
              Parâmetros do Modelo
            </label>
            <textarea
              className="w-full h-44 rounded border border-border/50 bg-background p-2 text-xs font-mono resize-none"
              placeholder='{
  "lowFreqAmplitude": 0.7,
  "midFreqAmplitude": 0.5,
  "highFreqAmplitude": 0.3,
  "colorPalette": ["#8B4513", "#D2691E", "#CD853F"]
}'
              value={audioParamsText}
              onChange={(e) => setAudioParamsText(e.target.value)}
            />
            <p className="text-[10px] text-muted-foreground/60">
              Cole o JSON com os parâmetros de modelagem
            </p>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <Button
            size="sm"
            className="w-full"
            onClick={handleApplyJSON}
          >
            <Sparkles className="mr-2 h-3 w-3" />
            Aplicar Parâmetros JSON
          </Button>

          {result && (
            <div className="space-y-2 rounded-md bg-muted/50 p-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-green-500" />
                <p className="text-xs text-foreground">{result.params.message}</p>
              </div>

              {/* Color palette preview */}
              <div className="flex gap-1">
                {result.params.colorPalette.map((color, i) => (
                  <div
                    key={i}
                    className="h-4 flex-1 rounded"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>

              {/* Band analysis */}
              <div className="grid grid-cols-3 gap-1 text-[10px] text-muted-foreground">
                <div className="rounded bg-background/50 px-1.5 py-1 text-center">
                  <div className="font-medium text-foreground">
                    {Math.round(result.params.lowFreqAmplitude * 100)}%
                  </div>
                  <div>Grave</div>
                </div>
                <div className="rounded bg-background/50 px-1.5 py-1 text-center">
                  <div className="font-medium text-foreground">
                    {Math.round(result.params.midFreqAmplitude * 100)}%
                  </div>
                  <div>Médio</div>
                </div>
                <div className="rounded bg-background/50 px-1.5 py-1 text-center">
                  <div className="font-medium text-foreground">
                    {Math.round(result.params.highFreqAmplitude * 100)}%
                  </div>
                  <div>Agudo</div>
                </div>
              </div>

              <p className="text-[10px] text-muted-foreground/70">via {result.provider}</p>

              <Button
                size="sm"
                className="w-full"
                variant={isAIActive ? "secondary" : "default"}
                onClick={handleApply}
              >
                {isAIActive ? (
                  <>
                    <CheckCircle className="mr-2 h-3 w-3 text-green-500" />
                    Ondas Aplicadas
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-3 w-3" />
                    Aplicar ao Móvel
                  </>
                )}
              </Button>

              {isAIActive && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full text-xs"
                  onClick={handleReset}
                >
                  Remover modo IA
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
