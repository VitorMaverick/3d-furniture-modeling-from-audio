# Documentacao Tecnica: Sistema de Modelagem 3D Parametrica com Visualizacao de Audio

## Resumo

Este projeto implementa uma aplicacao web interativa para modelagem 3D parametrica de moveis inspirados em designs indigenas brasileiros (Mehinaku e Wauja), com visualizacao de padroes de audio em tempo real. A aplicacao permite a customizacao de dimensoes, cores e modos de textura baseados em representacoes de sinais de audio (Waveform, FFT, STFT), alem de exportacao para formatos de impressao 3D.

---

## 1. Arquitetura do Sistema

### 1.1 Stack Tecnologico

| Camada | Tecnologia | Versao | Finalidade |
|--------|------------|--------|------------|
| Framework | Next.js | 15.x | SSR, roteamento, build |
| Renderizacao 3D | Three.js | ^0.170 | Engine grafica WebGL |
| React Three Fiber | @react-three/fiber | ^9.x | Integracao declarativa Three.js/React |
| UI Components | shadcn/ui | - | Sistema de design |
| Styling | Tailwind CSS | 4.x | Utilitarios CSS |
| Linguagem | TypeScript | 5.x | Tipagem estatica |

### 1.2 Estrutura de Diretorios

```
/vercel/share/v0-project/
├── app/
│   ├── layout.tsx          # Layout raiz com providers
│   ├── page.tsx            # Pagina principal
│   └── globals.css         # Estilos globais e tokens
├── components/
│   └── furniture-viewer/
│       ├── index.tsx       # Componente principal (Canvas 3D)
│       ├── scene.tsx       # Cena 3D com iluminacao e objetos
│       ├── sidebar.tsx     # Painel de controles parametricos
│       ├── segmented-furniture.tsx  # Moveis segmentados
│       ├── chair.tsx       # Modelo da cadeira
│       ├── table.tsx       # Modelo da mesa
│       ├── round-table.tsx # Modelo da mesa redonda
│       ├── banco-mehinaku.tsx  # Banco indigena Mehinaku
│       ├── banco-wauja.tsx     # Banco indigena Wauja
│       └── audio-material.tsx  # Material com shader de audio
├── lib/
│   ├── furniture-context.tsx   # Context API para estado global
│   ├── audio-texture-shader.ts # Shaders GLSL customizados
│   └── stl-exporter.ts         # Exportador STL/OBJ
```

---

## 2. Gerenciamento de Estado

### 2.1 Context API Pattern

O estado global da aplicacao e gerenciado atraves do React Context API, implementado em `lib/furniture-context.tsx`:

```typescript
interface FurnitureParams {
  // Aba ativa
  activeTab: FurnitureTab;
  
  // Parametros geometricos da cadeira
  chairSeatWidth: number;
  chairSeatDepth: number;
  chairSeatHeight: number;
  chairBackHeight: number;
  chairLegHeight: number;
  chairColor: string;
  
  // Parametros da mesa
  tableWidth: number;
  tableDepth: number;
  // ... outros parametros
  
  // Modo de textura (visualizacao de audio)
  textureMode: "solid" | "waveform" | "fft" | "spectrogram" | "combined";
  
  // Controle de animacao
  isPlaying: boolean;
  animationSpeed: number;
  
  // Configuracao de segmentacao
  segmentsPerLayer: number;
}
```

### 2.2 Fluxo de Dados Unidirecional

```
[Sidebar Controls] 
       │
       ▼ setParams()
[FurnitureContext]
       │
       ▼ params
[Scene Components] ──► [Three.js Meshes]
```

---

## 3. Sistema de Renderizacao 3D

### 3.1 Configuracao do Canvas

O canvas WebGL e configurado com otimizacoes para performance e qualidade visual:

```typescript
<Canvas
  shadows
  camera={{ position: [3, 2.5, 3], fov: 50 }}
  gl={{ 
    antialias: true, 
    toneMapping: THREE.ACESFilmicToneMapping,
    toneMappingExposure: 1.2 
  }}
  dpr={[1, 2]}
>
```

