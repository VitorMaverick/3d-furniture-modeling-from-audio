"use client";

import { useFurniture, FurnitureTab, TextureMode } from "@/lib/furniture-context";
import { useRecording } from "@/lib/recording-context";
import { useImageCapture } from "@/lib/image-capture-context";
import { useExportVideo, VideoDuration, VideoFPS } from "@/hooks/useExportVideo";
import { useExportGIF, GIFDuration, GIFFPS } from "@/hooks/useExportGIF";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { RotateCcw, Armchair, Table2, Eye, Circle, Music, AudioWaveform, BarChart3, Layers, Pause, Play, Download, Camera, Video, Image, X } from "lucide-react";
import { exportToSTL, exportToOBJ } from "@/lib/stl-exporter";
import { FrequencyUploadSection } from "@/components/furniture-viewer/frequency-upload-modal";
import { useState } from "react";
import type { ImageFormat, ImageResolution } from "@/hooks/useExportImage";

export function Sidebar() {
  const { params, setParams, resetParams, sceneRef } = useFurniture();
  const [exportFormat, setExportFormat] = useState<"stl" | "obj">("stl");

  // Media export state
  const { triggerCapture } = useImageCapture();
  const { recordingState } = useRecording();
  const { isRecording: isVideoRecording, startRecording: startVideo, cancelRecording: cancelVideo } = useExportVideo();
  const { isRecording: isGIFRecording, startRecording: startGIF, cancelRecording: cancelGIF } = useExportGIF();
  const [imageResolution, setImageResolution] = useState<ImageResolution>("1080p");
  const [videoDuration, setVideoDuration] = useState<VideoDuration>(5);
  const [videoFPS, setVideoFPS] = useState<VideoFPS>(30);
  const [gifDuration, setGifDuration] = useState<GIFDuration>(3);
  const [gifFPS, setGifFPS] = useState<GIFFPS>(10);

  const anyRecording = isVideoRecording || isGIFRecording;

  const handleExport = () => {
    if (!sceneRef.current) {
      console.log("[v0] Scene ref not available");
      return;
    }
    
    const furnitureNames: Record<string, string> = {
      chair: "cadeira",
      table: "mesa",
      roundTable: "mesa-redonda",
      bancoMehinaku: "banco-mehinaku",
      bancoMehinakuPerfurado: "banco-mehinaku-perfurado",
      bancoWauja: "banco-wauja"
    };
    
    const filename = `${furnitureNames[params.activeTab]}-${params.textureMode}`;
    
    if (exportFormat === "stl") {
      exportToSTL(sceneRef.current, `${filename}.stl`);
    } else {
      exportToOBJ(sceneRef.current, `${filename}.obj`);
    }
  };

  return (
    <aside className="fixed left-0 top-0 z-20 hidden h-full w-80 border-r border-border/50 bg-background/95 backdrop-blur-xl md:block">
      <ScrollArea className="h-full">
        <div className="flex flex-col gap-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">Modelagem 3D</h1>
              <p className="text-sm text-muted-foreground">Moveis Interativos</p>
            </div>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" onClick={resetParams}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Exportar Modelo */}
          <div className="space-y-3 rounded-lg border border-border/50 bg-card/50 p-4">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">Exportar Modelo 3D</h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Exporte o modelo atual para impressao 3D
            </p>
            <div className="flex gap-2">
              <Button
                variant={exportFormat === "stl" ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => setExportFormat("stl")}
              >
                STL
              </Button>
              <Button
                variant={exportFormat === "obj" ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => setExportFormat("obj")}
              >
                OBJ
              </Button>
            </div>
            <Button 
              className="w-full" 
              onClick={handleExport}
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar {exportFormat.toUpperCase()}
            </Button>
          </div>

          {/* Recording progress overlay */}
          {anyRecording && (
            <div className="space-y-3 rounded-lg border border-primary/50 bg-primary/10 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                  <span className="text-sm font-semibold text-foreground">
                    {isGIFRecording ? "Gravando GIF..." : "Gravando Video..."}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={isGIFRecording ? cancelGIF : cancelVideo}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <Progress value={recordingState.progress} className="h-2" />
              <span className="text-xs text-muted-foreground">{Math.round(recordingState.progress)}%</span>
            </div>
          )}

          {/* Exportar Mídia */}
          <div className="space-y-3 rounded-lg border border-border/50 bg-card/50 p-4">
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">Exportar Mídia</h2>
            </div>

            {/* Image export */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Image className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Imagem</span>
              </div>
              <div className="flex gap-1.5">
                <Button
                  variant={imageResolution === "1080p" ? "default" : "outline"}
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => setImageResolution("1080p")}
                >
                  1080p
                </Button>
                <Button
                  variant={imageResolution === "4k" ? "default" : "outline"}
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => setImageResolution("4k")}
                >
                  4K
                </Button>
              </div>
              <div className="flex gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => triggerCapture("png", imageResolution)}
                >
                  PNG
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => triggerCapture("jpeg", imageResolution)}
                >
                  JPEG
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => triggerCapture("webp", imageResolution)}
                >
                  WebP
                </Button>
              </div>
            </div>

            <Separator className="my-1" />

            {/* Video export */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Video className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Video 360°</span>
              </div>
              <div className="flex gap-1.5">
                {([3, 5, 10] as VideoDuration[]).map((d) => (
                  <Button
                    key={d}
                    variant={videoDuration === d ? "default" : "outline"}
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => setVideoDuration(d)}
                  >
                    {d}s
                  </Button>
                ))}
              </div>
              <div className="flex gap-1.5">
                {([24, 30] as VideoFPS[]).map((f) => (
                  <Button
                    key={f}
                    variant={videoFPS === f ? "default" : "outline"}
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => setVideoFPS(f)}
                  >
                    {f} fps
                  </Button>
                ))}
              </div>
              <Button
                className="w-full"
                size="sm"
                disabled={anyRecording}
                onClick={() => startVideo(videoDuration, videoFPS)}
              >
                <Download className="mr-2 h-3.5 w-3.5" />
                {isVideoRecording ? "Gravando..." : "Gravar Video (WebM)"}
              </Button>
            </div>

            <Separator className="my-1" />

            {/* GIF export */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Camera className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">GIF Animado</span>
              </div>
              <div className="flex gap-1.5">
                {([3, 5] as GIFDuration[]).map((d) => (
                  <Button
                    key={d}
                    variant={gifDuration === d ? "default" : "outline"}
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => setGifDuration(d)}
                  >
                    {d}s
                  </Button>
                ))}
              </div>
              <div className="flex gap-1.5">
                {([10, 15] as GIFFPS[]).map((f) => (
                  <Button
                    key={f}
                    variant={gifFPS === f ? "default" : "outline"}
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => setGifFPS(f)}
                  >
                    {f} fps
                  </Button>
                ))}
              </div>
              <Button
                className="w-full"
                size="sm"
                disabled={anyRecording}
                onClick={() => startGIF(gifDuration, gifFPS)}
              >
                <Download className="mr-2 h-3.5 w-3.5" />
                {isGIFRecording ? "Gerando GIF..." : "Gerar GIF"}
              </Button>
            </div>
          </div>

          {/* Abas de seleção do móvel */}
          <Tabs 
            value={params.activeTab} 
            onValueChange={(value) => setParams({ activeTab: value as FurnitureTab })}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="chair" className="flex items-center gap-1 text-xs">
                <Armchair className="h-4 w-4" />
                Cadeira
              </TabsTrigger>
              <TabsTrigger value="table" className="flex items-center gap-1 text-xs">
                <Table2 className="h-4 w-4" />
                Mesa
              </TabsTrigger>
              <TabsTrigger value="roundTable" className="flex items-center gap-1 text-xs">
                <Circle className="h-4 w-4" />
                Redonda
              </TabsTrigger>
            </TabsList>
            <TabsList className="grid w-full grid-cols-3 mt-1">
              <TabsTrigger value="bancoMehinaku" className="text-xs py-1.5">
                Mehinaku
              </TabsTrigger>
              <TabsTrigger value="bancoMehinakuPerfurado" className="text-xs py-1.5">
                Perfurado
              </TabsTrigger>
              <TabsTrigger value="bancoWauja" className="text-xs py-1.5">
                Wauja
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Separator />

          {/* Controles de Visualização */}
          <div className="space-y-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Eye className="h-4 w-4" />
              Visualização
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-rotate" className="text-sm">Rotacao Automatica</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant={params.autoRotate ? "default" : "outline"}
                    size="sm"
                    onClick={() => setParams({ autoRotate: !params.autoRotate })}
                    className="h-8 px-3"
                  >
                    {params.autoRotate ? (
                      <>
                        <Pause className="h-3 w-3 mr-1" />
                        Pausar
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3 mr-1" />
                        Iniciar
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="show-wireframe" className="text-sm">Wireframe</Label>
                <Switch
                  id="show-wireframe"
                  checked={params.showWireframe}
                  onCheckedChange={(checked) => setParams({ showWireframe: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="show-grid" className="text-sm">Mostrar Grid</Label>
                <Switch
                  id="show-grid"
                  checked={params.showGrid}
                  onCheckedChange={(checked) => setParams({ showGrid: checked })}
                />
              </div>

              {params.autoRotate && (
                <div className="space-y-2">
                  <Label className="text-sm">Velocidade de Rotação</Label>
                  <Slider
                    value={[params.rotationSpeed]}
                    onValueChange={([value]) => setParams({ rotationSpeed: value })}
                    min={0.1}
                    max={2}
                    step={0.1}
                  />
                  <span className="text-xs text-muted-foreground">{params.rotationSpeed.toFixed(1)}x</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Controles de Textura de Áudio */}
          <div className="space-y-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Music className="h-4 w-4" />
              Textura de Áudio (Fourier)
            </h2>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-sm">Modo de Textura</Label>
                <Tabs 
                  value={params.textureMode} 
                  onValueChange={(value) => setParams({ textureMode: value as TextureMode })}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 h-auto">
                    <TabsTrigger value="solid" className="text-xs py-1.5">
                      Sólido
                    </TabsTrigger>
                    <TabsTrigger value="waveform" className="text-xs py-1.5 flex items-center gap-1">
                      <AudioWaveform className="h-3 w-3" />
                      Onda
                    </TabsTrigger>
                    <TabsTrigger value="fft" className="text-xs py-1.5 flex items-center gap-1">
                      <BarChart3 className="h-3 w-3" />
                      FFT
                    </TabsTrigger>
                    <TabsTrigger value="spectrogram" className="text-xs py-1.5 flex items-center gap-1">
                      <Layers className="h-3 w-3" />
                      STFT
                    </TabsTrigger>
                  </TabsList>
                  <TabsList className="grid w-full grid-cols-2 mt-1">
                    <TabsTrigger value="combined" className="text-xs py-1.5">
                      Combinado
                    </TabsTrigger>
                    <TabsTrigger value="ai-image" className="text-xs py-1.5">
                      IA 🤖
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {params.textureMode !== "solid" && (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm">Camadas de Segmentos</Label>
                    <Slider
                      value={[params.segmentLayers]}
                      onValueChange={([value]) => setParams({ segmentLayers: value })}
                      min={10}
                      max={60}
                      step={2}
                    />
                    <span className="text-xs text-muted-foreground">{params.segmentLayers} camadas</span>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Segmentos por Camada</Label>
                    <Slider
                      value={[params.segmentsPerLayer]}
                      onValueChange={([value]) => setParams({ segmentsPerLayer: value })}
                      min={8}
                      max={36}
                      step={2}
                    />
                    <span className="text-xs text-muted-foreground">{params.segmentsPerLayer} segmentos</span>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Tamanho dos Segmentos</Label>
                    <Slider
                      value={[params.segmentSize]}
                      onValueChange={([value]) => setParams({ segmentSize: value })}
                      min={0.03}
                      max={0.15}
                      step={0.01}
                    />
                    <span className="text-xs text-muted-foreground">{(params.segmentSize * 100).toFixed(0)}%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Animacao dos Segmentos</Label>
                    <Button
                      variant={params.animationPaused ? "outline" : "default"}
                      size="sm"
                      onClick={() => setParams({ animationPaused: !params.animationPaused })}
                      className="h-8 px-3"
                    >
                      {params.animationPaused ? (
                        <>
                          <Play className="h-3 w-3 mr-1" />
                          Iniciar
                        </>
                      ) : (
                        <>
                          <Pause className="h-3 w-3 mr-1" />
                          Pausar
                        </>
                      )}
                    </Button>
                  </div>

                  {!params.animationPaused && (
                    <div className="space-y-2">
                      <Label className="text-sm">Velocidade da Animacao</Label>
                      <Slider
                        value={[params.animationSpeed]}
                        onValueChange={([value]) => setParams({ animationSpeed: value })}
                        min={0.1}
                        max={3}
                        step={0.1}
                      />
                      <span className="text-xs text-muted-foreground">{params.animationSpeed.toFixed(1)}x</span>
                    </div>
                  )}

                  {(params.textureMode === "waveform" || params.textureMode === "combined") && (
                    <div className="space-y-2">
                      <Label className="text-sm">Intensidade Forma de Onda</Label>
                      <Slider
                        value={[params.waveIntensity]}
                        onValueChange={([value]) => setParams({ waveIntensity: value })}
                        min={0}
                        max={1}
                        step={0.05}
                      />
                      <span className="text-xs text-muted-foreground">{(params.waveIntensity * 100).toFixed(0)}%</span>
                    </div>
                  )}

                  {(params.textureMode === "fft" || params.textureMode === "combined") && (
                    <div className="space-y-2">
                      <Label className="text-sm">Intensidade FFT</Label>
                      <Slider
                        value={[params.fftIntensity]}
                        onValueChange={([value]) => setParams({ fftIntensity: value })}
                        min={0}
                        max={1}
                        step={0.05}
                      />
                      <span className="text-xs text-muted-foreground">{(params.fftIntensity * 100).toFixed(0)}%</span>
                    </div>
                  )}

                  {(params.textureMode === "spectrogram" || params.textureMode === "combined") && (
                    <div className="space-y-2">
                      <Label className="text-sm">Intensidade Espectrograma</Label>
                      <Slider
                        value={[params.spectrogramIntensity]}
                        onValueChange={([value]) => setParams({ spectrogramIntensity: value })}
                        min={0}
                        max={1}
                        step={0.05}
                      />
                      <span className="text-xs text-muted-foreground">{(params.spectrogramIntensity * 100).toFixed(0)}%</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <Separator />

          {/* Parâmetros da Cadeira */}
          {params.activeTab === "chair" && (
            <div className="space-y-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Armchair className="h-4 w-4" />
                Parâmetros da Cadeira
              </h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Largura do Assento</Label>
                  <Slider
                    value={[params.chairSeatWidth]}
                    onValueChange={([value]) => setParams({ chairSeatWidth: value })}
                    min={0.3}
                    max={0.7}
                    step={0.01}
                  />
                  <span className="text-xs text-muted-foreground">{(params.chairSeatWidth * 100).toFixed(0)} cm</span>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">Profundidade do Assento</Label>
                  <Slider
                    value={[params.chairSeatDepth]}
                    onValueChange={([value]) => setParams({ chairSeatDepth: value })}
                    min={0.3}
                    max={0.6}
                    step={0.01}
                  />
                  <span className="text-xs text-muted-foreground">{(params.chairSeatDepth * 100).toFixed(0)} cm</span>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">Altura das Pernas</Label>
                  <Slider
                    value={[params.chairLegHeight]}
                    onValueChange={([value]) => setParams({ chairLegHeight: value })}
                    min={0.3}
                    max={0.6}
                    step={0.01}
                  />
                  <span className="text-xs text-muted-foreground">{(params.chairLegHeight * 100).toFixed(0)} cm</span>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">Altura do Encosto</Label>
                  <Slider
                    value={[params.chairBackHeight]}
                    onValueChange={([value]) => setParams({ chairBackHeight: value })}
                    min={0.3}
                    max={0.7}
                    step={0.01}
                  />
                  <span className="text-xs text-muted-foreground">{(params.chairBackHeight * 100).toFixed(0)} cm</span>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Cor da Cadeira</Label>
                  <div className="flex gap-2">
                    {["#8B4513", "#654321", "#2F1810", "#D2691E", "#A0522D", "#CD853F"].map((color) => (
                      <button
                        key={color}
                        className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
                          params.chairColor === color ? "border-primary ring-2 ring-primary/50" : "border-transparent"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setParams({ chairColor: color })}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Parâmetros da Mesa */}
          {params.activeTab === "table" && (
            <div className="space-y-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Table2 className="h-4 w-4" />
                Parâmetros da Mesa
              </h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Largura do Tampo</Label>
                  <Slider
                    value={[params.tableTopWidth]}
                    onValueChange={([value]) => setParams({ tableTopWidth: value })}
                    min={0.8}
                    max={2}
                    step={0.05}
                  />
                  <span className="text-xs text-muted-foreground">{(params.tableTopWidth * 100).toFixed(0)} cm</span>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">Profundidade do Tampo</Label>
                  <Slider
                    value={[params.tableTopDepth]}
                    onValueChange={([value]) => setParams({ tableTopDepth: value })}
                    min={0.5}
                    max={1.2}
                    step={0.05}
                  />
                  <span className="text-xs text-muted-foreground">{(params.tableTopDepth * 100).toFixed(0)} cm</span>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">Altura das Pernas</Label>
                  <Slider
                    value={[params.tableLegHeight]}
                    onValueChange={([value]) => setParams({ tableLegHeight: value })}
                    min={0.5}
                    max={1}
                    step={0.01}
                  />
                  <span className="text-xs text-muted-foreground">{(params.tableLegHeight * 100).toFixed(0)} cm</span>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Cor da Mesa</Label>
                  <div className="flex gap-2">
                    {["#654321", "#8B4513", "#3E2723", "#5D4037", "#4E342E", "#A1887F"].map((color) => (
                      <button
                        key={color}
                        className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
                          params.tableColor === color ? "border-primary ring-2 ring-primary/50" : "border-transparent"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setParams({ tableColor: color })}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Parâmetros da Mesa Redonda */}
          {params.activeTab === "roundTable" && (
            <div className="space-y-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Circle className="h-4 w-4" />
                Parâmetros da Mesa Redonda
              </h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Raio do Tampo</Label>
                  <Slider
                    value={[params.roundTableTopRadius]}
                    onValueChange={([value]) => setParams({ roundTableTopRadius: value })}
                    min={0.3}
                    max={0.7}
                    step={0.01}
                  />
                  <span className="text-xs text-muted-foreground">{(params.roundTableTopRadius * 100).toFixed(0)} cm</span>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">Altura da Base</Label>
                  <Slider
                    value={[params.roundTableBaseHeight]}
                    onValueChange={([value]) => setParams({ roundTableBaseHeight: value })}
                    min={0.5}
                    max={0.9}
                    step={0.01}
                  />
                  <span className="text-xs text-muted-foreground">{(params.roundTableBaseHeight * 100).toFixed(0)} cm</span>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">Raio da Base</Label>
                  <Slider
                    value={[params.roundTableBaseBottomRadius]}
                    onValueChange={([value]) => setParams({ 
                      roundTableBaseBottomRadius: value,
                      roundTableBaseTopRadius: value * 0.6
                    })}
                    min={0.15}
                    max={0.4}
                    step={0.01}
                  />
                  <span className="text-xs text-muted-foreground">{(params.roundTableBaseBottomRadius * 100).toFixed(0)} cm</span>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Cor da Mesa</Label>
                  <div className="flex gap-2">
                    {["#C4A77D", "#8B5A2B", "#654321", "#8B4513", "#A0522D", "#D2B48C"].map((color) => (
                      <button
                        key={color}
                        className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
                          params.roundTableColor === color ? "border-primary ring-2 ring-primary/50" : "border-transparent"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setParams({ roundTableColor: color })}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Parâmetros do Banco Mehinaku */}
          {params.activeTab === "bancoMehinaku" && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-foreground">
                Banco Mehinaku
              </h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Largura do Tampo</Label>
                  <Slider
                    value={[params.bancoMehinakuTopWidth]}
                    onValueChange={([value]) => setParams({ bancoMehinakuTopWidth: value })}
                    min={0.35}
                    max={0.8}
                    step={0.01}
                  />
                  <span className="text-xs text-muted-foreground">{(params.bancoMehinakuTopWidth * 100).toFixed(0)} cm</span>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">Altura das Pernas</Label>
                  <Slider
                    value={[params.bancoMehinakuLegHeight]}
                    onValueChange={([value]) => setParams({ bancoMehinakuLegHeight: value })}
                    min={0.1}
                    max={0.35}
                    step={0.01}
                  />
                  <span className="text-xs text-muted-foreground">{(params.bancoMehinakuLegHeight * 100).toFixed(0)} cm</span>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">Curvatura das Pernas</Label>
                  <Slider
                    value={[params.bancoMehinakuLegCurve]}
                    onValueChange={([value]) => setParams({ bancoMehinakuLegCurve: value })}
                    min={0.1}
                    max={0.5}
                    step={0.05}
                  />
                  <span className="text-xs text-muted-foreground">{(params.bancoMehinakuLegCurve * 100).toFixed(0)}%</span>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Cor do Banco</Label>
                  <div className="flex gap-2">
                    {["#5D4037", "#3E2723", "#4E342E", "#6D4C41", "#795548", "#8D6E63"].map((color) => (
                      <button
                        key={color}
                        className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
                          params.bancoMehinakuColor === color ? "border-primary ring-2 ring-primary/50" : "border-transparent"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setParams({ bancoMehinakuColor: color })}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">Raio das Colunas (Parafusos)</Label>
                  <Slider
                    value={[params.bancoMehinakuColumnRadius]}
                    onValueChange={([value]) => setParams({ bancoMehinakuColumnRadius: value })}
                    min={0.006}
                    max={0.025}
                    step={0.001}
                  />
                  <span className="text-xs text-muted-foreground">{(params.bancoMehinakuColumnRadius * 1000).toFixed(1)} mm</span>
                </div>
              </div>
            </div>
          )}

          {/* Parâmetros do Banco Mehinaku Perfurado */}
          {params.activeTab === "bancoMehinakuPerfurado" && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-foreground">
                Banco Mehinaku - Chapa Perfurada
              </h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Largura do Tampo</Label>
                  <Slider
                    value={[params.bancoMehinakuPerfuradoTopWidth]}
                    onValueChange={([value]) => setParams({ bancoMehinakuPerfuradoTopWidth: value })}
                    min={0.35}
                    max={0.8}
                    step={0.01}
                  />
                  <span className="text-xs text-muted-foreground">{(params.bancoMehinakuPerfuradoTopWidth * 100).toFixed(0)} cm</span>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">Altura das Pernas</Label>
                  <Slider
                    value={[params.bancoMehinakuPerfuradoLegHeight]}
                    onValueChange={([value]) => setParams({ bancoMehinakuPerfuradoLegHeight: value })}
                    min={0.1}
                    max={0.35}
                    step={0.01}
                  />
                  <span className="text-xs text-muted-foreground">{(params.bancoMehinakuPerfuradoLegHeight * 100).toFixed(0)} cm</span>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">Tamanho dos Furos</Label>
                  <Slider
                    value={[params.bancoMehinakuPerfuradoHoleSize]}
                    onValueChange={([value]) => setParams({ bancoMehinakuPerfuradoHoleSize: value })}
                    min={0.008}
                    max={0.025}
                    step={0.001}
                  />
                  <span className="text-xs text-muted-foreground">{(params.bancoMehinakuPerfuradoHoleSize * 1000).toFixed(1)} mm</span>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">Espessura da Chapa</Label>
                  <Slider
                    value={[params.bancoMehinakuPerfuradoPlateThickness]}
                    onValueChange={([value]) => setParams({ bancoMehinakuPerfuradoPlateThickness: value })}
                    min={0.001}
                    max={0.008}
                    step={0.0005}
                  />
                  <span className="text-xs text-muted-foreground">{(params.bancoMehinakuPerfuradoPlateThickness * 1000).toFixed(1)} mm</span>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Cor da Chapa (Metal)</Label>
                  <div className="flex gap-2">
                    {["#424242", "#616161", "#757575", "#37474F", "#263238", "#546E7A"].map((color) => (
                      <button
                        key={color}
                        className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
                          params.bancoMehinakuPerfuradoColor === color ? "border-primary ring-2 ring-primary/50" : "border-transparent"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setParams({ bancoMehinakuPerfuradoColor: color })}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Parâmetros do Banco Waujá */}
          {params.activeTab === "bancoWauja" && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-foreground">
                Banco Ponte - Wauja
              </h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Largura</Label>
                  <Slider
                    value={[params.bancoWaujaWidth]}
                    onValueChange={([value]) => setParams({ bancoWaujaWidth: value })}
                    min={0.3}
                    max={0.8}
                    step={0.01}
                  />
                  <span className="text-xs text-muted-foreground">{(params.bancoWaujaWidth * 100).toFixed(0)} cm</span>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">Profundidade</Label>
                  <Slider
                    value={[params.bancoWaujaDepth]}
                    onValueChange={([value]) => setParams({ bancoWaujaDepth: value })}
                    min={0.2}
                    max={0.5}
                    step={0.01}
                  />
                  <span className="text-xs text-muted-foreground">{(params.bancoWaujaDepth * 100).toFixed(0)} cm</span>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">Altura</Label>
                  <Slider
                    value={[params.bancoWaujaHeight]}
                    onValueChange={([value]) => setParams({ bancoWaujaHeight: value })}
                    min={0.15}
                    max={0.4}
                    step={0.01}
                  />
                  <span className="text-xs text-muted-foreground">{(params.bancoWaujaHeight * 100).toFixed(0)} cm</span>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Cor do Banco</Label>
                  <div className="flex gap-2">
                    {["#6B4423", "#8B4513", "#5D4037", "#3E2723", "#795548", "#A1887F"].map((color) => (
                      <button
                        key={color}
                        className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
                          params.bancoWaujaColor === color ? "border-primary ring-2 ring-primary/50" : "border-transparent"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setParams({ bancoWaujaColor: color })}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* IA Generativa de Ondas */}
          <FrequencyUploadSection />

          <Separator />

          {/* Informações */}
          <div className="rounded-lg bg-muted/50 p-4">
            <h3 className="text-sm font-medium text-foreground">Controles</h3>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              <li>Arrastar: Rotacionar câmera</li>
              <li>Scroll: Zoom</li>
              <li>Shift + Arrastar: Mover câmera</li>
            </ul>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}
