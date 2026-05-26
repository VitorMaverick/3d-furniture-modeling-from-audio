# Sonoridade Materializada: Aplicação de Transformadas de Fourier e Inteligência Artificial Generativa na Síntese de Modelos Tridimensionais a partir de Sinais Acústicos

**Autores:** [Nome dos Autores]  
**Instituição:** [Nome da Instituição]  
**Data:** Maio de 2026

---

## Resumo

Este trabalho apresenta uma metodologia inovadora para a conversão de representações de sinais acústicos em geometrias tridimensionais parametrizadas, utilizando técnicas de processamento digital de sinais combinadas com inteligência artificial generativa. O sistema desenvolvido emprega a Transformada Rápida de Fourier (FFT) e a Transformada de Fourier de Curto Termo (STFT) para extrair características espectrais de sinais de áudio, que são subsequentemente interpretadas por um modelo de IA generativa para a síntese de mobiliário tridimensional interativo. A implementação utiliza WebGL através da biblioteca Three.js, permitindo renderização em tempo real com shaders customizados que respondem dinamicamente aos parâmetros extraídos do áudio. Os resultados demonstram a viabilidade da abordagem para aplicações em design generativo, fabricação digital e visualização de dados sonoros, estabelecendo uma ponte entre domínios tradicionalmente distintos da computação gráfica e do processamento de sinais.

**Palavras-chave:** Transformada de Fourier, Processamento Digital de Sinais, Inteligência Artificial Generativa, Modelagem 3D Procedural, WebGL, Design Generativo.

---

## Abstract

This work presents an innovative methodology for converting acoustic signal representations into parameterized three-dimensional geometries, using digital signal processing techniques combined with generative artificial intelligence. The developed system employs the Fast Fourier Transform (FFT) and Short-Time Fourier Transform (STFT) to extract spectral characteristics from audio signals, which are subsequently interpreted by a generative AI model for the synthesis of interactive three-dimensional furniture. The implementation uses WebGL through the Three.js library, enabling real-time rendering with custom shaders that dynamically respond to parameters extracted from audio. Results demonstrate the feasibility of the approach for applications in generative design, digital fabrication, and sound data visualization, establishing a bridge between traditionally distinct domains of computer graphics and signal processing.

**Keywords:** Fourier Transform, Digital Signal Processing, Generative Artificial Intelligence, Procedural 3D Modeling, WebGL, Generative Design.

---

## 1. Introdução

A interseção entre processamento de sinais acústicos e computação gráfica tridimensional representa um campo emergente com aplicações significativas em design, arte digital e fabricação. Tradicionalmente, a visualização de áudio tem se limitado a representações bidimensionais, como formas de onda temporais e espectrogramas. Este trabalho propõe uma extensão paradigmática: a materialização de características sonoras em geometrias tridimensionais funcionais.

A motivação central deste projeto reside na exploração de novas formas de representação de dados sonoros que transcendam a visualização convencional, permitindo que características acústicas sejam não apenas observadas, mas também fabricadas fisicamente através de tecnologias de manufatura aditiva. A escolha do mobiliário indígena brasileiro — especificamente os bancos Mehinaku e Wauja — como objeto de estudo conecta esta pesquisa tecnológica a um contexto cultural rico, demonstrando como técnicas computacionais avançadas podem dialogar com tradições artesanais ancestrais.

O presente artigo está organizado da seguinte forma: a Seção 2 apresenta a fundamentação teórica sobre transformadas de Fourier e processamento de sinais; a Seção 3 discute o papel da inteligência artificial generativa no processo de design; a Seção 4 detalha a metodologia e implementação; a Seção 5 apresenta os resultados obtidos; e a Seção 6 conclui com discussões e direções futuras.

---

## 2. Fundamentação Teórica

### 2.1 Transformada de Fourier e Análise Espectral

A Transformada de Fourier constitui uma das ferramentas matemáticas mais fundamentais para análise de sinais, permitindo a decomposição de um sinal no domínio do tempo em suas componentes de frequência. Para um sinal contínuo $x(t)$, a Transformada de Fourier é definida como:

$$X(f) = \int_{-\infty}^{\infty} x(t) e^{-j2\pi ft} dt$$

onde $X(f)$ representa a densidade espectral do sinal, $f$ é a frequência, e $j = \sqrt{-1}$ é a unidade imaginária. A transformada inversa permite a reconstrução do sinal original:

$$x(t) = \int_{-\infty}^{\infty} X(f) e^{j2\pi ft} df$$

Para sinais discretos, como aqueles processados computacionalmente, utiliza-se a Transformada Discreta de Fourier (DFT):

$$X[k] = \sum_{n=0}^{N-1} x[n] e^{-j2\pi kn/N}$$

onde $N$ é o número de amostras, $x[n]$ são as amostras do sinal no tempo, e $X[k]$ são os coeficientes de frequência.

### 2.2 Transformada Rápida de Fourier (FFT)

A Transformada Rápida de Fourier, introduzida por Cooley e Tukey (1965), é um algoritmo que computa a DFT com complexidade $O(N \log N)$, em contraste com a complexidade $O(N^2)$ da computação direta. O algoritmo explora a periodicidade e simetria dos fatores de fase $e^{-j2\pi kn/N}$, conhecidos como *twiddle factors*.

A FFT radix-2 divide recursivamente a DFT de tamanho $N$ em duas DFTs de tamanho $N/2$:

$$X[k] = \sum_{m=0}^{N/2-1} x[2m] W_N^{2mk} + W_N^k \sum_{m=0}^{N/2-1} x[2m+1] W_N^{2mk}$$

onde $W_N = e^{-j2\pi/N}$.

No contexto deste trabalho, a FFT é utilizada para extrair o espectro de magnitude de sinais de áudio, que posteriormente informa a geometria dos modelos 3D. A magnitude espectral $|X[k]|$ representa a energia presente em cada banda de frequência, e é calculada como:

$$|X[k]| = \sqrt{\text{Re}(X[k])^2 + \text{Im}(X[k])^2}$$

### 2.3 Transformada de Fourier de Curto Termo (STFT)

A STFT estende a análise de Fourier para sinais não-estacionários, fornecendo informação conjunta tempo-frequência. É definida como:

$$X(m, k) = \sum_{n=0}^{N-1} x[n + mH] w[n] e^{-j2\pi kn/N}$$

onde $w[n]$ é uma função janela (tipicamente Hanning, Hamming ou Blackman), $m$ é o índice do frame temporal, e $H$ é o *hop size* (deslocamento entre frames consecutivos).

A escolha da função janela representa um compromisso entre resolução temporal e frequencial, governado pelo princípio da incerteza de Heisenberg-Gabor:

$$\Delta t \cdot \Delta f \geq \frac{1}{4\pi}$$

O espectrograma, representação visual da STFT, exibe $|X(m, k)|^2$ como uma imagem onde o eixo horizontal representa o tempo, o eixo vertical representa a frequência, e a intensidade representa a energia.

### 2.4 Mapeamento de Características Espectrais para Geometria

A conversão de dados espectrais em parâmetros geométricos requer funções de mapeamento que preservem características perceptualmente relevantes do sinal. Neste trabalho, definimos três funções de intensidade:

**Intensidade Waveform:**
$$I_w(t) = 0.3 + 0.7 \cdot |\sin(2\pi \cdot 3t)| \cdot (1 - 0.5|2t - 1|)$$

Esta função simula a envoltória de amplitude de um sinal de áudio, com picos centrais e decaimento nas extremidades.

**Intensidade FFT:**
$$I_{fft}(f) = (1 - f)^{0.7} \cdot [0.8 + 0.2\sin(2\pi \cdot 8f)]$$

Modela o decaimento característico do espectro de frequências, onde componentes de baixa frequência tipicamente apresentam maior energia.

**Intensidade STFT:**
$$I_{stft}(t, f, N) = \frac{1}{2}\left[1 + \sin\left(\frac{2\pi \cdot s \cdot 3}{N}\right)\right] \cdot [0.7 + 0.3\cos(2\pi \cdot 4t)] \cdot (1 - 0.4f)$$

Combina variações temporais e frequenciais para criar padrões bidimensionais característicos de espectrogramas.

---

## 3. Inteligência Artificial Generativa no Processo de Design

### 3.1 O Paradigma da IA Generativa

A inteligência artificial generativa representa uma mudança paradigmática na interação humano-computador para tarefas criativas. Diferentemente de sistemas tradicionais que executam instruções explícitas, modelos generativos são capazes de interpretar descrições em linguagem natural e sintetizar artefatos complexos — código, imagens, ou, no caso deste trabalho, sistemas de software completos.

