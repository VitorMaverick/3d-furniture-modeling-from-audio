# Modelagem 3D Paramétrica com Visualização de Sinais de Áudio: Um Estudo de Caso com Design de Móveis Indígenas Brasileiros e Deploy em Nuvem com Auxílio de Inteligência Artificial

**Vitor Maverick**  
Estudante de Engenharia de Software — Instituto Federal do Maranhão (IFMA)  
vitor.maverick@acad.ifma.edu.br

**Data de submissão:** 26 de maio de 2026

---

## Resumo

Este artigo descreve o desenvolvimento, a arquitetura técnica e o deploy em nuvem de uma aplicação web interativa para modelagem tridimensional (3D) de móveis inspirados no design indígena brasileiro, com visualização em tempo real de padrões de sinais de áudio. O sistema permite que usuários manipulem parâmetros geométricos de cinco tipos de móveis — cadeira, mesa retangular, mesa redonda, Banco Mehinaku e Banco Wauja — e apliquem texturas procedurais derivadas de representações matemáticas de sinais de áudio (forma de onda, FFT e espectrograma). O projeto foi desenvolvido com Next.js 16, React 19, Three.js 0.184 e TypeScript 5.7, e publicado na plataforma Vercel com auxílio de ferramentas de Inteligência Artificial (IA). Este artigo documenta não apenas a solução técnica, mas também o processo de desenvolvimento assistido por IA, as decisões arquiteturais tomadas e uma análise detalhada dos custos e benefícios do modelo de hospedagem gratuita em nuvem utilizado.

**Palavras-chave:** Modelagem 3D. Visualização de áudio. Three.js. Next.js. Deploy em nuvem. Inteligência Artificial no desenvolvimento de software. Design indígena brasileiro.

---

## Abstract

This paper describes the development, technical architecture, and cloud deployment of an interactive web application for three-dimensional (3D) modeling of furniture inspired by Brazilian indigenous design, with real-time visualization of audio signal patterns. The system allows users to manipulate geometric parameters of five furniture types — chair, rectangular table, round table, Banco Mehinaku, and Banco Wauja — and apply procedural textures derived from mathematical representations of audio signals (waveform, FFT, and spectrogram). The project was developed with Next.js 16, React 19, Three.js 0.184, and TypeScript 5.7, and published on the Vercel platform with the assistance of Artificial Intelligence (AI) tools. This paper documents not only the technical solution, but also the AI-assisted development process, architectural decisions made, and a detailed analysis of the costs and benefits of the free cloud hosting model used.

**Keywords:** 3D modeling. Audio visualization. Three.js. Next.js. Cloud deployment. Artificial Intelligence in software development. Brazilian indigenous design.

---

## 1. Introdução

A intersecção entre tecnologia digital e patrimônio cultural é um campo crescente de pesquisa e desenvolvimento. Ao mesmo tempo, a visualização interativa de sinais de áudio por meio de representações visuais tridimensionais abre novas possibilidades para artistas, educadores e desenvolvedores. Este trabalho apresenta uma aplicação web que une essas duas áreas: um sistema de modelagem 3D paramétrica de móveis com design inspirado em povos indígenas brasileiros — os Mehinaku e os Wauja — enriquecido com padrões visuais derivados de análise matemática de sinais de áudio.

O projeto nasceu da necessidade de explorar como representações de áudio — como a transformada de Fourier (FFT) e o espectrograma (STFT) — podem ser utilizadas não apenas como ferramentas analíticas, mas como elementos estéticos e interativos dentro de modelos 3D. O resultado é uma aplicação que funciona inteiramente no navegador do usuário, sem necessidade de instalação, e que permite exportar os modelos em formatos utilizados por impressoras 3D.

Do ponto de vista do processo de desenvolvimento, este trabalho também documenta uma abordagem moderna: o uso de Inteligência Artificial como ferramenta de auxílio no ciclo de desenvolvimento, desde a escrita de código até o processo de deploy automatizado. Essa prática, cada vez mais comum na indústria, foi aplicada de forma sistemática neste projeto e seus resultados são discutidos ao longo deste artigo.

### 1.1 Objetivos

- Desenvolver uma aplicação web interativa para modelagem 3D de móveis com visualização de sinais de áudio.
- Explorar a integração entre Three.js e React para renderização 3D em ambientes web.
- Documentar o uso de IA no processo de desenvolvimento e deploy.
- Analisar os custos e modelos de hospedagem em nuvem para projetos acadêmicos e experimentais.

### 1.2 Organização do Artigo

O artigo está organizado da seguinte forma: a Seção 2 apresenta o sistema para leitores não técnicos; a Seção 3 descreve a arquitetura técnica; a Seção 4 explica os algoritmos de visualização de áudio; a Seção 5 documenta o processo de desenvolvimento com IA; a Seção 6 descreve o processo de deploy na Vercel; a Seção 7 analisa os custos de hospedagem; e a Seção 8 apresenta conclusões e trabalhos futuros.

---

## 2. O Sistema: Uma Visão para Todos os Públicos

### 2.1 O que é a Aplicação?

Imagine poder criar um objeto de arte digital que combina dois mundos aparentemente distantes: a cultura milenar dos povos indígenas brasileiros e a matemática que descreve o som. Esse é o propósito central desta aplicação.