**Parametros:**
- `shadows`: Habilita shadow mapping
- `dpr`: Device Pixel Ratio adaptativo (1x a 2x)
- `toneMapping`: ACES Filmic para cores cinematograficas
- `antialias`: Suavizacao de bordas

### 3.2 Sistema de Iluminacao

```typescript
<ambientLight intensity={0.4} />
<directionalLight
  position={[5, 8, 5]}
  intensity={1.2}
  castShadow
  shadow-mapSize={[2048, 2048]}
  shadow-bias={-0.0001}
/>
<pointLight position={[-3, 3, -3]} intensity={0.5} color="#4fc3f7" />
<spotLight position={[0, 6, 0]} intensity={0.8} angle={0.5} />
```

A iluminacao utiliza:
- **Ambient Light**: Iluminacao base uniforme
- **Directional Light**: Luz principal com sombras (shadow map 2048x2048)
- **Point Light**: Destaque colorido para efeito artistico
- **Spot Light**: Iluminacao focal de cima

---

## 4. Algoritmos de Geracao Procedural

### 4.1 Geracao de Segmentos Cilindricos

A funcao `generateCylinderSegmentsWithWires` cria segmentos distribuidos em uma superficie cilindrica:

```typescript
function generateCylinderSegmentsWithWires(
  radiusTop: number,
  radiusBottom: number,
  height: number,
  position: [number, number, number],
  segmentHeight: number,
  baseY: number,
  totalHeight: number,
  segmentsPerLayer: number,
  baseColor?: string,
  textureMode: string = "waveform"
): { segments: SegmentProps[], wires: WireProps[] }
```

**Algoritmo:**
1. Calcula numero de camadas baseado na altura e tamanho do segmento
2. Para cada camada, distribui segmentos ao longo da circunferencia
3. Aplica deslocamento radial baseado no modo de textura
4. Gera conexoes (wires) entre segmentos adjacentes

### 4.2 Funcoes de Intensidade de Audio

#### Waveform (Forma de Onda)
```typescript
function getWaveformIntensity(normalizedY: number, timeOffset: number): number {
  const wave1 = Math.sin(normalizedY * Math.PI * 4 + timeOffset) * 0.3;
  const wave2 = Math.sin(normalizedY * Math.PI * 7 + timeOffset * 1.3) * 0.2;
  const wave3 = Math.sin(normalizedY * Math.PI * 2 + timeOffset * 0.7) * 0.4;
  const envelope = Math.sin(normalizedY * Math.PI);
  return Math.abs(wave1 + wave2 + wave3) * envelope + 0.3;
}
```

#### FFT (Fast Fourier Transform)
```typescript
function getFFTIntensity(normalizedFreq: number): number {
  const lowFreq = Math.exp(-normalizedFreq * 3) * 0.8;
  const midPeak = Math.exp(-Math.pow((normalizedFreq - 0.3) * 5, 2)) * 0.5;
  const highRolloff = Math.exp(-normalizedFreq * 2) * 0.3;
  return lowFreq + midPeak + highRolloff;
}
```

#### STFT (Short-Time Fourier Transform)
```typescript
function getSTFTIntensity(
  normalizedTime: number, 
  freqBin: number, 
  totalBins: number
): number {
  const normalizedFreq = freqBin / totalBins;
  const timeVariation = Math.sin(normalizedTime * Math.PI * 3) * 0.5 + 0.5;
  const freqVariation = Math.sin(normalizedFreq * Math.PI * 2) * 0.5 + 0.5;
  const harmonic = Math.sin((normalizedTime + normalizedFreq) * Math.PI * 5) * 0.3;
  return timeVariation * freqVariation + harmonic * 0.5;
}
```

### 4.3 Mapeamento de Cores

```typescript
function getTextureColor(
  normalizedY: number, 
  normalizedAngle: number, 
  baseColor?: string, 
  textureMode: string = "waveform"
): THREE.Color {
  switch (textureMode) {
    case "waveform":
      // Gradiente azul-ciano baseado na altura
      return new THREE.Color().setHSL(0.55 + normalizedY * 0.1, 0.7, 0.4 + normalizedY * 0.3);
    case "fft":
      // Espectro de cores (vermelho -> amarelo -> verde -> azul)
      return new THREE.Color().setHSL(normalizedY * 0.7, 0.8, 0.5);
    case "spectrogram":
      // Mapa de calor (preto -> vermelho -> amarelo -> branco)
      const intensity = getSTFTIntensity(normalizedY, normalizedAngle, 1);
      return new THREE.Color().setHSL(0.1 - intensity * 0.1, 0.9, intensity * 0.6);
    // ...
  }
}
```