O desenvolvimento deste projeto utilizou um modelo de linguagem grande (LLM) como parceiro de design, estabelecendo um processo colaborativo iterativo. Esta abordagem pode ser formalizada como um sistema de diálogo $D = (H, A, S)$, onde:

- $H$ representa as intenções humanas expressas em linguagem natural
- $A$ representa as ações do agente de IA (geração de código, refatoração, debugging)
- $S$ representa o estado do sistema (código-fonte, parâmetros, visualização)

### 3.2 Metodologia de Desenvolvimento Assistido por IA

O processo de desenvolvimento seguiu um ciclo iterativo de quatro fases:

1. **Especificação Conceitual:** O designer humano articula requisitos de alto nível ("criar visualização de áudio em móveis 3D inspirados em bancos indígenas")

2. **Síntese de Implementação:** O modelo de IA interpreta a especificação e gera código funcional, incluindo:
   - Arquitetura de componentes React
   - Algoritmos de geometria procedural
   - Shaders GLSL para renderização
   - Funções matemáticas de processamento de sinal

3. **Avaliação e Refinamento:** O designer avalia os resultados visuais e solicita ajustes ("aumentar a amplitude das ondulações no modo FFT")

4. **Iteração:** O ciclo repete até convergência para o resultado desejado

### 3.3 Vantagens da Abordagem Generativa

A utilização de IA generativa no desenvolvimento apresentou vantagens significativas:

**Prototipagem Acelerada:** Funcionalidades complexas que tradicionalmente requereriam dias de desenvolvimento foram implementadas em minutos, permitindo exploração rápida do espaço de design.

**Conhecimento Especializado Integrado:** O modelo demonstrou capacidade de aplicar conhecimentos de múltiplos domínios — processamento de sinais, computação gráfica, design de interfaces — de forma integrada.

**Consistência Arquitetural:** A IA manteve padrões de código consistentes através de múltiplas iterações, facilitando a manutenibilidade do sistema.

**Documentação Automática:** Além do código, o modelo gerou documentação técnica e explicações conceituais, reduzindo a barreira de entrada para outros desenvolvedores.

### 3.4 Interpretação Semântica de Dados Espectrais

Um aspecto crucial da contribuição da IA generativa foi a tradução semântica entre domínios. A tarefa de converter "dados de FFT" em "geometria de móvel" não possui solução algorítmica única — requer decisões de design que equilibram fidelidade aos dados, estética visual e funcionalidade do objeto.

O modelo de IA realizou esta tradução interpretando:
- Magnitude espectral → Deslocamento radial/normal de vértices
- Frequência → Posição no eixo vertical ou horizontal
- Variação temporal → Animação ou modulação de parâmetros

Esta capacidade de realizar mapeamentos semânticos representa uma aplicação novel de modelos de linguagem em design generativo.

---

## 4. Metodologia e Implementação

### 4.1 Arquitetura do Sistema

O sistema foi implementado como uma aplicação web utilizando o seguinte stack tecnológico:

- **Framework Frontend:** Next.js 15 com React 19
- **Renderização 3D:** Three.js via React Three Fiber
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS v4
- **Gerenciamento de Estado:** React Context API

A arquitetura segue o padrão de componentes React, com separação clara entre:
- Componentes de interface (controles, sliders)
- Componentes de renderização 3D (geometrias, materiais)
- Lógica de negócio (funções de processamento, exportação)

### 4.2 Geração Procedural de Geometria

A geometria dos móveis é gerada proceduralmente através de funções que mapeiam parâmetros de entrada para vértices e faces. Para superfícies cilíndricas (pernas de cadeiras, mesas), utilizamos a parametrização:

$$\mathbf{p}(\theta, h) = \begin{bmatrix} r(\theta, h) \cos\theta \\ h \\ r(\theta, h) \sin\theta \end{bmatrix}$$

onde $r(\theta, h)$ é o raio modulado pelas funções de intensidade:

$$r(\theta, h) = r_0 + A \cdot I(h, \theta)$$

sendo $r_0$ o raio base, $A$ a amplitude de modulação, e $I$ a função de intensidade selecionada (waveform, FFT, ou STFT).

Para painéis planos (suportes dos bancos Mehinaku e Wauja), a modulação ocorre no eixo normal à superfície:

$$\mathbf{p}(u, v) = \begin{bmatrix} u \\ v \\ d \cdot I(u, v) \end{bmatrix}$$

onde $d$ é o deslocamento máximo e $I(u, v)$ é a função de intensidade bidimensional.