De forma simples: o sistema cria **móveis tridimensionais em um ambiente virtual** que pode ser acessado por qualquer pessoa com um navegador de internet — como Chrome ou Firefox. O usuário pode escolher entre cinco tipos de móveis, ajustar suas dimensões com controles deslizantes (como ajustar o volume em um rádio) e aplicar diferentes "texturas" visuais que representam padrões sonoros.

Essas texturas sonoras não vêm de um arquivo de música real. Em vez disso, elas são **simulações matemáticas** de como o som se parece quando analisado por ferramentas científicas — como um osciloscópio (que mostra a forma de onda do som) ou um analisador de frequências (que mostra quais notas estão presentes no som).

### 2.2 Os Cinco Móveis

A aplicação oferece cinco peças de mobiliário, duas das quais foram inspiradas diretamente em artefatos culturais indígenas brasileiros:

1. **Cadeira**: Uma cadeira convencional com encosto, assento e quatro pernas.
2. **Mesa Retangular**: Mesa com tampo plano, quatro pernas e travessas de reforço.
3. **Mesa Redonda**: Mesa com tampo circular e base cônica, inspirada em designs modernos.
4. **Banco Mehinaku**: Inspirado nos bancos artesanais do povo Mehinaku, povo indígena do Alto Xingu (Mato Grosso). Possui tampo arredondado (com cantos curvos) e pernas em formato de painel plano.
5. **Banco Wauja**: Inspirado nos bancos do povo Waujá, também do Alto Xingu. Possui tampo retangular e painéis laterais com padrões decorativos.

Cada móvel pode ter suas dimensões ajustadas em tempo real, e o resultado é imediatamente visível na tela.

### 2.3 Os Modos de Textura de Áudio

A parte mais inovadora da aplicação é a possibilidade de aplicar diferentes "roupas visuais" ao móvel, baseadas em representações matemáticas de som:

- **Modo Sólido**: O móvel aparece com uma cor uniforme, sem padrão sonoro. É o modo mais simples.
- **Modo Onda (Waveform)**: Simula como uma onda sonora parece em um osciloscópio — linhas que sobem e descem. No modo animado, os segmentos do móvel pulsam e se movem como se o som estivesse "dentro" da madeira.
- **Modo FFT (Frequências)**: Simula um gráfico de frequências. Frequências baixas (sons graves) ficam na parte inferior, com barras altas e vibrantes. Frequências altas (sons agudos) ficam mais acima, com barras menores.
- **Modo Espectrograma (STFT)**: Combina tempo e frequência em uma só imagem. É como uma "radiografia" do som, mostrando como as frequências mudam ao longo do tempo.
- **Modo Combinado**: Mistura os três padrões anteriores em um único visual.

Quando um modo de textura de áudio está ativo (exceto o sólido), o móvel é decomposto em **centenas de pequenos cubos** — os "segmentos" — cada um posicionado e colorido de acordo com o padrão sonoro correspondente. No modo Onda, esses cubos se animam em tempo real, criando um efeito visual de "música congelada".

### 2.4 O que o Usuário Pode Fazer?

A interface lateral da aplicação oferece:

- **Seleção de móvel** por abas.
- **Controles de dimensão**: sliders para ajustar largura, altura, profundidade.
- **Seleção de cor** do móvel.
- **Controles de textura**: escolha do modo de áudio e intensidade dos padrões.
- **Controles de animação**: velocidade, pausa/reprodução.
- **Controles de visualização**: grade de referência, modo wireframe, rotação automática.
- **Exportação**: Download do modelo em formato STL (para impressão 3D) ou OBJ (para uso em software 3D como Blender).

---

## 3. Arquitetura Técnica

### 3.1 Tecnologias Utilizadas

A Tabela 1 apresenta o stack tecnológico completo da aplicação.

**Tabela 1 — Stack Tecnológico**

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework Web | Next.js | 16.2.6 |
| Biblioteca UI | React | 19.2.4 |
| Motor 3D | Three.js | 0.184.0 |
| Integração React/Three | @react-three/fiber | 9.6.1 |
| Componentes 3D | @react-three/drei | 10.7.7 |
| Linguagem | TypeScript | 5.7.3 |
| Estilização | Tailwind CSS | 4.2.0 |
| Componentes UI | shadcn/ui (Radix UI) | — |
| Linting | ESLint + eslint-config-next | 9.x / 16.2.6 |
| Gerenciador de Pacotes | pnpm | 10.x |
| Deploy | Vercel | — |

A escolha do Next.js como framework principal se justifica por três razões: (1) suporte nativo a TypeScript; (2) sistema de roteamento baseado em sistema de arquivos, simplificando a estrutura do projeto; (3) integração nativa com a plataforma Vercel para deploy contínuo.

O Three.js foi escolhido por ser a biblioteca JavaScript mais madura para renderização 3D no navegador, com ampla documentação e comunidade ativa. O `@react-three/fiber` serve como ponte declarativa entre o modelo de componentes do React e o sistema imperativo do Three.js, permitindo escrever cenas 3D como se fossem componentes React.

### 3.2 Estrutura de Arquivos

