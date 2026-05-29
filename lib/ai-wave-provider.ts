import type { AIWaveParams } from "@/lib/furniture-context";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const POLLINATIONS_URL = "https://text.pollinations.ai/openai";

// Prompt enriquecido para quando temos parametros do Python
const ENRICHED_PROMPT = `You are an expert in audio visualization and 3D furniture design.
You will receive:
1. An image of a frequency graph (waveform, FFT spectrum, or spectrogram).
2. A JSON with precise acoustic parameters extracted from the audio (Python analysis).

Your task: return a JSON that may refine these parameters creatively based on the image, but must keep the original parameters as the primary source of truth.
You can adjust color palette and message based on emotional interpretation of the sound, but do NOT change the numeric parameters arbitrarily unless the image clearly suggests a different dominant band or energy distribution.

Return ONLY valid JSON:
{
  "lowFreqAmplitude": <original or slightly adjusted>,
  "midFreqAmplitude": <original or slightly adjusted>,
  "highFreqAmplitude": <original or slightly adjusted>,
  "complexity": <original>,
  "density": <original>,
  "dominantBand": <original>,
  "colorPalette": ["#HEX1","#HEX2","#HEX3","#HEX4","#HEX5"],
  "message": "<creative description in Portuguese>",
  "roughness": <original>,
  "brightness": <original>,
  "temporalVariance": <original>,
  "rhythmicRegularity": <original>,
  "subBassEnergy": <original>,
  "bassEnergy": <original>,
  "lowMidEnergy": <original>,
  "midEnergy": <original>,
  "highMidEnergy": <original>,
  "trebleEnergy": <original>
}`;

const FALLBACK_PRESETS: AIWaveParams[] = [
  {
    lowFreqAmplitude: 0.9,
    midFreqAmplitude: 0.5,
    highFreqAmplitude: 0.2,
    complexity: 0.35,
    density: 0.6,
    dominantBand: "low",
    colorPalette: ["#FF6B35", "#F7931E", "#FFD166", "#06D6A0", "#118AB2"],
    message: "Padrão de graves intensos — estrutura robusta com ondas profundas nas bases.",
  },
  {
    lowFreqAmplitude: 0.35,
    midFreqAmplitude: 0.9,
    highFreqAmplitude: 0.55,
    complexity: 0.6,
    density: 0.7,
    dominantBand: "mid",
    colorPalette: ["#7400B8", "#6930C3", "#5E60CE", "#5390D9", "#4EA8DE"],
    message: "Frequências médias dominantes — padrão equilibrado com elegância na estrutura.",
  },
  {
    lowFreqAmplitude: 0.2,
    midFreqAmplitude: 0.45,
    highFreqAmplitude: 0.9,
    complexity: 0.8,
    density: 0.85,
    dominantBand: "high",
    colorPalette: ["#FFB703", "#FB8500", "#023047", "#219EBC", "#8ECAE6"],
    message: "Agudos vibrantes — detalhes refinados e ondulações delicadas no topo.",
  },
  {
    lowFreqAmplitude: 0.7,
    midFreqAmplitude: 0.65,
    highFreqAmplitude: 0.6,
    complexity: 0.5,
    density: 0.5,
    dominantBand: "mid",
    colorPalette: ["#E63946", "#A8DADC", "#457B9D", "#1D3557", "#F1FAEE"],
    message: "Espectro equilibrado — ondas uniformes por toda a estrutura do móvel.",
  },
];

const ANALYSIS_PROMPT = `You are analyzing a music frequency graph image (waveform, FFT spectrum, or spectrogram).
Extract acoustic characteristics and return ONLY valid JSON, no extra text:
{
  "lowFreqAmplitude": <0.0-1.0: bass/low frequency energy level>,
  "midFreqAmplitude": <0.0-1.0: mid frequency energy level>,
  "highFreqAmplitude": <0.0-1.0: high/treble frequency energy level>,
  "complexity": <0.0-1.0: wave pattern complexity and irregularity>,
  "density": <0.0-1.0: density of frequency peaks>,
  "dominantBand": <"low" or "mid" or "high": which band has most energy>,
  "colorPalette": ["#HEX1","#HEX2","#HEX3","#HEX4","#HEX5"],
  "message": "<one sentence in Portuguese describing how this frequency pattern shapes the furniture waves>"
}`;

const TEXT_ONLY_PROMPT = `Generate creative and varied wave parameters for a music frequency visualization applied to 3D furniture. Return ONLY valid JSON:
{
  "lowFreqAmplitude": <0.0-1.0>,
  "midFreqAmplitude": <0.0-1.0>,
  "highFreqAmplitude": <0.0-1.0>,
  "complexity": <0.0-1.0>,
  "density": <0.0-1.0>,
  "dominantBand": <"low" or "mid" or "high">,
  "colorPalette": ["#HEX1","#HEX2","#HEX3","#HEX4","#HEX5"],
  "message": "<one sentence in Portuguese describing this frequency pattern>"
}`;