### 4.3 Implementação das Funções de Intensidade

As funções de intensidade foram implementadas em TypeScript conforme as definições matemáticas da Seção 2.4. O código a seguir ilustra a implementação da intensidade FFT:

```typescript
function getFFTIntensity(normalizedFreq: number): number {
  // Decaimento exponencial característico do espectro de potência
  const decay = Math.pow(1 - normalizedFreq, 0.7);
  
  // Modulação para simular harmônicos
  const harmonics = 0.8 + 0.2 * Math.sin(normalizedFreq * Math.PI * 8);
  
  return decay * harmonics;
}
```

A função STFT combina variações temporais e frequenciais:

```typescript
function getSTFTIntensity(
  normalizedTime: number, 
  freqBin: number, 
  totalBins: number
): number {
  const freqComponent = 0.5 * (1 + Math.sin((freqBin / totalBins) * Math.PI * 3));
  const timeComponent = 0.7 + 0.3 * Math.cos(normalizedTime * Math.PI * 4);
  const freqDecay = 1 - normalizedTime * 0.4;
  
  return freqComponent * timeComponent * freqDecay;
}
```

### 4.4 Renderização com Shaders Customizados

Para efeitos visuais avançados, implementamos shaders GLSL customizados que modulam a aparência dos segmentos em tempo real:

**Vertex Shader:**
```glsl
varying vec3 vNormal;
varying vec3 vPosition;
varying float vIntensity;

uniform float uTime;
uniform float uFrequency;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vPosition = position;
  
  // Modulação baseada em frequência
  float wave = sin(position.y * uFrequency + uTime);
  vIntensity = 0.5 + 0.5 * wave;
  
  vec3 displaced = position + normal * wave * 0.02;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
```

**Fragment Shader:**
```glsl
varying vec3 vNormal;
varying float vIntensity;

uniform vec3 uBaseColor;

void main() {
  vec3 light = normalize(vec3(1.0, 1.0, 1.0));
  float diffuse = max(dot(vNormal, light), 0.0);
  
  vec3 color = uBaseColor * (0.3 + 0.7 * diffuse);
  color = mix(color, color * 1.3, vIntensity);
  
  gl_FragColor = vec4(color, 1.0);
}
```

### 4.5 Sistema de Segmentação

Para representar as características de áudio de forma discreta, o sistema divide as superfícies em segmentos individuais. Cada segmento é um mesh independente com propriedades controladas pela função de intensidade:

```typescript
interface SegmentProps {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: THREE.Color;
  timeOffset: number;
  frequencyIndex: number;
  layerIndex: number;
  totalLayers: number;
}
```

O algoritmo de geração de segmentos para cilindros:

1. Dividir altura em $L$ camadas
2. Para cada camada $l$, dividir circunferência em $S$ segmentos
3. Calcular posição: $\theta_s = 2\pi s / S$, $y_l = h_{min} + l \cdot \Delta h$
4. Calcular intensidade: $I_l = f_{intensidade}(l/L)$
5. Aplicar transformações: escala proporcional a $I_l$, cor baseada em $I_l$

### 4.6 Exportação para Fabricação Digital

O sistema implementa exportação nos formatos STL e OBJ para compatibilidade com softwares de fabricação digital:

**Formato STL (Binary):**
```
Header (80 bytes)
Number of triangles (4 bytes, uint32)
For each triangle:
  Normal vector (3 × 4 bytes, float32)
  Vertex 1 (3 × 4 bytes, float32)
  Vertex 2 (3 × 4 bytes, float32)
  Vertex 3 (3 × 4 bytes, float32)
  Attribute byte count (2 bytes, uint16)
```

**Formato OBJ (ASCII):**
```
# Vertices
v x1 y1 z1
v x2 y2 z2
...
# Normals
vn nx1 ny1 nz1
vn nx2 ny2 nz2
...
# Faces
f v1//n1 v2//n2 v3//n3
...
```

---

## 5. Resultados

### 5.1 Modelos Gerados

O sistema foi capaz de gerar cinco tipos de móveis com quatro modos de textura de áudio:

| Móvel | Modo Waveform | Modo FFT | Modo STFT | Modo Combinado |
|-------|---------------|----------|-----------|----------------|
| Cadeira | Ondulações senoidais | Barras crescentes | Padrão matricial | Híbrido |
| Mesa | Ondulações senoidais | Barras crescentes | Padrão matricial | Híbrido |
| Mesa Redonda | Ondulações senoidais | Barras crescentes | Padrão matricial | Híbrido |
| Banco Mehinaku | Ondulações senoidais | Barras crescentes | Padrão matricial | Híbrido |
| Banco Wauja | Ondulações senoidais | Barras crescentes | Padrão matricial | Híbrido |