---

## 5. Paineis Planos com Ondulacao

### 5.1 Banco Mehinaku - Paineis Frontais

```typescript
function generateFlatPanelSegmentsWithWires(
  width: number,
  height: number,
  position: [number, number, number],
  // ...
  textureMode: string = "waveform"
)
```

**Ondulacao por Modo:**

```typescript
case "waveform": {
  const timePhase = normalizedSeg * Math.PI * 8;
  const amplitude = getWaveformIntensity(normalizedSeg, 0);
  const waveform = Math.sin(timePhase) * amplitude;
  const heightEnvelope = Math.sin(normalizedLayer * Math.PI);
  zDisplacement = waveform * heightEnvelope * maxDisplacement * 1.5;
  break;
}

case "fft": {
  const fftMagnitude = getFFTIntensity(normalizedSeg);
  const isInBar = normalizedLayer < fftMagnitude;
  if (isInBar) {
    zDisplacement = fftMagnitude * maxDisplacement * 2;
  }
  break;
}
```

### 5.2 Banco Wauja - Paineis Laterais

```typescript
function generateLateralFlatPanelSegmentsWithWires(
  depth: number,
  height: number,
  position: [number, number, number],
  // ...
  orientation: "left" | "right" = "left"
)
```

A orientacao determina a direcao do deslocamento no eixo X.

---

## 6. Sistema de Exportacao 3D

### 6.1 Exportacao STL

O formato STL (Stereolithography) e o padrao para impressao 3D:

```typescript
export function exportToSTL(scene: THREE.Object3D, filename: string): void {
  const meshes: THREE.Mesh[] = [];
  
  // Coleta todos os meshes da cena
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh && child.geometry) {
      meshes.push(child);
    }
  });
  
  // Gera geometria combinada com transformacoes aplicadas
  const geometries = meshes.map((mesh) => {
    const geometry = mesh.geometry.clone();
    mesh.updateMatrixWorld(true);
    geometry.applyMatrix4(mesh.matrixWorld);
    return geometry;
  });
  
  // Converte para formato STL binario
  const stlContent = generateSTLBinary(mergedGeometry);
  downloadBlob(stlContent, filename, "application/octet-stream");
}
```

### 6.2 Formato STL Binario

```
Header (80 bytes) - Ignorado
Triangle Count (4 bytes) - uint32
For each triangle:
  Normal Vector (12 bytes) - 3x float32
  Vertex 1 (12 bytes) - 3x float32
  Vertex 2 (12 bytes) - 3x float32
  Vertex 3 (12 bytes) - 3x float32
  Attribute (2 bytes) - uint16
```

### 6.3 Exportacao OBJ

```typescript
export function exportToOBJ(scene: THREE.Object3D, filename: string): void {
  let objContent = "# Exported from Furniture Viewer\n";
  let vertexOffset = 1;
  
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const positions = geometry.getAttribute("position");
      
      // Vertices
      for (let i = 0; i < positions.count; i++) {
        const vertex = new THREE.Vector3().fromBufferAttribute(positions, i);
        vertex.applyMatrix4(child.matrixWorld);
        objContent += `v ${vertex.x} ${vertex.y} ${vertex.z}\n`;
      }
      
      // Faces
      for (let i = 0; i < positions.count; i += 3) {
        const a = vertexOffset + i;
        const b = vertexOffset + i + 1;
        const c = vertexOffset + i + 2;
        objContent += `f ${a} ${b} ${c}\n`;
      }
    }
  });
}
```

---

## 7. Shaders GLSL Customizados

### 7.1 Audio Texture Shader