function parseWaveParams(text: string): AIWaveParams {
  const jsonMatch = text.match(/\{[\s\S]*?\}/);
  if (!jsonMatch) throw new Error("No JSON in response");
  const raw = JSON.parse(jsonMatch[0]);

  const clamp = (v: unknown) => Math.max(0, Math.min(1, Number(v) || 0.5));
  const clampOptional = (v: unknown) => v !== undefined ? Math.max(0, Math.min(1, Number(v))) : undefined;
  const palette =
    Array.isArray(raw.colorPalette) && raw.colorPalette.length >= 5
      ? (raw.colorPalette as string[]).slice(0, 5)
      : FALLBACK_PRESETS[0].colorPalette;

  return {
    lowFreqAmplitude: clamp(raw.lowFreqAmplitude),
    midFreqAmplitude: clamp(raw.midFreqAmplitude),
    highFreqAmplitude: clamp(raw.highFreqAmplitude),
    complexity: clamp(raw.complexity),
    density: clamp(raw.density),
    dominantBand: (["low", "mid", "high"] as const).includes(raw.dominantBand)
      ? raw.dominantBand
      : "mid",
    colorPalette: palette,
    message:
      typeof raw.message === "string"
        ? raw.message
        : "Padrão de frequência aplicado ao móvel.",
    // Novos campos opcionais
    roughness: clampOptional(raw.roughness),
    brightness: clampOptional(raw.brightness),
    temporalVariance: clampOptional(raw.temporalVariance),
    rhythmicRegularity: clampOptional(raw.rhythmicRegularity),
    subBassEnergy: clampOptional(raw.subBassEnergy),
    bassEnergy: clampOptional(raw.bassEnergy),
    lowMidEnergy: clampOptional(raw.lowMidEnergy),
    midEnergy: clampOptional(raw.midEnergy),
    highMidEnergy: clampOptional(raw.highMidEnergy),
    trebleEnergy: clampOptional(raw.trebleEnergy),
  };
}

// Funcao para analise com parametros do Python
async function tryGroqWithParams(
  imageBase64: string,
  mimeType: string,
  audioParams: Record<string, unknown>
): Promise<AIWaveParams> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("No GROQ_API_KEY");

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_VISION_MODEL,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${imageBase64}` },
            },
            {
              type: "text",
              text: `Audio parameters from Python analysis:\n${JSON.stringify(audioParams, null, 2)}\n\n${ENRICHED_PROMPT}`,
            },
          ],
        },
      ],
      max_tokens: 512,
      temperature: 0.4,
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) throw new Error(`Groq ${res.status}`);
  const data = await res.json();
  return parseWaveParams(data.choices[0].message.content);
}

async function tryGroqVision(
  imageBase64: string,
  mimeType: string
): Promise<AIWaveParams> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("No GROQ_API_KEY");

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_VISION_MODEL,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${imageBase64}` },
            },
            { type: "text", text: ANALYSIS_PROMPT },
          ],
        },
      ],
      max_tokens: 512,
      temperature: 0.2,
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) throw new Error(`Groq ${res.status}`);
  const data = await res.json();
  return parseWaveParams(data.choices[0].message.content);
}

async function tryGeminiVision(
  imageBase64: string,
  mimeType: string
): Promise<AIWaveParams> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("No GEMINI_API_KEY");

  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { inline_data: { mime_type: mimeType, data: imageBase64 } },
            { text: ANALYSIS_PROMPT },
          ],
        },
      ],
      generationConfig: { maxOutputTokens: 512, temperature: 0.2 },
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) throw new Error(`Gemini ${res.status}`);
  const data = await res.json();
  return parseWaveParams(data.candidates[0].content.parts[0].text);
}

async function tryPollinationsText(): Promise<AIWaveParams> {
  const res = await fetch(POLLINATIONS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "openai",
      messages: [{ role: "user", content: TEXT_ONLY_PROMPT }],
      max_tokens: 512,
      temperature: 0.8,
    }),
    signal: AbortSignal.timeout(45_000),
  });

  if (!res.ok) throw new Error(`Pollinations ${res.status}`);
  const data = await res.json();
  return parseWaveParams(data.choices[0].message.content);
}

export async function analyzeFrequencyImage(
  imageBase64: string,
  mimeType: string,
  audioParams?: Record<string, unknown>
): Promise<{ params: AIWaveParams; provider: string }> {
  // Se temos parametros do Python, tenta usar o prompt enriquecido primeiro
  if (audioParams) {
    try {
      const params = await tryGroqWithParams(imageBase64, mimeType, audioParams);
      return { params, provider: "Groq + Python params" };
    } catch {
      /* fallthrough para fluxo normal */
    }
  }

  try {
    const params = await tryGroqVision(imageBase64, mimeType);
    return { params, provider: "Groq Vision" };
  } catch {
    /* fallthrough */
  }

  try {
    const params = await tryGeminiVision(imageBase64, mimeType);
    return { params, provider: "Gemini Flash" };
  } catch {
    /* fallthrough */
  }

  try {
    const params = await tryPollinationsText();
    return { params, provider: "Pollinations" };
  } catch {
    /* fallthrough */
  }

  const preset = FALLBACK_PRESETS[Math.floor(Math.random() * FALLBACK_PRESETS.length)];
  return { params: preset, provider: "preset" };
}