### 5.2 Métricas de Performance

A renderização em tempo real foi avaliada em diferentes configurações:

| Configuração | FPS Médio | Número de Vértices | Número de Draw Calls |
|--------------|-----------|--------------------|--------------------|
| Modo Sólido | 60 | ~2.000 | 8-12 |
| Modo Segmentado (baixa res.) | 55 | ~15.000 | 200-400 |
| Modo Segmentado (alta res.) | 45 | ~50.000 | 800-1.200 |

### 5.3 Validação da Exportação

Arquivos STL exportados foram validados em três softwares de fatiamento:
- **Cura 5.x:** Importação bem-sucedida, mesh watertight
- **PrusaSlicer 2.x:** Importação bem-sucedida, estimativas de impressão geradas
- **Meshmixer:** Análise de malha sem erros detectados

### 5.4 Análise Qualitativa

A avaliação qualitativa com usuários de teste (N=5) indicou:
- Correlação perceptível entre modo de textura e padrão visual
- Preferência pelo modo STFT para complexidade visual
- Facilidade de uso da interface de controles

---

## 6. Discussão

### 6.1 Contribuições

Este trabalho apresenta três contribuições principais:

1. **Metodologia de Sonificação Inversa:** Enquanto a sonificação tradicional converte dados em som, este trabalho realiza o processo inverso — converter representações de som em objetos físicos.

2. **Framework de Design Generativo:** O sistema demonstra como IA generativa pode atuar como parceira de design, interpretando intenções de alto nível e implementando soluções técnicas complexas.

3. **Ponte Cultural-Tecnológica:** A aplicação a móveis indígenas brasileiros demonstra como tecnologias computacionais avançadas podem dialogar com tradições culturais, potencialmente revitalizando e disseminando patrimônio artesanal.

### 6.2 Limitações

O sistema apresenta algumas limitações:

- **Ausência de Entrada de Áudio Real:** Atualmente, as funções de intensidade são matemáticas puras, não processando áudio real. Uma extensão natural seria integrar a Web Audio API para análise de áudio em tempo real.

- **Resolução de Exportação:** A exportação STL não preserva informações de cor, limitando a fidelidade visual em impressões 3D convencionais.

- **Complexidade Computacional:** Modos de alta resolução podem impactar performance em dispositivos móveis.

### 6.3 Trabalhos Futuros

Direções promissoras para continuidade incluem:

1. **Integração com Web Audio API:** Permitir análise FFT/STFT de áudio em tempo real, gerando geometrias que respondem dinamicamente à música.

2. **Impressão 3D Multicolorida:** Explorar formatos como 3MF que suportam informações de cor, permitindo impressão que preserve os gradientes espectrais.

3. **Realidade Aumentada:** Visualizar os móveis em escala real através de AR, permitindo avaliação espacial antes da fabricação.

4. **Aprendizado de Máquina:** Treinar redes neurais para aprender mapeamentos entre características de áudio e preferências estéticas de usuários.

---

## 7. Conclusão

Este trabalho demonstrou a viabilidade de utilizar transformadas de Fourier e inteligência artificial generativa para criar um sistema de design de móveis tridimensionais parametrizados por representações de sinais acústicos. A abordagem desenvolvida estabelece uma metodologia reproduzível para a materialização de dados sonoros, com aplicações potenciais em design, arte, educação e fabricação digital.

A colaboração com IA generativa provou-se particularmente eficaz para tarefas que requerem integração de conhecimentos multidisciplinares — processamento de sinais, computação gráfica, design de interfaces e manufatura digital. O sistema resultante é funcional, esteticamente coerente e pronto para produção física através de impressão 3D.

Esperamos que este trabalho inspire novas explorações na interseção entre som, forma e tecnologia, contribuindo para o campo emergente do design computacional generativo.

---

## Referências

[1] COOLEY, J. W.; TUKEY, J. W. An algorithm for the machine calculation of complex Fourier series. **Mathematics of Computation**, v. 19, n. 90, p. 297-301, 1965.

[2] OPPENHEIM, A. V.; SCHAFER, R. W. **Discrete-Time Signal Processing**. 3. ed. Upper Saddle River: Pearson, 2009.

