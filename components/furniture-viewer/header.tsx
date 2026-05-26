"use client";

import { useState } from "react";
import { useFurniture, FurnitureTab } from "@/lib/furniture-context";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Menu, RotateCcw, Armchair, Table2, Eye, Box, Circle } from "lucide-react";

export function Header() {
  const [open, setOpen] = useState(false);
  const { params, setParams, resetParams } = useFurniture();

  return (
    <header className="fixed left-0 right-0 top-0 z-30 flex h-14 items-center justify-between border-b border-border/50 bg-background/80 px-4 backdrop-blur-xl md:hidden">
      <div className="flex items-center gap-2">
        <Box className="h-5 w-5 text-primary" />
        <span className="font-semibold">3D Móveis</span>
      </div>

      {/* Abas compactas no header mobile */}
      <Tabs 
        value={params.activeTab} 
        onValueChange={(value) => setParams({ activeTab: value as FurnitureTab })}
      >
        <TabsList className="h-8">
          <TabsTrigger value="chair" className="h-7 px-2 text-xs">
            <Armchair className="h-3 w-3" />
          </TabsTrigger>
          <TabsTrigger value="table" className="h-7 px-2 text-xs">
            <Table2 className="h-3 w-3" />
          </TabsTrigger>
          <TabsTrigger value="roundTable" className="h-7 px-2 text-xs">
            <Circle className="h-3 w-3" />
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <SheetTitle className="sr-only">Menu de Configurações</SheetTitle>
          <ScrollArea className="h-full">
            <div className="flex flex-col gap-6 p-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-foreground">Modelagem 3D</h1>
                  <p className="text-sm text-muted-foreground">Móveis Interativos</p>
                </div>
                <Button variant="outline" size="icon" onClick={resetParams}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
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
                    <Label htmlFor="mobile-auto-rotate" className="text-sm">Rotação Automática</Label>
                    <Switch
                      id="mobile-auto-rotate"
                      checked={params.autoRotate}
                      onCheckedChange={(checked) => setParams({ autoRotate: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="mobile-wireframe" className="text-sm">Wireframe</Label>
                    <Switch
                      id="mobile-wireframe"
                      checked={params.showWireframe}
                      onCheckedChange={(checked) => setParams({ showWireframe: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="mobile-grid" className="text-sm">Mostrar Grid</Label>
                    <Switch
                      id="mobile-grid"
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
                      <Label className="text-sm">Raio Superior da Base</Label>
                      <Slider
                        value={[params.roundTableBaseTopRadius]}
                        onValueChange={([value]) => setParams({ roundTableBaseTopRadius: value })}
                        min={0.1}
                        max={0.3}
                        step={0.01}
                      />
                      <span className="text-xs text-muted-foreground">{(params.roundTableBaseTopRadius * 100).toFixed(0)} cm</span>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm">Raio Inferior da Base</Label>
                      <Slider
                        value={[params.roundTableBaseBottomRadius]}
                        onValueChange={([value]) => setParams({ roundTableBaseBottomRadius: value })}
                        min={0.15}
                        max={0.4}
                        step={0.01}
                      />
                      <span className="text-xs text-muted-foreground">{(params.roundTableBaseBottomRadius * 100).toFixed(0)} cm</span>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">Cor da Mesa</Label>
                      <div className="flex gap-2">
                        {["#8B5A2B", "#654321", "#8B4513", "#A0522D", "#CD853F", "#D2691E"].map((color) => (
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
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </header>
  );
}
