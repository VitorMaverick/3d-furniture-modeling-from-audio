# 🪑 3D Furniture Modeling from Audio

Aplicação web interativa que modela móveis 3D parametricamente e deforma suas geometrias com base em características de áudio. Os móveis são inspirados em designs indígenas brasileiros (Mehinaku e Waujá) e podem ser exportados para impressão 3D.

> **Demo:** [3d-forniture-modeling-from-audio.vercel.app](https://3d-forniture-modeling-from-audio.vercel.app)

---

## O que faz

- Renderiza 6 tipos de móveis 3D parametrizáveis em tempo real
- Decompõe cada móvel em uma grade de segmentos (35 camadas × 32 segmentos = 1.120 peças)
- Aplica 6 modos de textura baseados em análise de áudio: Sólido, Waveform, FFT, Espectrograma, Combinado e IA Generativa
- Permite upload de imagens de frequência que são analisadas por IA (Groq Vision / Gemini Flash / Pollinations)
- Exporta modelos para STL e OBJ (prontos pra impressão 3D)
- Exporta mídia: imagens PNG/JPEG/WebP (até 4K), vídeo WebM e GIF animado

---

## Stack

| Tecnologia | Versão | Papel |
|-----------|--------|-------|
| Next.js | 16.2.6 | Framework (App Router + Turbopack) |
| React | 19 | UI |
| Three.js | 0.184.0 | Motor 3D (WebGL) |
| React Three Fiber | 9.6.1 | Three.js declarativo em React |
| @react-three/drei | 10.7.7 | Helpers (OrbitControls, Environment, etc) |
| TypeScript | 5.7.3 | Tipagem estática |
| Tailwind CSS | 4.2.0 | Estilização |
| shadcn/ui (Radix) | — | Componentes UI acessíveis |
| pnpm | — | Gerenciador de pacotes |

---

## Início rápido

```bash
# Clonar
git clone https://github.com/seu-usuario/3d-forniture-modeling-from-audio.git
cd 3d-forniture-modeling-from-audio

# Instalar dependências
pnpm install

# Configurar variáveis de ambiente (opcional, pro modo IA)
cp .env.example .env.local
# Edite .env.local com suas chaves (veja seção abaixo)

# Rodar em desenvolvimento
pnpm dev
```

Abra [http://localhost:3000](http://localhost:3000).

---

## Scripts disponíveis

| Comando | O que faz |
|---------|-----------|
| `pnpm dev` | Servidor de desenvolvimento (Turbopack) |
| `pnpm build` | Build de produção |
| `pnpm start` | Serve o build de produção |
| `pnpm lint` | Linting com ESLint |
| `pnpm exec tsc --noEmit` | Verificação de tipos TypeScript |

---

## Variáveis de ambiente

O modo **IA Generativa** requer pelo menos uma chave de API. O sistema usa cascade de fallbacks — se o primeiro falhar, tenta o próximo:

```env
# Obtenha em https://console.groq.com (obrigatório para IA)
GROQ_API_KEY=

# Fallback: https://aistudio.google.com (opcional)
GEMINI_API_KEY=

# Pollinations.AI é usado como terceiro fallback (sem chave necessária)
```

Sem nenhuma chave configurada, o modo IA ainda funciona usando presets locais.

---

## Estrutura do projeto

```
app/
├── page.tsx                          # Página principal
├── layout.tsx                        # Layout global (fonts, providers)
├── login/page.tsx                    # Página de login
└── api/analyze-frequency/route.ts    # Endpoint de análise de imagem com IA

components/
├── furniture-viewer/
│   ├── index.tsx                     # Componente raiz (providers + layout)
│   ├── scene.tsx                     # Canvas 3D, câmera, luzes, controles
│   ├── segmented-furniture.tsx       # Geração procedural de geometria (2.482 linhas)
│   ├── sidebar.tsx                   # Painel de controles (sliders, tabs, export)
│   ├── audio-material.tsx            # ShaderMaterial customizado
│   ├── banco-mehinaku-perfurado.tsx  # Banco com chapa perfurada
│   ├── banco-mehinaku.tsx            # Banco com parafusos de rosca
│   ├── banco-wauja.tsx               # Banco Waujá
│   ├── chair.tsx                     # Cadeira
│   ├── table.tsx                     # Mesa retangular
│   ├── round-table.tsx               # Mesa redonda
│   ├── header.tsx                    # Cabeçalho
│   ├── frequency-upload-modal.tsx    # Modal de upload de frequência
│   ├── recording-controller.tsx      # Controle de gravação
│   └── image-capture-bridge.tsx      # Bridge pra captura de imagem
└── ui/                               # Componentes shadcn/ui (Radix)

lib/
├── furniture-context.tsx             # Estado global (50+ parâmetros)
├── recording-context.tsx             # Estado de gravação de mídia
├── image-capture-context.tsx         # Coordenação de captura
├── audio-texture-shader.ts           # Shaders GLSL (vertex + fragment)
├── ai-wave-provider.ts              # Integração com IAs (Groq, Gemini, Pollinations)
├── stl-exporter.ts                  # Exportação STL e OBJ
└── utils.ts                          # Utilitários (cn)

hooks/
├── useExportVideo.ts                 # Gravação de vídeo WebM
├── useExportGIF.ts                   # Geração de GIF animado
├── useExportImage.ts                 # Captura de imagem em alta resolução
├── use-mobile.ts                     # Detecção de mobile
└── use-toast.ts                      # Notificações

docs/                                 # Artigos acadêmicos e documentação técnica
```

---

## Móveis disponíveis

| Móvel | Inspiração | Características |
|-------|-----------|-----------------|
| Cadeira | — | Pernas, assento e encosto parametrizáveis |
| Mesa retangular | — | Tampo e pernas com dimensões ajustáveis |
| Mesa redonda | — | Base cônica com tampo circular |
| Banco Mehinaku (parafusos) | Banco cerimonial Mehinaku | Colunas que simulam parafusos de rosca |
| Banco Mehinaku (perfurado) | Chapa metálica perfurada | Furos em 3 padrões: trevo, cruz, quadrado |
| Banco Waujá | Banco cerimonial Waujá | Formato orgânico com curvatura no topo |

---

## Modos de textura

| Modo | Descrição |
|------|-----------|
| **Sólido** | Sem efeito de áudio. Cor única. |
| **Waveform** | Simula forma de onda no domínio do tempo. Seções de alta/baixa amplitude. |
| **FFT** | Simula espectro de frequência. Picos fortes em graves, decaimento exponencial nos agudos. |
| **Espectrograma** | Simula STFT. Frequência × tempo com variação de intensidade. |
| **Combinado** | Média dos três modos anteriores. |
| **IA Generativa** | Upload de imagem de frequência → IA analisa → gera parâmetros de onda. |

---

## Modo IA Generativa

1. Selecione o modo "IA" na sidebar
2. Faça upload de uma imagem de espectrograma, forma de onda ou FFT
3. O servidor envia pra análise (cascade: Groq Vision → Gemini Flash → Pollinations → preset)
4. A IA retorna parâmetros: amplitudes por banda, complexidade, densidade, paleta de cores
5. A geometria se deforma em tempo real com base nesses parâmetros

Parâmetros retornados pela IA:
- `lowFreqAmplitude`, `midFreqAmplitude`, `highFreqAmplitude`
- `complexity`, `density`, `dominantBand`
- `colorPalette` (5 cores hex)
- Sub-bandas opcionais: `subBassEnergy`, `bassEnergy`, `lowMidEnergy`, `midEnergy`, `highMidEnergy`, `trebleEnergy`
- `roughness`, `brightness`, `temporalVariance`, `rhythmicRegularity`

---

## Exportação

### Modelos 3D
- **STL** — formato padrão pra impressão 3D (ASCII)
- **OBJ** — formato alternativo com suporte a normais

### Mídia
- **Imagem** — PNG, JPEG ou WebP em 1080p ou 4K
- **Vídeo** — WebM (VP9/VP8) com duração configurável (3s, 5s, 10s)
- **GIF** — Animação 360° com downscale automático pra tamanho razoável

---

## Arquitetura resumida

```
┌─────────────────────────────────────────────────┐
│                  FurnitureProvider               │
│              (50+ parâmetros globais)            │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────┐    ┌──────────────────────────┐   │
│  │ Sidebar  │    │         Scene            │   │
│  │ (sliders,│    │  ┌────────────────────┐  │   │
│  │  tabs,   │───▶│  │SegmentedFurniture  │  │   │
│  │  export) │    │  │ (1120 segmentos)   │  │   │
│  └──────────┘    │  └────────────────────┘  │   │
│                  │  ┌────────────────────┐  │   │
│                  │  │ AudioShaderMaterial │  │   │
│                  │  │ (GLSL vertex+frag) │  │   │
│                  │  └────────────────────┘  │   │
│                  └──────────────────────────┘   │
└─────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────┐
│ /api/analyze-   │
│ frequency       │
│ (Groq→Gemini→   │
│  Pollinations)  │
└─────────────────┘
```

---

## Deploy

O projeto está configurado pra deploy na Vercel:

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Ou conecte o repositório direto na [dashboard da Vercel](https://vercel.com/dashboard). Cada push na `main` faz deploy automático.

Variáveis de ambiente devem ser configuradas nas settings do projeto na Vercel.

---

## Desenvolvimento

```bash
# Verificar tipos
pnpm exec tsc --noEmit

# Build de produção (verifica se tudo compila)
pnpm build

# Lint
pnpm lint
```

O projeto compila limpo (zero erros TypeScript, build em ~3.5s com Turbopack).

Não há framework de testes configurado atualmente.

---

## Contexto cultural

Os bancos Mehinaku e Waujá são inspirados em assentos cerimoniais de povos indígenas do Alto Xingu (Brasil). O projeto explora a intersecção entre:

- **Cultura material indígena** — formas, proporções e funções dos bancos tradicionais
- **Análise de áudio** — características acústicas de canções e sons tradicionais
- **Modelagem paramétrica 3D** — representação computacional que permite variação e personalização

---

## Licença

Projeto acadêmico. Consulte o autor para uso comercial.