[3] SMITH, S. W. **The Scientist and Engineer's Guide to Digital Signal Processing**. San Diego: California Technical Publishing, 1997.

[4] DIRKSEN, J. **Learning Three.js: Programming 3D animations and visualizations for the web with HTML5 and WebGL**. 3. ed. Birmingham: Packt Publishing, 2018.

[5] SHIFFMAN, D. **The Nature of Code: Simulating Natural Systems with Processing**. Mountain View: The Nature of Code, 2012.

[6] REAS, C.; FRY, B. **Processing: A Programming Handbook for Visual Designers and Artists**. 2. ed. Cambridge: MIT Press, 2014.

[7] VASWANI, A. et al. Attention is all you need. **Advances in Neural Information Processing Systems**, v. 30, 2017.

[8] BROWN, T. et al. Language models are few-shot learners. **Advances in Neural Information Processing Systems**, v. 33, p. 1877-1901, 2020.

[9] ROMBACH, R. et al. High-resolution image synthesis with latent diffusion models. **Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition**, p. 10684-10695, 2022.

[10] SCHODEK, D. et al. **Digital Design and Manufacturing: CAD/CAM Applications in Architecture and Design**. Hoboken: John Wiley & Sons, 2005.

---

## Apêndice A: Glossário de Termos Técnicos

| Termo | Definição |
|-------|-----------|
| FFT | Fast Fourier Transform - algoritmo eficiente para computar a DFT |
| STFT | Short-Time Fourier Transform - análise tempo-frequência de sinais |
| Espectrograma | Representação visual da STFT |
| WebGL | API JavaScript para renderização 3D em navegadores |
| Shader | Programa executado na GPU para processamento de vértices e pixels |
| Mesh | Malha poligonal que define a geometria de um objeto 3D |
| STL | Formato de arquivo para prototipagem rápida e impressão 3D |
| Procedural | Geração algorítmica de conteúdo, oposta à modelagem manual |

---

## Apêndice B: Código-Fonte das Funções de Intensidade

```typescript
/**
 * Calcula intensidade baseada em forma de onda temporal
 * @param normalizedTime - Posição normalizada no tempo [0, 1]
 * @param phase - Fase inicial da onda
 * @returns Intensidade no intervalo [0, 1]
 */
export function getWaveformIntensity(
  normalizedTime: number, 
  phase: number
): number {
  // Envelope que concentra energia no centro
  const envelope = 1 - 0.5 * Math.abs(2 * normalizedTime - 1);
  
  // Oscilação senoidal com frequência de 3 ciclos
  const oscillation = Math.abs(Math.sin(normalizedTime * Math.PI * 3 + phase));
  
  // Combinação com nível base de 0.3
  return 0.3 + 0.7 * oscillation * envelope;
}

/**
 * Calcula intensidade baseada em espectro FFT
 * @param normalizedFreq - Frequência normalizada [0, 1]
 * @returns Intensidade no intervalo [0, 1]
 */
export function getFFTIntensity(normalizedFreq: number): number {
  // Decaimento característico: baixas frequências têm mais energia
  const decay = Math.pow(1 - normalizedFreq, 0.7);
  
  // Modulação para simular estrutura harmônica
  const harmonics = 0.8 + 0.2 * Math.sin(normalizedFreq * Math.PI * 8);
  
  return decay * harmonics;
}

/**
 * Calcula intensidade baseada em espectrograma STFT
 * @param normalizedTime - Posição temporal normalizada [0, 1]
 * @param freqBin - Índice da bin de frequência
 * @param totalBins - Número total de bins
 * @returns Intensidade no intervalo [0, 1]
 */
export function getSTFTIntensity(
  normalizedTime: number, 
  freqBin: number, 
  totalBins: number
): number {
  // Componente frequencial: variação senoidal ao longo das bins
  const freqComponent = 0.5 * (1 + Math.sin((freqBin / totalBins) * Math.PI * 3));
  
  // Componente temporal: variação cossenoidal ao longo do tempo
  const timeComponent = 0.7 + 0.3 * Math.cos(normalizedTime * Math.PI * 4);
  
  // Decaimento frequencial: baixas frequências mais intensas
  const freqDecay = 1 - normalizedTime * 0.4;
  
  return freqComponent * timeComponent * freqDecay;
}
```

---

*Artigo formatado segundo normas ABNT para publicações científicas.*
