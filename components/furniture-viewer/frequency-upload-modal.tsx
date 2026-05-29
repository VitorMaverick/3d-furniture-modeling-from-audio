"use client";

import { useState, useRef } from "react";
import { useFurniture } from "@/lib/furniture-context";
import type { AIWaveParams } from "@/lib/furniture-context";
import { Button } from "@/components/ui/button";
import { Sparkles, Upload, X, CheckCircle, Loader2 } from "lucide-react";

interface AnalysisResult {
  params: AIWaveParams;
  provider: string;
}

export function FrequencyUploadSection() {
  const { setParams, params } = useFurniture();
  const [isOpen, setIsOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAIActive = params.textureMode === "ai-image";

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Apenas imagens PNG, JPG ou WebP são aceitas.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Imagem muito grande. Máximo: 5MB.");
      return;
    }
    setError(null);
    setResult(null);
    setImageFile(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleReset(e?: React.MouseEvent) {
    e?.stopPropagation();
    setImageFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    if (params.textureMode === "ai-image") {
      setParams({ textureMode: "waveform", aiWaveParams: null });
    }
  }

  async function handleAnalyze() {
    if (!imageFile) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      const res = await fetch("/api/analyze-frequency", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao analisar");
      setResult(data as AnalysisResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao analisar imagem.");
    } finally {
      setIsAnalyzing(false);
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
          <h2 className="text-sm font-semibold">IA Generativa de Ondas</h2>
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
          Envie um gráfico de frequência para customizar as ondas do móvel com IA.
        </p>
      )}

      {isOpen && (
        <div className="space-y-3 pt-1">
          {/* Drop zone */}
          <div
            className={`relative flex min-h-[80px] cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed transition-colors ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border/70 hover:border-primary/50 hover:bg-accent/30"
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            {previewUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Preview do gráfico"
                  className="max-h-32 w-full rounded object-contain"
                />
                <button
                  className="absolute right-1.5 top-1.5 rounded-full bg-background/80 p-0.5 hover:bg-destructive/20"
                  onClick={handleReset}
                >
                  <X className="h-3 w-3" />
                </button>
              </>
            ) : (
              <>
                <Upload className="mb-1 h-5 w-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Clique ou arraste uma imagem
                </span>
                <span className="text-[10px] text-muted-foreground/60">
                  PNG, JPG, WebP — máx. 5MB
                </span>
              </>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />

          {error && <p className="text-xs text-destructive">{error}</p>}

          {imageFile && !result && (
            <Button
              size="sm"
              className="w-full"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Analisando com IA...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-3 w-3" />
                  Analisar Frequência
                </>
              )}
            </Button>
          )}

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
                  onClick={() => handleReset()}
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
