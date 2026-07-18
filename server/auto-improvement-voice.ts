/**
 * ═══════════════════════════════════════════════════════════════════
 * server/auto-improvement-voice.ts
 * Sistema de Auto-Aperfeiçoamento Contínuo para Voz e Lip-Sync
 * Análise com Claude, otimização automática
 * ═══════════════════════════════════════════════════════════════════
 */

import { invokeLLM } from "./_core/llm";

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export interface VoiceQualityMetrics {
  naturalness: number; // 0-100
  clarity: number; // 0-100
  accentAccuracy: number; // 0-100
  emotionExpression: number; // 0-100
  lipSyncAccuracy: number; // 0-100
  overallQuality: number; // 0-100
}

export interface VoiceImprovementSuggestion {
  category: "naturalness" | "clarity" | "accent" | "emotion" | "lipSync";
  issue: string;
  suggestion: string;
  priority: "low" | "medium" | "high";
  expectedImprovement: number; // 0-100
}

export interface VoiceOptimization {
  speed: number; // 0.5-2.0
  pitch: number; // 0.5-2.0
  emotionIntensity: number; // 0-1
  accentStrength: number; // 0-1
  lipSyncSensitivity: number; // 0-1
}

// ─── ANÁLISE DE QUALIDADE ─────────────────────────────────────────────────────

export async function analyzeVoiceQuality(
  text: string,
  language: string,
  audioUrl: string,
  userFeedback?: string
): Promise<VoiceQualityMetrics> {
  const prompt = `Analise a qualidade da voz sintetizada para o seguinte texto:

Texto: "${text}"
Idioma: ${language}
URL do Áudio: ${audioUrl}
${userFeedback ? `Feedback do Usuário: ${userFeedback}` : ""}

Avalie os seguintes aspectos em uma escala de 0-100:
1. Naturalness (Naturalidade): Quão natural e humana é a voz?
2. Clarity (Clareza): Quão clara e compreensível é a pronúncia?
3. Accent Accuracy (Precisão do Sotaque): Quão correto é o sotaque para o idioma?
4. Emotion Expression (Expressão Emocional): Quão bem a voz expressa emoções?
5. Lip-Sync Accuracy (Precisão do Lip-Sync): Quão bem a boca sincroniza com as palavras?

Retorne um JSON com a seguinte estrutura:
{
  "naturalness": number,
  "clarity": number,
  "accentAccuracy": number,
  "emotionExpression": number,
  "lipSyncAccuracy": number,
  "analysis": "string (análise detalhada)"
}`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "Você é um especialista em síntese de voz e análise de qualidade de áudio. Retorne APENAS JSON válido.",
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

    const overallQuality = Math.round(
      (parsed.naturalness +
        parsed.clarity +
        parsed.accentAccuracy +
        parsed.emotionExpression +
        parsed.lipSyncAccuracy) /
        5
    );

    return {
      naturalness: parsed.naturalness || 0,
      clarity: parsed.clarity || 0,
      accentAccuracy: parsed.accentAccuracy || 0,
      emotionExpression: parsed.emotionExpression || 0,
      lipSyncAccuracy: parsed.lipSyncAccuracy || 0,
      overallQuality,
    };
  } catch (error) {
    console.error("❌ Erro ao analisar qualidade de voz:", error);
    return {
      naturalness: 0,
      clarity: 0,
      accentAccuracy: 0,
      emotionExpression: 0,
      lipSyncAccuracy: 0,
      overallQuality: 0,
    };
  }
}

// ─── GERAR SUGESTÕES DE MELHORIA ──────────────────────────────────────────────

export async function generateImprovementSuggestions(
  metrics: VoiceQualityMetrics,
  language: string,
  previousSuggestions?: VoiceImprovementSuggestion[]
): Promise<VoiceImprovementSuggestion[]> {
  const prompt = `Com base nas métricas de qualidade de voz, gere sugestões de melhoria:

Métricas Atuais:
- Naturalness: ${metrics.naturalness}/100
- Clarity: ${metrics.clarity}/100
- Accent Accuracy: ${metrics.accentAccuracy}/100
- Emotion Expression: ${metrics.emotionExpression}/100
- Lip-Sync Accuracy: ${metrics.lipSyncAccuracy}/100
- Overall Quality: ${metrics.overallQuality}/100

Idioma: ${language}

${previousSuggestions ? `Sugestões Anteriores Implementadas: ${JSON.stringify(previousSuggestions)}` : ""}

Retorne um JSON com a seguinte estrutura:
{
  "suggestions": [
    {
      "category": "naturalness|clarity|accent|emotion|lipSync",
      "issue": "string (descrição do problema)",
      "suggestion": "string (sugestão de melhoria)",
      "priority": "low|medium|high",
      "expectedImprovement": number (0-100)
    }
  ]
}`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "Você é um especialista em otimização de síntese de voz. Retorne APENAS JSON válido.",
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

    return parsed.suggestions || [];
  } catch (error) {
    console.error("❌ Erro ao gerar sugestões de melhoria:", error);
    return [];
  }
}

// ─── OTIMIZAR PARÂMETROS ──────────────────────────────────────────────────────