```
3d-forniture-modeling-from-audio/
├── app/
│   ├── layout.tsx          # Layout raiz: fontes, metadata, Analytics
│   ├── page.tsx            # Página principal: monta FurnitureViewer
│   └── globals.css         # Estilos globais (Tailwind directives)
├── components/
│   ├── furniture-viewer/
│   │   ├── index.tsx       # Orquestrador: Provider + Sidebar + Scene
│   │   ├── scene.tsx       # Canvas Three.js: câmera, luzes, móveis
│   │   ├── sidebar.tsx     # Painel de controle lateral
│   │   ├── header.tsx      # Menu mobile responsivo
│   │   ├── audio-material.tsx   # Material condicional shader/standard
│   │   ├── segmented-furniture.tsx  # Geometria procedural (1580 linhas)
│   │   ├── chair.tsx       # Cadeira sólida
│   │   ├── table.tsx       # Mesa sólida
│   │   ├── round-table.tsx # Mesa redonda sólida
│   │   ├── banco-mehinaku.tsx  # Banco Mehinaku sólido
│   │   └── banco-wauja.tsx     # Banco Wauja sólido
│   └── ui/                 # Componentes shadcn/ui
├── lib/
│   ├── furniture-context.tsx    # Estado global (React Context)
│   ├── audio-texture-shader.ts  # Shaders GLSL
│   └── stl-exporter.ts          # Exportação STL/OBJ
└── public/                 # Assets estáticos (ícones, imagens)
```

### 3.3 Gerenciamento de Estado

O estado global da aplicação é gerenciado por meio do padrão React Context API, implementado em `lib/furniture-context.tsx`. Este arquivo define:

1. A interface `FurnitureParams`, com aproximadamente 40 parâmetros distribuídos entre configurações de cada móvel e controles de visualização.
2. O `FurnitureProvider`, um componente React que encapsula os dados e as funções de atualização de estado.
3. O hook `useFurniture()`, utilizado por todos os componentes filhos para acessar e modificar o estado.

As funções `setParams` e `resetParams` são envolvidas em `useCallback` para garantir referências estáveis e evitar re-renderizações desnecessárias dos componentes que as recebem como props.

### 3.4 Pipeline de Renderização 3D

A Figura 1 (representada textualmente abaixo) ilustra o pipeline de renderização da cena 3D:

```
FurnitureProvider (Estado Global)
        |
        v
  FurnitureViewer (index.tsx)
   ├── Sidebar (controles)
   └── Canvas (@react-three/fiber)
           |
           v
      SceneContent (scene.tsx)
       ├── Câmera: PerspectiveCamera (FOV 50°, posição [3,2,4])
       ├── Iluminação:
       │   ├── ambientLight (0.4)
       │   ├── directionalLight (1.2, shadow 2048px)
       │   ├── pointLight #1 (cyan #4ecdc4)
       │   ├── pointLight #2 (vermelho #ff6b6b)
       │   └── spotLight (overhead focal)
       ├── Controles: OrbitControls (pan + zoom)
       ├── Referência: Grid + ContactShadows
       └── Móvel (condicional):
           ├── Modo Sólido: Chair | Table | RoundTable | Banco*
           └── Modo Segmentado: SegmentedChair | SegmentedTable | ...
```

A decisão de renderizar o móvel sólido **ou** o segmentado (nunca os dois ao mesmo tempo) é feita condicionalmente no `scene.tsx` com base no valor de `params.textureMode`.

### 3.5 Material com Shader de Áudio

O componente `AudioShaderMaterial` (`audio-material.tsx`) aplica o material correto dependendo do modo de textura:

```typescript
// Modo sólido ou wireframe: material padrão
if (params.textureMode === "solid" || params.showWireframe) {
  return <meshStandardMaterial color={baseColor} wireframe={...} />;
}

// Modos de áudio: shader customizado
return (
  <shaderMaterial
    vertexShader={audioVertexShader}
    fragmentShader={audioFragmentShader}
    uniforms={{
      uTime: { value: clock.elapsedTime * animationSpeed },
      uBaseColor: { value: hexToRgb(baseColor) },
      uPatternType: { value: modoComoInteiro },
    }}
  />
);
```

Os shaders GLSL são strings armazenadas em `lib/audio-texture-shader.ts`. O vertex shader é um passthrough simples; o fragment shader implementa os quatro padrões de áudio como funções GLSL separadas e os combina condicionalmente baseado em `uPatternType`.

---

## 4. Algoritmos de Visualização de Sinais de Áudio

Esta seção descreve os algoritmos centrais do sistema, que traduzem conceitos de processamento de sinais em deformações geométricas e paletas de cores tridimensionais.

### 4.1 Representações Matemáticas de Áudio Simuladas

É importante destacar que **a aplicação não processa áudio real**. Em vez disso, ela simula matematicamente como três representações clássicas de sinais sonoros se parecem visualmente, usando funções matemáticas como seno, exponencial e produto escalar.

#### 4.1.1 Forma de Onda (Waveform)

A forma de onda é a representação mais intuitiva do som: mostra como a amplitude (volume) varia ao longo do tempo. Um som grave produz ondas largas e esparsas; um som agudo produz ondas rápidas e densas.

```typescript
function getWaveformIntensity(normalizedPosition: number, time: number): number {
  const basePattern =
    normalizedPosition < 0.2 ? 0.8 + Math.sin(normalizedPosition * 50) * 0.2
    : normalizedPosition < 0.7 ? 0.4 + Math.sin(normalizedPosition * 30) * 0.3
    : normalizedPosition < 0.8 ? 0.1 + Math.sin(normalizedPosition * 20) * 0.1
    : 0.3 + Math.sin(normalizedPosition * 25) * 0.2;

  const timeVariation = time > 0 ? Math.sin(time * 2 + normalizedPosition * 10) * 0.3 : 0;
  return Math.max(0, Math.min(1, basePattern + timeVariation));
}
```

