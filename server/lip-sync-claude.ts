/**
 * ═══════════════════════════════════════════════════════════════════
 * server/lip-sync-claude.ts
 * Sistema de Lip-Sync com Claude para Sincronismo Boca-Palavras
 * Auto-aperfeiçoamento contínuo com IA
 * ═══════════════════════════════════════════════════════════════════
 */

import { invokeLLM } from "./_core/llm";

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export interface Phoneme {
  phoneme: string;
  viseme: number; // 0-8 (8 formas de boca)
  duration: number; // ms
  startTime: number; // ms
  confidence: number; // 0-1
}

export interface LipSyncFrame {
  timestamp: number; // ms
  viseme: number; // 0-8
  mouthOpen: number; // 0-1
  mouthWidth: number; // 0-1
  jawOpen: number; // 0-1
}

export interface LipSyncData {
  text: string;
  language: string;
  phonemes: Phoneme[];
  frames: LipSyncFrame[];
  duration: number;
  quality: number; // 0-100
}

// ─── MAPEAMENTO FONEMA → VISEMA ────────────────────────────────────────────────

const PHONEME_TO_VISEME: Record<string, number> = {
  // Vogais
  "ɑ": 1, "æ": 1, "ɔ": 2, "ə": 0, "ɛ": 3, "i": 4, "ɪ": 4, "o": 2, "ʊ": 2, "u": 5,
  // Consoantes labiais
  "p": 6, "b": 6, "m": 6, "f": 7, "v": 7,
  // Consoantes dentais
  "t": 8, "d": 8, "n": 8, "s": 8, "z": 8,
  // Consoantes velares
  "k": 0, "g": 0, "ŋ": 0,
  // Outros
  "l": 4, "r": 4, "j": 4, "w": 5, "h": 0,
  // Silêncio
  "": 0, " ": 0,
};

// ─── GERAÇÃO DE PHONEMAS COM CLAUDE ────────────────────────────────────────────

export async function generatePhonemes(
  text: string,
  language: string
): Promise<Phoneme[]> {
  // Retornar array vazio se invokeLLM não estiver disponível
  if (!invokeLLM) return [];
  const prompt = `Analise o texto e retorne os fonemas com seus visemas correspondentes.

Texto: "${text}"
Idioma: ${language}

Retorne um JSON com a seguinte estrutura:
{
  "phonemes": [
    {
      "phoneme": "string (ex: 'ɑ', 'p', 'ə')",
      "viseme": number (0-8),
      "duration": number (duração em ms),
      "confidence": number (0-1)
    }
  ]
}

Visemas (formas de boca):
0: Neutro (boca fechada)
1: Vogal aberta (ɑ, æ)
2: Vogal redonda (ɔ, o, ʊ, u)
3: Vogal média (ɛ, e)
4: Vogal fechada (i, ɪ, l, r, j)
5: Vogal redonda fechada (u, w)
6: Labial (p, b, m)
7: Fricativa labial (f, v)
8: Dental (t, d, n, s, z)`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "Você é um especialista em fonética e sincronismo labial (lip-sync). Retorne APENAS JSON válido.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    const contentStr = typeof content === "string" ? content : "{}";
    const jsonMatch = contentStr.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch?.[0] || "{}");

    return parsed.phonemes || [];
  } catch (error) {
    console.error("❌ Erro ao gerar phonemas com Claude:", error);
    return [];
  }
}

// ─── GERAÇÃO DE FRAMES COM CLAUDE ──────────────────────────────────────────────

export async function generateLipSyncFrames(
  phonemes: Phoneme[],
  fps: number = 30
): Promise<LipSyncFrame[]> {
  const frames: LipSyncFrame[] = [];
  const frameDuration = 1000 / fps; // ms por frame

  let currentTime = 0;
  for (const phoneme of phonemes) {
    const startFrame = Math.floor(phoneme.startTime / frameDuration);
    const endFrame = Math.floor((phoneme.startTime + phoneme.duration) / frameDuration);

    for (let i = startFrame; i <= endFrame; i++) {
      const timestamp = i * frameDuration;
      const progress = (timestamp - phoneme.startTime) / phoneme.duration;

      // Suavizar transição entre visemas
      const smoothedViseme = smoothVisemeTransition(
        frames[frames.length - 1]?.viseme || 0,
        phoneme.viseme,
        progress
      );

      frames.push({
        timestamp,
        viseme: Math.round(smoothedViseme),
        mouthOpen: getVisemeMouthOpen(phoneme.viseme),
        mouthWidth: getVisemeMouthWidth(phoneme.viseme),
        jawOpen: getVisemeJawOpen(phoneme.viseme),
      });
    }

    currentTime = phoneme.startTime + phoneme.duration;
  }

  return frames;
}