export async function optimizeVoiceParameters(
  metrics: VoiceQualityMetrics,
  currentOptimization: VoiceOptimization,
  language: string
): Promise<VoiceOptimization> {
  const prompt = `Otimize os parâmetros de síntese de voz com base nas métricas:

Métricas Atuais:
- Naturalness: ${metrics.naturalness}/100
- Clarity: ${metrics.clarity}/100
- Accent Accuracy: ${metrics.accentAccuracy}/100
- Emotion Expression: ${metrics.emotionExpression}/100
- Lip-Sync Accuracy: ${metrics.lipSyncAccuracy}/100

Parâmetros Atuais:
- Speed: ${currentOptimization.speed}
- Pitch: ${currentOptimization.pitch}
- Emotion Intensity: ${currentOptimization.emotionIntensity}
- Accent Strength: ${currentOptimization.accentStrength}
- Lip-Sync Sensitivity: ${currentOptimization.lipSyncSensitivity}

Idioma: ${language}

Retorne um JSON com parâmetros otimizados:
{
  "speed": number (0.5-2.0),
  "pitch": number (0.5-2.0),
  "emotionIntensity": number (0-1),
  "accentStrength": number (0-1),
  "lipSyncSensitivity": number (0-1),
  "reasoning": "string (explicação das mudanças)"
}`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "Você é um especialista em otimização de síntese de voz. Retorne APENAS JSON válido.",
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

    return {
      speed: Math.max(0.5, Math.min(2.0, parsed.speed || currentOptimization.speed)),
      pitch: Math.max(0.5, Math.min(2.0, parsed.pitch || currentOptimization.pitch)),
      emotionIntensity: Math.max(0, Math.min(1, parsed.emotionIntensity || currentOptimization.emotionIntensity)),
      accentStrength: Math.max(0, Math.min(1, parsed.accentStrength || currentOptimization.accentStrength)),
      lipSyncSensitivity: Math.max(0, Math.min(1, parsed.lipSyncSensitivity || currentOptimization.lipSyncSensitivity)),
    };
  } catch (error) {
    console.error("❌ Erro ao otimizar parâmetros:", error);
    return currentOptimization;
  }
}

// ─── CICLO CONTÍNUO DE MELHORIA ───────────────────────────────────────────────

export async function continuousImprovementCycle(
  text: string,
  language: string,
  audioUrl: string,
  userFeedback?: string,
  maxIterations: number = 3
): Promise<{
  finalMetrics: VoiceQualityMetrics;
  improvements: VoiceImprovementSuggestion[];
  optimization: VoiceOptimization;
  iterations: number;
}> {
  let currentMetrics: VoiceQualityMetrics | null = null;
  let currentOptimization: VoiceOptimization = {
    speed: 1.0,
    pitch: 1.0,
    emotionIntensity: 0.5,
    accentStrength: 1.0,
    lipSyncSensitivity: 1.0,
  };
  let allSuggestions: VoiceImprovementSuggestion[] = [];
  let iteration = 0;

  for (iteration = 0; iteration < maxIterations; iteration++) {
    console.log(`🔄 Iteração ${iteration + 1}/${maxIterations}`);

    // Analisar qualidade
    currentMetrics = await analyzeVoiceQuality(text, language, audioUrl, userFeedback);
    console.log(`📊 Qualidade: ${currentMetrics.overallQuality}/100`);

    // Se qualidade está boa, parar
    if (currentMetrics.overallQuality >= 85) {
      console.log("✅ Qualidade excelente atingida!");
      break;
    }

    // Gerar sugestões
    const suggestions = await generateImprovementSuggestions(currentMetrics, language, allSuggestions);
    allSuggestions = [...allSuggestions, ...suggestions];

    // Otimizar parâmetros
    currentOptimization = await optimizeVoiceParameters(currentMetrics, currentOptimization, language);
  }

  return {
    finalMetrics: currentMetrics || {
      naturalness: 0,
      clarity: 0,
      accentAccuracy: 0,
      emotionExpression: 0,
      lipSyncAccuracy: 0,
      overallQuality: 0,
    },
    improvements: allSuggestions,
    optimization: currentOptimization,
    iterations: iteration + 1,
  };
}

// ─── ROUTER TRPC ──────────────────────────────────────────────────────────────

export const voiceAutoImprovementRouter = {
  analyze: async (
    text: string,
    language: string,
    audioUrl: string,
    userFeedback?: string
  ): Promise<VoiceQualityMetrics> => {
    return analyzeVoiceQuality(text, language, audioUrl, userFeedback);
  },

  generateSuggestions: async (
    metrics: VoiceQualityMetrics,
    language: string
  ): Promise<VoiceImprovementSuggestion[]> => {
    return generateImprovementSuggestions(metrics, language);
  },

  optimize: async (
    metrics: VoiceQualityMetrics,
    currentOptimization: VoiceOptimization,
    language: string
  ): Promise<VoiceOptimization> => {
    return optimizeVoiceParameters(metrics, currentOptimization, language);
  },

  continuousImprovement: async (
    text: string,
    language: string,
    audioUrl: string,
    userFeedback?: string
  ) => {
    return continuousImprovementCycle(text, language, audioUrl, userFeedback);
  },
};