Este padrão imita a aparência de uma gravação de voz humana: alta intensidade no início (consoantes), intensidade média no meio (vogais) e queda progressiva ao final.

#### 4.1.2 FFT — Transformada de Fourier Discreta (Frequências)

A FFT (Fast Fourier Transform) decompõe um sinal sonoro em suas frequências constituintes. O resultado é um gráfico de "barras" onde cada barra representa uma frequência e sua altura indica quão forte essa frequência está presente no som. Sons graves têm barras altas à esquerda; sons agudos têm barras (menores) à direita.

```typescript
function getFFTIntensity(normalizedPosition: number): number {
  if (normalizedPosition < 0.1) {
    return 0.9 + Math.sin(normalizedPosition * 80) * 0.1; // Picos muito altos: baixas frequências
  } else if (normalizedPosition < 0.3) {
    const decay = Math.exp(-(normalizedPosition - 0.1) * 8);
    return 0.5 * decay + Math.sin(normalizedPosition * 60) * 0.2 * decay;
  } else {
    const decay = Math.exp(-(normalizedPosition - 0.3) * 3);
    return 0.15 * decay + 0.05; // Decaimento para frequências altas
  }
}
```

O uso da função exponencial `exp(-k * x)` é matematicamente preciso: espectros de áudio reais tipicamente apresentam decaimento exponencial da energia com o aumento da frequência.

#### 4.1.3 Espectrograma — STFT (Tempo × Frequência)

O espectrograma combina as duas representações anteriores em uma "imagem" bidimensional: o eixo horizontal representa o tempo, o eixo vertical representa a frequência, e a cor/intensidade em cada ponto indica quão forte aquela frequência estava presente naquele momento.

```typescript
function getSTFTIntensity(
  normalizedPosition: number,
  segmentIndex: number,
  totalSegments: number
): number {
  const normalizedSeg = segmentIndex / Math.max(totalSegments - 1, 1);
  const freqComponent = 1 - normalizedPosition * 0.6; // Frequências altas = menor energia
  const timeComponent =
    normalizedSeg < 0.1 ? 0.8 + Math.sin(normalizedSeg * 50) * 0.2
    : normalizedSeg < 0.6 ? 0.5 + Math.sin(normalizedSeg * 20) * 0.3
    : normalizedSeg < 0.75 ? 0.2 + Math.sin(normalizedSeg * 15) * 0.1
    : 0.4 + Math.sin(normalizedSeg * 25) * 0.2;

  return Math.max(0, Math.min(1, freqComponent * timeComponent));
}
```

A função STFT recebe dois parâmetros de posição: `normalizedPosition` (frequência/posição vertical) e `segmentIndex / totalSegments` (tempo/posição angular). O produto `freqComponent * timeComponent` cria um campo de intensidade bidimensional, replicando a aparência de um espectrograma real.

### 4.2 Mapeamento de Intensidade para Geometria 3D

A função `getInitialDisplacement` é o coração do sistema. Ela recebe a posição de cada segmento na estrutura 3D e o modo de textura ativo, e retorna o deslocamento radial e o fator de escala que aquele segmento deve receber:

```typescript
function getInitialDisplacement(
  layer, totalLayers, segment, totalSegments,
  basePosition, textureMode, intensityMultiplier
): { dx: number, dz: number, scale: number } {

  // Calcula intensidade baseada no modo
  let intensity: number;
  switch (textureMode) {
    case "fft": {
      const fftMag = getFFTIntensity(normalizedSeg);
      intensity = normalizedLayer < fftMag ? fftMag * (1 - ...) : 0.5;
      break;
    }
    // ... outros modos
  }

  // Converte intensidade em deslocamento radial
  const displacement = (intensity - 0.5) * intensityMultiplier * 0.15;

  // Calcula direção radial a partir do centro
  const dist = Math.sqrt(px² + pz²);
  return {
    dx: (px / dist) * displacement,
    dz: (pz / dist) * displacement,
    scale: scaleModifier
  };
}
```

O princípio fundamental é: cada segmento é empurrado **radialmente para fora** do centro do móvel por uma quantidade proporcional à intensidade do sinal naquele ponto. Isso cria a ilusão de que o móvel "respira" ou "pulsa" de acordo com o padrão sonoro.

### 4.3 Sistema de Paletas de Cores

Cada modo de áudio possui uma paleta de cores específica, inspirada em como esses sinais são tipicamente visualizados em ferramentas científicas:

- **Waveform**: Gradiente azul (0x1a237e → 0x90caf9), evocando osciloscópios clássicos.
- **FFT**: Gradiente vermelho (0x4a0000 → 0xffcccb), referenciando analisadores de espectro.
- **Espectrograma**: Mapa de calor (roxo → amarelo), referenciando o padrão de cores do matplotlib.
- **Combinado**: Mistura das três paletas com pesos iguais.

### 4.4 Sistema de Animação

A animação em tempo real opera apenas no modo Waveform, utilizando o hook `useFrame` do `@react-three/fiber`, que é chamado a cada quadro renderizado pelo motor Three.js:

```typescript
useFrame((state) => {
  // Para todos os modos exceto waveform: forma estática
  if (params.animationPaused || params.textureMode !== "waveform") return;

  const time = state.clock.elapsedTime * params.animationSpeed;
  const waveAmp = getWaveformIntensity(normalizedLayer, time + timeOffset);
  const angularWave = Math.sin(normalizedSeg * Math.PI * 8 + time * 2) * 0.3;
  const intensity = waveAmp + angularWave * waveAmp * 0.5;

  // Deslocamento radial
  meshRef.current.position.x = base[0] + dirX * (intensity - 0.5) * waveIntensity * 0.08;

  // Rotação pulsante
  meshRef.current.rotation.x = rotation[0] + intensity * Math.PI * 0.12;

  // Escala respirante
  meshRef.current.scale.set(
    scale[0] * (1 + (intensity - 0.5) * 0.3 * fftIntensity),
    scale[1],
    scale[2] * (...)
  );
});
```

A decisão de restringir a animação ao modo Waveform foi tomada após testes de usabilidade: os modos FFT e Espectrograma têm significado semântico preciso (a posição dos segmentos *representa* os dados) e animá-los causaria distorção visual.

---

## 5. Desenvolvimento Assistido por Inteligência Artificial

### 5.1 Contexto e Ferramentas Utilizadas

O desenvolvimento deste projeto foi realizado com auxílio do **Claude Code** (Anthropic), uma ferramenta de IA integrada ao terminal de linha de comando que permite interagir com o código-fonte de forma contextual e executar tarefas de engenharia de software de forma autônoma ou assistida.

O Claude Code é um agente de software capaz de:
- Ler e analisar o código-fonte de um projeto inteiro.
- Propor e aplicar alterações em arquivos.
- Executar comandos de terminal (build, lint, testes).
- Corrigir erros identificados de forma iterativa.
- Criar commits, branches e pull requests em repositórios Git.
- Interagir com APIs externas (como a API do GitHub e a CLI da Vercel).

### 5.2 Fases do Desenvolvimento Assistido por IA

#### 5.2.1 Correção de Erros de TypeScript

A primeira interação significativa com a IA foi a correção de erros de compilação TypeScript. O projeto apresentava 20 erros ao ser submetido à verificação de tipos (`tsc --noEmit`). A IA realizou o seguinte processo sistemático:

1. **Investigação**: Rodou `tsc --noEmit` e analisou cada erro individualmente.
2. **Diagnóstico de causa raiz**: Identificou que a maioria dos erros derivava de uma causa comum — a ausência do pacote `@types/three`, que fornece os tipos TypeScript para a biblioteca Three.js. Uma vez identificada essa causa raiz, 12 dos 20 erros foram resolvidos com a instalação de um único pacote.
3. **Correções pontuais**: Os 8 erros restantes foram corrigidos individualmente:
   - `useRef` recebendo uma função inicializadora (inválido em React 19): convertido para IIFE.
   - Props `key` duplicadas em spreads JSX: corrigido com destructuring.
   - `ExtrudeGeometry` sendo passada como `React.ReactNode`: envolvida em `<primitive attach="geometry">`.

Este processo, que normalmente levaria um desenvolvedor experiente várias horas, foi concluído em minutos, com cada decisão técnica documentada.

#### 5.2.2 Ciclos Autônomos de QA

Para a fase de qualidade, a IA operou em modo autônomo com um protocolo pré-definido chamado "Full Autonomous QA Runtime Debugging & Improvement Cycle". Este ciclo incluía:

**Fase 1 — Construção e Observação:**
```bash
pnpm install && tsc --noEmit && pnpm lint && pnpm build
```

**Fase 2 — Diagnóstico e Correção de Erros:**
A IA categorizou cada problema encontrado, identificou a causa raiz e aplicou a correção mínima necessária.

**Fase 3 — Investigação Proativa:**
Mesmo com o sistema estável (sem erros), a IA analisou o código em busca de melhorias:
- Dependências `useMemo` ausentes.
- Bloco duplicado de controles de áudio na sidebar.
- Callbacks sem `useCallback` no contexto global.
- Comentários JSX em português (inconsistência com a língua do código).
- Fontes Geist não aplicadas ao body do documento (bug de layout).

**Fase 4/5 — Especificações e Implementação:**
Para cada melhoria, a IA criou uma especificação antes de implementar, documentou as mudanças e criou commits granulares.

#### 5.2.3 Gestão do Repositório Git

A IA gerenciou o ciclo completo de Git, incluindo:
- Criação de branches com nomenclatura semântica (`fix/typescript-compilation-errors`, `feature/animation-simplification`, `feature/improvements`).
- Criação de pull requests via API do GitHub com descrição detalhada e checklist de testes.
- Merge de PRs após aprovação.
- Reverter main para o commit correto e reorganizar history quando necessário.

#### 5.2.4 Diagnóstico de Bugs em Produção

Um bug de hydration foi reportado após o deploy local:

```
[browser] A tree hydrated but some attributes of the server rendered HTML 
didn't match the client properties.
  <body
    className="font-sans antialiased"
-   cz-shortcut-listen="true"
  >
```

A IA identificou a causa raiz imediatamente: uma extensão de navegador (possivelmente ColorZilla, um seletor de cores) estava injetando o atributo `cz-shortcut-listen="true"` no elemento `<body>` antes do React completar a hidratação. Este é um problema externo ao código, e a solução correta é adicionar `suppressHydrationWarning` ao `<body>` no `layout.tsx`:

```tsx
<body className={`...`} suppressHydrationWarning>
```

Esta propriedade instrui o React a ignorar divergências de atributos no elemento `<body>`, pois extensões de navegador comumente modificam este elemento.

### 5.3 Vantagens e Limitações do Desenvolvimento Assistido por IA

**Vantagens observadas:**
- **Velocidade**: Tarefas que levariam horas (como configurar ESLint com flat config no ESLint 9+) foram concluídas em minutos.
- **Consistência**: A IA seguiu padrões estabelecidos no projeto de forma consistente.
- **Documentação**: Cada mudança foi documentada automaticamente em mensagens de commit.
- **Cobertura**: A IA verificou todo o código, não apenas as partes trabalhadas, identificando problemas que não estavam no escopo original.

**Limitações identificadas:**
- A IA não tem como testar visualmente a aplicação (UX e comportamento de animações só podem ser validados por humanos).
- Em situações de ambiguidade (múltiplas soluções possíveis), a IA escolhe a mais conservadora, que pode não ser a mais desejada pelo desenvolvedor.
- Tokens de autenticação e segredos precisam ser fornecidos pelo usuário; a IA não pode gerenciar credenciais de forma autônoma.

---

## 6. Deploy na Plataforma Vercel

### 6.1 O que é Deploy?

Para quem não é da área de tecnologia: "deploy" (do inglês, "implantar") é o processo de pegar um projeto que existe apenas no computador do desenvolvedor e torná-lo **acessível para qualquer pessoa na internet**. É como publicar um livro: o manuscrito existe localmente, mas o deploy o leva para a "livraria" (a internet).

### 6.2 O que é a Vercel?

A Vercel é uma plataforma de nuvem especializada em hospedagem de aplicações web modernas, com foco especial em aplicações Next.js (a empresa criadora do Next.js e a Vercel são intimamente relacionadas). A Vercel cuida de toda a infraestrutura: servidores, certificados SSL (o cadeado de segurança na URL), distribuição global por CDN (Content Delivery Network), entre outros.

### 6.3 Processo de Deploy — Passo a Passo

O deploy foi realizado via CLI (interface de linha de comando) da Vercel, com auxílio da IA. O processo completo foi:

**Passo 1 — Autenticação:**
```bash
npx vercel login
# Output: Congratulations! You are now signed in.
```
O usuário acessou a URL fornecida no terminal e autenticou via browser. A CLI da Vercel usa o padrão OAuth 2.0 com Device Authorization Grant (RFC 8628), o mesmo protocolo usado por Smart TVs que pedem para acessar uma URL no celular.

**Passo 2 — Vinculação do projeto:**
```bash
npx vercel link --yes
# Output: Linked vitormaverick-5014s-projects/3d-forniture-modeling-from-audio
```
Este comando detecta automaticamente que o projeto é Next.js (pelo arquivo `next.config.mjs`), identifica o build command (`next build`) e vincula o diretório local ao projeto na Vercel.

**Passo 3 — Deploy para Produção:**
```bash
npx vercel --prod --yes
```

A Vercel realizou os seguintes passos automaticamente:
1. Upload dos arquivos do projeto (~983 KB).
2. Resolução das dependências via pnpm na região Washington D.C. (iad1).
3. Execução do build com Next.js Turbopack.
4. Geração das páginas estáticas.
5. Deploy do output na CDN global da Vercel.

**Output relevante do processo:**
```
Running "pnpm run build"
▲ Next.js 16.2.6 (Turbopack)
✓ Compiled successfully in 7.1s
✓ Generating static pages (3/3) in 178ms
Build Completed in /vercel/output [25s]
▲ Production https://3d-forniture-modeling-from-audio.vercel.app
```

**Passo 4 — Verificação:**
O deploy resultou no status `READY`, com a aplicação acessível em:
- URL única de deployment: `https://3d-forniture-modeling-from-audio-ml32yk2jj.vercel.app`
- URL de produção: `https://3d-forniture-modeling-from-audio.vercel.app`

### 6.4 Arquitetura da Infraestrutura Vercel

A Vercel utiliza uma arquitetura de Edge Network para servir a aplicação:

```
Usuário (browser)
      |
      v
Vercel Edge Network (CDN global: ~100 pontos de presença)
      |
      ├── Arquivos estáticos (HTML, CSS, JS): servidos diretamente da CDN
      └── Server Functions (se houver): executadas na região mais próxima
```

Para esta aplicação especificamente, toda a renderização acontece **no lado do cliente** (browser do usuário). O Next.js gera as páginas como HTML estático durante o build, e o Three.js roda inteiramente no WebGL do navegador. Isso significa que a Vercel funciona essencialmente como um servidor de arquivos estáticos de alta performance para este projeto.

---

## 7. Análise de Custos e Ferramentas Gratuitas da Vercel

### 7.1 Este Deploy Gera Custos?

**Resposta direta: Não.** Para este projeto e para a grande maioria de projetos acadêmicos, experimentais ou portfólios pessoais, a Vercel oferece um **plano gratuito generoso** que cobre totalmente as necessidades.

O plano gratuito da Vercel (chamado "Hobby") inclui:
- **Deploy ilimitado** de projetos pessoais.
- **100 GB de bandwidth por mês** (tráfego de dados).
- **Domínio gratuito** `*.vercel.app` com HTTPS automático.
- **Deploy automático via GitHub** a cada push.
- **CDN global** (mais de 100 pontos de presença no mundo).
- **Unlimited static file hosting**.
- **Unlimited deployments** (cada push gera um preview URL).