// ─── AUTO-APERFEIÇOAMENTO COM CLAUDE ──────────────────────────────────────────

export async function improveQuality(
  data: LipSyncData,
  feedback: string
): Promise<LipSyncData> {
  // Retornar dados originais se invokeLLM não estiver disponível
  if (!invokeLLM) return data;
  const prompt = `Melhore o sincronismo labial (lip-sync) com base no feedback.

Dados atuais:
- Texto: "${data.text}"
- Idioma: ${data.language}
- Qualidade: ${data.quality}/100
- Duração: ${data.duration}ms
- Número de frames: ${data.frames.length}

Feedback: ${feedback}

Retorne um JSON com melhorias:
{
  "improvements": [
    {
      "frameIndex": number,
      "viseme": number (0-8),
      "mouthOpen": number (0-1),
      "mouthWidth": number (0-1),
      "jawOpen": number (0-1),
      "reason": "string"
    }
  ],
  "qualityScore": number (0-100),
  "suggestions": ["string"]
}`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "Você é um especialista em sincronismo labial. Analise e melhore a qualidade do lip-sync.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    const contentStr = typeof content === "string" ? content : "{}";
    const jsonMatch = contentStr.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch?.[0] || "{}");

    // Aplicar melhorias
    const improvedFrames = [...data.frames];
    for (const improvement of parsed.improvements || []) {
      if (improvedFrames[improvement.frameIndex]) {
        improvedFrames[improvement.frameIndex] = {
          ...improvedFrames[improvement.frameIndex],
          viseme: improvement.viseme,
          mouthOpen: improvement.mouthOpen,
          mouthWidth: improvement.mouthWidth,
          jawOpen: improvement.jawOpen,
        };
      }
    }

    return {
      ...data,
      frames: improvedFrames,
      quality: parsed.qualityScore || data.quality,
    };
  } catch (error) {
    console.error("❌ Erro ao melhorar qualidade com Claude:", error);
    return data;
  }
}

// ─── UTILITÁRIOS ──────────────────────────────────────────────────────────────

function smoothVisemeTransition(from: number, to: number, progress: number): number {
  // Interpolação suave entre visemas
  return from + (to - from) * easeInOutQuad(progress);
}

function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function getVisemeMouthOpen(viseme: number): number {
  const mouthOpenMap: Record<number, number> = {
    0: 0.0,   // Neutro
    1: 0.9,   // Vogal aberta
    2: 0.7,   // Vogal redonda
    3: 0.5,   // Vogal média
    4: 0.3,   // Vogal fechada
    5: 0.4,   // Vogal redonda fechada
    6: 0.1,   // Labial
    7: 0.2,   // Fricativa labial
    8: 0.3,   // Dental
  };
  return mouthOpenMap[viseme] || 0;
}

function getVisemeMouthWidth(viseme: number): number {
  const mouthWidthMap: Record<number, number> = {
    0: 0.0,   // Neutro
    1: 0.6,   // Vogal aberta
    2: 0.3,   // Vogal redonda
    3: 0.7,   // Vogal média
    4: 0.8,   // Vogal fechada
    5: 0.2,   // Vogal redonda fechada
    6: 0.4,   // Labial
    7: 0.5,   // Fricativa labial
    8: 0.6,   // Dental
  };
  return mouthWidthMap[viseme] || 0;
}

function getVisemeJawOpen(viseme: number): number {
  const jawOpenMap: Record<number, number> = {
    0: 0.0,   // Neutro
    1: 0.8,   // Vogal aberta
    2: 0.5,   // Vogal redonda
    3: 0.4,   // Vogal média
    4: 0.2,   // Vogal fechada
    5: 0.3,   // Vogal redonda fechada
    6: 0.1,   // Labial
    7: 0.2,   // Fricativa labial
    8: 0.3,   // Dental
  };
  return jawOpenMap[viseme] || 0;
}

// ─── ROUTER TRPC ──────────────────────────────────────────────────────────────

export const lipSyncRouter = {
  generatePhonemes: async (text: string, language: string): Promise<Phoneme[]> => {
    return generatePhonemes(text, language);
  },

  generateFrames: async (phonemes: Phoneme[], fps?: number): Promise<LipSyncFrame[]> => {
    return generateLipSyncFrames(phonemes, fps);
  },

  improve: async (data: LipSyncData, feedback: string): Promise<LipSyncData> => {
    return improveQuality(data, feedback);
  },

  generateComplete: async (text: string, language: string): Promise<LipSyncData> => {
    const phonemes = await generatePhonemes(text, language);
    const frames = await generateLipSyncFrames(phonemes);

    return {
      text,
      language,
      phonemes,
      frames,
      duration: frames[frames.length - 1]?.timestamp || 0,
      quality: 75, // Qualidade inicial
    };
  },
};