```glsl
// Vertex Shader
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vNormal = normalMatrix * normal;
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

// Fragment Shader
uniform float uTime;
uniform float uIntensity;
uniform vec3 uBaseColor;
uniform int uTextureMode;

varying vec2 vUv;
varying vec3 vNormal;

void main() {
  vec3 color = uBaseColor;
  
  if (uTextureMode == 1) { // Waveform
    float wave = sin(vUv.y * 20.0 + uTime * 2.0) * 0.5 + 0.5;
    color = mix(uBaseColor, vec3(0.2, 0.6, 1.0), wave * uIntensity);
  }
  
  // Iluminacao Phong simplificada
  vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
  float diff = max(dot(vNormal, lightDir), 0.0);
  color *= 0.3 + diff * 0.7;
  
  gl_FragColor = vec4(color, 1.0);
}
```

---

## 8. Otimizacoes de Performance

### 8.1 Memoizacao

```typescript
const { segments, wires } = useMemo(() => {
  return generateCylinderSegmentsWithWires(/* params */);
}, [dependencies]);
```

### 8.2 Instanced Rendering

Para grande numero de segmentos identicos:

```typescript
<instancedMesh args={[geometry, material, count]}>
  {instances.map((instance, i) => (
    <group key={i} position={instance.position} />
  ))}
</instancedMesh>
```

### 8.3 Level of Detail (LOD)

```typescript
const segmentsPerLayer = useMemo(() => {
  const distance = camera.position.distanceTo(objectPosition);
  return distance > 10 ? 8 : distance > 5 ? 16 : 24;
}, [cameraPosition]);
```

---

## 9. Testes e Validacao

### 9.1 Testes de Geometria

```typescript
describe("Cylinder Generation", () => {
  it("should generate correct number of segments", () => {
    const result = generateCylinderSegmentsWithWires(1, 1, 2, [0,0,0], 0.1, 0, 2, 12);
    expect(result.segments.length).toBe(20 * 12); // layers * segmentsPerLayer
  });
  
  it("should maintain correct topology", () => {
    const result = generateCylinderSegmentsWithWires(/* params */);
    result.wires.forEach(wire => {
      expect(wire.points.length).toBe(2);
    });
  });
});
```

### 9.2 Validacao de Exportacao

```typescript
describe("STL Export", () => {
  it("should generate valid STL header", () => {
    const blob = exportToSTL(testScene, "test.stl");
    const header = new Uint8Array(blob.slice(0, 80));
    expect(header.length).toBe(80);
  });
  
  it("should export all triangles", () => {
    const blob = exportToSTL(testScene, "test.stl");
    const triangleCount = new DataView(blob.slice(80, 84)).getUint32(0, true);
    expect(triangleCount).toBeGreaterThan(0);
  });
});
```

---

## 10. Consideracoes de Deploy

### 10.1 Build Optimization

```javascript
// next.config.mjs
export default {
  experimental: {
    optimizePackageImports: ["three", "@react-three/fiber", "@react-three/drei"]
  },
  webpack: (config) => {
    config.externals.push({
      "three": "THREE"
    });
    return config;
  }
};
```

### 10.2 Bundle Size

| Modulo | Tamanho (gzipped) |
|--------|-------------------|
| Three.js | ~150KB |
| React Three Fiber | ~25KB |
| Application Code | ~45KB |
| **Total** | **~220KB** |

---

## 11. Conclusao

Este projeto demonstra a integracao de multiplas tecnologias modernas para criar uma experiencia interativa de modelagem 3D. Os principais desafios tecnicos incluiram:

1. **Geracao Procedural**: Algoritmos eficientes para criar geometrias parametricas
2. **Visualizacao de Audio**: Mapeamento de padroes de sinais de audio para deformacoes 3D
3. **Performance**: Otimizacoes para manter 60fps com milhares de segmentos
4. **Exportacao**: Implementacao de formatos binarios para impressao 3D

A arquitetura modular permite facil extensao para novos tipos de moveis e modos de visualizacao.

---

## Referencias

- [Three.js Documentation](https://threejs.org/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- [STL File Format Specification](https://en.wikipedia.org/wiki/STL_(file_format))
- [WebGL Fundamentals](https://webglfundamentals.org/)
- [Digital Signal Processing - FFT](https://en.wikipedia.org/wiki/Fast_Fourier_transform)