### 7.2 Entendendo os Limites com Exemplos Práticos

#### Bandwidth (100 GB/mês)

Para calcular se o projeto fica dentro do limite, precisamos estimar o tamanho da aplicação:

- HTML + CSS + JS inicial: ~500 KB (comprimido)
- Three.js e dependências 3D: ~1.2 MB (comprimido)
- Total por visita: ~1.7 MB

Com 100 GB de bandwidth:
```
100 GB / 1.7 MB por visita ≈ 58.000 visitas por mês
```

Para um projeto acadêmico ou portfólio pessoal, **58 mil visitas mensais** é um limite extremamente confortável.

#### Build Minutes (6.000 minutos/mês)

Cada deploy consome tempo de build. Neste projeto, o build leva ~25 segundos.

```
6.000 minutos = 360.000 segundos
360.000 / 25 ≈ 14.400 deploys por mês
```

Isso equivale a fazer **48 deploys por dia**, o que é mais do que suficiente para qualquer ciclo de desenvolvimento.

#### Serverless Functions

Este projeto não usa funções serverless (toda a lógica roda no browser), então este limite não se aplica.

### 7.3 Quando o Projeto Precisaria de um Plano Pago?

A Vercel cobra a partir do plano Pro (US$ 20/mês por usuário) quando o projeto:
- Excede 100 GB de bandwidth mensal.
- Necessita de **domínio customizado com múltiplos ambientes** (ex: staging.meusite.com).
- Requer **Vercel Analytics avançado** (tracking de Core Web Vitals).
- Precisa de **Edge Functions** com mais de 1 milhão de execuções/mês.
- Faz parte de um **time/organização** (o plano Hobby é estritamente pessoal).

Para projetos como este — um experimento acadêmico/portfólio — o plano gratuito **nunca precisaria ser upgradado**.

### 7.4 Configurando o Deploy Automático via GitHub (Gratuitamente)

Uma das funcionalidades mais poderosas da Vercel, disponível gratuitamente, é o **deploy automático a cada push no GitHub**. Neste projeto, durante o processo de `vercel link`, ocorreu um erro de conexão com o GitHub:

```
Error: Failed to link VitorMaverick/3d-furniture-modeling-from-audio.
You need to add a Login Connection to your GitHub account first.
```

Este erro ocorreu porque a conta Vercel não estava conectada ao GitHub. Para corrigir e ativar o deploy automático gratuito:

1. Acesse [vercel.com/account/login-connections](https://vercel.com/account/login-connections).
2. Clique em "Connect" ao lado de "GitHub".
3. Autorize o acesso da Vercel ao repositório desejado.

Após essa configuração, **qualquer push para a branch `main`** gera automaticamente um novo deploy de produção. Pushes para outras branches (`feature/*`, `fix/*`) geram **preview deployments** — URLs únicas para testar as mudanças antes de mergear.

Este fluxo de trabalho pode ser visualizado da seguinte forma:

```
Desenvolvedor faz push para o GitHub
        |
        ├── Branch main → Deploy de Produção
        │   └── URL: https://meu-projeto.vercel.app
        |
        └── Branch feature/X → Preview Deployment
            └── URL: https://meu-projeto-git-feature-x-abc.vercel.app
```

### 7.5 Monitoramento de Custos com o Dashboard Vercel

O painel da Vercel (`vercel.com/dashboard`) oferece, gratuitamente, visibilidade sobre:
- **Usage Dashboard**: Bandwidth consumido no mês atual.
- **Deployment History**: Todos os deploys, com status e duração do build.
- **Build Logs**: Output completo de cada build para diagnóstico.
- **Function Logs**: Logs de execução (quando aplicável).

Para monitorar o projeto diretamente pelo terminal, o comando `npx vercel ls` lista todos os deployments recentes com seus status:

```bash
npx vercel ls
# Output:
# 3d-forniture-modeling-from-audio   1m ago  READY  https://...
```

### 7.6 Comparativo com Outras Plataformas Gratuitas

| Plataforma | Bandwidth gratuito | Builds | Domínio | Next.js Suporte |
|---|---|---|---|---|
| **Vercel** | 100 GB/mês | 6.000 min/mês | .vercel.app | ✅ Nativo |
| Netlify | 100 GB/mês | 300 min/mês | .netlify.app | ✅ Parcial |
| GitHub Pages | Sem limite declarado | — | .github.io | ❌ Estático |
| Render | 100 GB/mês | 750 hrs/mês | .onrender.com | ✅ Sim |
| Railway | 5 GB/mês | — | .railway.app | ✅ Sim |

Para projetos Next.js, a Vercel é a escolha mais natural e com melhor integração, especialmente pelo suporte nativo a todas as funcionalidades do framework.

---

## 8. Resultados e Validação

### 8.1 Estado Final da Aplicação

A Tabela 2 apresenta o resultado de cada etapa de verificação após o ciclo completo de desenvolvimento e QA.

**Tabela 2 — Estado Final da Aplicação**

| Etapa de Verificação | Ferramenta | Status | Detalhes |
|---|---|---|---|
| Instalação de Dependências | pnpm install | ✅ | 532 pacotes, 15s |
| Verificação de Tipos | tsc --noEmit | ✅ | 0 erros |
| Linting | eslint . | ✅ | 0 erros, 0 warnings |
| Build de Produção | pnpm build | ✅ | Compilado em 7.1s |
| Servidor de Desenvolvimento | next dev | ✅ | HTTP 200 em localhost |
| Deploy em Produção | vercel --prod | ✅ | READY em 25s |
| Smoke Test (URL pública) | curl / browser | ✅ | HTTP 200, aplicação funcional |

### 8.2 Melhorias Implementadas pelo Ciclo de QA com IA

O ciclo autônomo de QA identificou e implementou as seguintes melhorias além das correções de bugs:

1. **Dependências `useMemo` corrigidas**: Prevenção de comportamentos inesperados em re-renders.
2. **Bloco duplicado de controles removido**: Redução de 42 linhas de código duplicado na sidebar.
3. **Callbacks estabilizados com `useCallback`**: Redução de re-renders desnecessários.
4. **Comentários traduzidos para inglês**: Consistência linguística no codebase.
5. **Fonte Geist aplicada corretamente**: Bug de layout corrigido onde a fonte não era injetada no document body.
6. **Hydration warning suprimido**: Compatibilidade com extensões de navegador.

---

## 9. Trabalhos Futuros

Embora a aplicação esteja funcional e estável, algumas áreas de melhoria foram identificadas durante o desenvolvimento e ficaram para iterações futuras:

1. **Áudio real**: Substituir as funções matemáticas simuladas por análise de um arquivo de áudio real (Web Audio API). Isso permitiria que o usuário carregasse uma música e visse o móvel "dançar" com ela.

2. **Performance em dispositivos móveis**: A renderização de 1.600+ segmentos em dispositivos com GPU integrada pode ser otimizada com `InstancedMesh` do Three.js, que renderiza múltiplas cópias da mesma geometria em uma única chamada à GPU.

3. **Acessibilidade**: Adicionar atributos `aria-label` nos controles de cor e `aria-describedby` nos sliders para compatibilidade com leitores de tela.

4. **Testes automatizados**: Implementar testes unitários para as funções de cálculo de intensidade (Vitest) e testes de integração para os componentes Three.js (Playwright).

5. **Internacionalização**: A interface está em português, mas o código em inglês. Implementar i18n completo tornaria o projeto mais acessível internacionalmente.

---

## 10. Conclusão

Este artigo apresentou o desenvolvimento de uma aplicação web interativa que une modelagem 3D paramétrica, visualização de sinais de áudio e referências ao design cultural indígena brasileiro. Do ponto de vista técnico, o projeto demonstrou a viabilidade de criar experiências 3D ricas diretamente no browser usando Three.js e React, sem necessidade de softwares especializados.

Do ponto de vista do processo, o desenvolvimento assistido por IA se mostrou uma ferramenta de produtividade significativa, especialmente em tarefas de diagnóstico e correção de erros, configuração de infraestrutura e gestão de repositório. A IA não substituiu o julgamento humano — decisões como a escolha estética das paletas de cores ou o design da interface permaneceram sob responsabilidade humana — mas amplificou a capacidade do desenvolvedor em lidar com a complexidade técnica do projeto.

O deploy gratuito na Vercel demonstrou que a publicação de projetos acadêmicos e experimentais na internet está ao alcance de qualquer estudante, sem custo financeiro e com configuração mínima. Para o contexto de um TCC ou projeto de portfólio, o plano Hobby da Vercel é mais do que suficiente.

O projeto está disponível publicamente em:
- **Aplicação**: https://3d-forniture-modeling-from-audio.vercel.app
- **Código-fonte**: https://github.com/VitorMaverick/3d-furniture-modeling-from-audio

---

## Referências

ANTHROPIC. **Claude Code: An Agentic Coding Tool**. Disponível em: https://claude.ai/claude-code. Acesso em: 26 mai. 2026.

CABRAL, Suely. **Arte e artefatos indígenas: os bancos dos povos do Alto Xingu**. Museu do Índio, 2019.

COOLEY, James W.; TUKEY, John W. An algorithm for the machine calculation of complex Fourier series. **Mathematics of Computation**, v. 19, n. 90, p. 297-301, 1965.

DANCHILLA, Brian. **Three.js Essentials**. Packt Publishing, 2013.

DRIS, Achraf. **React Three Fiber Documentation**. Disponível em: https://docs.pmnd.rs/react-three-fiber. Acesso em: 26 mai. 2026.

GITHUB INC. **VitorMaverick/3d-furniture-modeling-from-audio**. Disponível em: https://github.com/VitorMaverick/3d-furniture-modeling-from-audio. Acesso em: 26 mai. 2026.

NEXTJS. **Next.js 16 Documentation**. Vercel Inc., 2026. Disponível em: https://nextjs.org/docs. Acesso em: 26 mai. 2026.

OPPENHEIM, Alan V.; SCHAFER, Ronald W. **Discrete-Time Signal Processing**. 3. ed. Prentice Hall, 2009.

VERCEL INC. **Vercel Documentation: Pricing and Plans**. Disponível em: https://vercel.com/docs/pricing. Acesso em: 26 mai. 2026.

VERCEL INC. **Vercel Documentation: Deployments Overview**. Disponível em: https://vercel.com/docs/deployments/overview. Acesso em: 26 mai. 2026.

---

*Este artigo foi redigido com auxílio do Claude (Anthropic) — claude.ai.*
