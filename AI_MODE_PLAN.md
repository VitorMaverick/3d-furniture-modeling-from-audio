# AI_MODE_PLAN — Modo IA para Customização de Ondas

## Objetivo
Permitir upload de imagem de gráfico de frequência → IA extrai parâmetros acústicos → ondulações dos móveis 3D são atualizadas com base na análise.

## Fluxo do Usuário
1. Usuário abre a sidebar e clica na seção **"IA Generativa de Ondas"**
2. Painel expande com drop zone para imagem (PNG, JPG, WebP, máx 5MB)
3. Usuário faz upload da imagem do gráfico de frequência
4. Clica em **"Analisar Frequência"**
5. Frontend envia para `/api/analyze-frequency`
6. API chama Groq Vision → Gemini Flash → Pollinations Text → fallback preset
7. Retorna `AIWaveParams` (amplitudes por banda + paleta + mensagem)
8. Usuário clica **"Aplicar ao Móvel"** → `textureMode` muda para `"ai-image"`
9. Móvel 3D atualiza em tempo real com os novos padrões de onda

## Arquitetura

```
Frontend (sidebar)
  └── FrequencyUploadSection  (components/furniture-viewer/frequency-upload-modal.tsx)
        ↓ POST multipart/form-data
API Route
  └── app/api/analyze-frequency/route.ts
        ↓ calls
AI Provider
  └── lib/ai-wave-provider.ts
        → Groq Vision (llama-4-scout-17b)  [requer GROQ_API_KEY]
        → Gemini Flash                      [requer GEMINI_API_KEY]
        → Pollinations Text                 [gratuito, sem key]
        → Fallback preset aleatório

State
  └── lib/furniture-context.tsx
        AIWaveParams interface
        FurnitureParams.aiWaveParams
        TextureMode + "ai-image"

3D Rendering
  └── components/furniture-viewer/segmented-furniture.tsx
        getAIWaveIntensity() — mapa bandas de frequência → deformação por altura
        getAIWaveColor()     — paleta de cores da IA interpolada por altura
```

## Parâmetros de Onda IA (`AIWaveParams`)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `lowFreqAmplitude` | 0-1 | Energia de graves → deforma segmentos do fundo |
| `midFreqAmplitude` | 0-1 | Energia de médios → deforma segmentos do meio |
| `highFreqAmplitude` | 0-1 | Energia de agudos → deforma segmentos do topo |
| `complexity` | 0-1 | Complexidade → controla nº de oscilações angulares |
| `density` | 0-1 | Densidade → controla oscilações verticais |
| `dominantBand` | low/mid/high | Banda dominante |
| `colorPalette` | string[5] | 5 cores hex para gradiente do móvel |
| `message` | string | Frase em português descrevendo o padrão |

## Fallback Chain
1. Groq Vision `meta-llama/llama-4-scout-17b-16e-instruct` (análise real da imagem)
2. Gemini Flash 2.0 (análise real da imagem)
3. Pollinations.AI texto (gera parâmetros criativos sem ver a imagem)
4. Preset aleatório de 4 configurações pré-definidas

## Arquivos Criados/Modificados

| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| `lib/ai-wave-provider.ts` | NOVO | Lógica de IA com fallback triplo |
| `app/api/analyze-frequency/route.ts` | NOVO | Endpoint Next.js API Route |
| `components/furniture-viewer/frequency-upload-modal.tsx` | NOVO | Componente de upload na sidebar |
| `lib/furniture-context.tsx` | MOD | Adiciona AIWaveParams + "ai-image" TextureMode |
| `components/furniture-viewer/segmented-furniture.tsx` | MOD | Adiciona funções AI + suporte "ai-image" |
| `components/furniture-viewer/sidebar.tsx` | MOD | Adiciona seção IA Generativa |
| `.env.example` | MOD | Adiciona GROQ_API_KEY e GEMINI_API_KEY |
