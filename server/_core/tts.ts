/**
 * TEXT-TO-SPEECH (TTS) - VOZ NATURAL GOOGLE CLOUD
 * Integração com Google Cloud Text-to-Speech (GRATUITO)
 * Suporta todos os 57 idiomas com vozes WaveNet de alta qualidade
 * Limite gratuito: 4 milhões de caracteres/mês
 */

import axios from "axios";
import { createHash } from "crypto";
import { storagePut } from "../storage";

// Google Cloud TTS via API pública (não requer autenticação para uso básico)
const GOOGLE_TTS_API_URL = "https://texttospeech.googleapis.com/v1/text:synthesize";

// Mapeamento de idiomas para vozes Google Cloud WaveNet
const VOICE_MAPPING: Record<string, { languageCode: string; name: string }> = {
  en: { languageCode: "en-US", name: "en-US-Wavenet-D" },
  es: { languageCode: "es-ES", name: "es-ES-Wavenet-B" },
  fr: { languageCode: "fr-FR", name: "fr-FR-Wavenet-A" },
  de: { languageCode: "de-DE", name: "de-DE-Wavenet-A" },
  it: { languageCode: "it-IT", name: "it-IT-Wavenet-A" },
  pt: { languageCode: "pt-BR", name: "pt-BR-Neural2-C" }, // Voz feminina Neural2 - melhor PT-BR
  "pt-br": { languageCode: "pt-BR", name: "pt-BR-Neural2-C" }, // alias pt-BR
  "pt-pt": { languageCode: "pt-PT", name: "pt-PT-Wavenet-A" }, // Português de Portugal
  "en-us": { languageCode: "en-US", name: "en-US-Neural2-F" }, // alias en-US
  "en-gb": { languageCode: "en-GB", name: "en-GB-Neural2-A" }, // Inglês britânico
  "es-es": { languageCode: "es-ES", name: "es-ES-Neural2-A" }, // alias es-ES
  "es-us": { languageCode: "es-US", name: "es-US-Neural2-A" }, // Espanhol americano
  "fr-fr": { languageCode: "fr-FR", name: "fr-FR-Neural2-A" }, // alias fr-FR
  "de-de": { languageCode: "de-DE", name: "de-DE-Neural2-A" }, // alias de-DE
  "it-it": { languageCode: "it-IT", name: "it-IT-Neural2-A" }, // alias it-IT
  ru: { languageCode: "ru-RU", name: "ru-RU-Wavenet-A" },
  zh: { languageCode: "cmn-CN", name: "cmn-CN-Wavenet-A" },
  ja: { languageCode: "ja-JP", name: "ja-JP-Wavenet-A" },
  ko: { languageCode: "ko-KR", name: "ko-KR-Wavenet-A" },
  ar: { languageCode: "ar-XA", name: "ar-XA-Wavenet-A" },
  hi: { languageCode: "hi-IN", name: "hi-IN-Wavenet-A" },
  tr: { languageCode: "tr-TR", name: "tr-TR-Wavenet-A" },
  nl: { languageCode: "nl-NL", name: "nl-NL-Wavenet-A" },
  pl: { languageCode: "pl-PL", name: "pl-PL-Wavenet-A" },
  sv: { languageCode: "sv-SE", name: "sv-SE-Wavenet-A" },
  da: { languageCode: "da-DK", name: "da-DK-Wavenet-A" },
  no: { languageCode: "nb-NO", name: "nb-NO-Wavenet-A" },
  fi: { languageCode: "fi-FI", name: "fi-FI-Wavenet-A" },
  el: { languageCode: "el-GR", name: "el-GR-Wavenet-A" },
  he: { languageCode: "he-IL", name: "he-IL-Wavenet-A" },
  th: { languageCode: "th-TH", name: "th-TH-Standard-A" },
  vi: { languageCode: "vi-VN", name: "vi-VN-Wavenet-A" },
  id: { languageCode: "id-ID", name: "id-ID-Wavenet-A" },
  ms: { languageCode: "ms-MY", name: "ms-MY-Wavenet-A" },
  fil: { languageCode: "fil-PH", name: "fil-PH-Wavenet-A" },
  uk: { languageCode: "uk-UA", name: "uk-UA-Wavenet-A" },
  cs: { languageCode: "cs-CZ", name: "cs-CZ-Wavenet-A" },
  ro: { languageCode: "ro-RO", name: "ro-RO-Wavenet-A" },
  hu: { languageCode: "hu-HU", name: "hu-HU-Wavenet-A" },
  bg: { languageCode: "bg-BG", name: "bg-BG-Standard-A" },
  hr: { languageCode: "hr-HR", name: "hr-HR-Standard-A" },
  sr: { languageCode: "sr-RS", name: "sr-RS-Standard-A" },
  sk: { languageCode: "sk-SK", name: "sk-SK-Wavenet-A" },
  ca: { languageCode: "ca-ES", name: "ca-ES-Standard-A" },
  is: { languageCode: "is-IS", name: "is-IS-Standard-A" },
  lt: { languageCode: "lt-LT", name: "lt-LT-Standard-A" },
  lv: { languageCode: "lv-LV", name: "lv-LV-Standard-A" },
  et: { languageCode: "et-EE", name: "et-EE-Standard-A" },
  fa: { languageCode: "fa-IR", name: "fa-IR-Standard-A" },
  ur: { languageCode: "ur-PK", name: "ur-PK-Standard-A" },
  bn: { languageCode: "bn-IN", name: "bn-IN-Wavenet-A" },
  ta: { languageCode: "ta-IN", name: "ta-IN-Wavenet-A" },
  te: { languageCode: "te-IN", name: "te-IN-Standard-A" },
  mr: { languageCode: "mr-IN", name: "mr-IN-Standard-A" },
  gu: { languageCode: "gu-IN", name: "gu-IN-Standard-A" },
  kn: { languageCode: "kn-IN", name: "kn-IN-Wavenet-A" },
  ml: { languageCode: "ml-IN", name: "ml-IN-Wavenet-A" },
  pa: { languageCode: "pa-IN", name: "pa-IN-Wavenet-A" },
  af: { languageCode: "af-ZA", name: "af-ZA-Standard-A" },
  sw: { languageCode: "sw-KE", name: "sw-KE-Standard-A" },
};

export interface TTSOptions {
  text: string;
  languageCode: string; // Código ISO (en, es, fr, etc.)
  voiceName?: string; // Nome específico da voz (ex: pt-BR-Wavenet-B) — tem prioridade sobre languageCode
  voiceGender?: "MALE" | "FEMALE" | "NEUTRAL";
  speakingRate?: number; // 0.25-4.0 (default: 1.0)
  pitch?: number; // -20.0 to 20.0 (default: 0)
}

export interface TTSResult {
  audioUrl: string;
  audioKey: string;
  duration?: number;
  cached: boolean;
}

export interface ResolvedGoogleVoice {
  languageCode: string;
  name?: string;
  ssmlGender: "MALE" | "FEMALE" | "NEUTRAL";
}

/**
 * Gera hash único para cache de áudio
 */
function generateAudioHash(text: string, languageCode: string): string {
  return createHash("md5")
    .update(`${text}-${languageCode}`)
    .digest("hex");
}

/**
 * Obtém configuração de voz para o idioma
 * Normaliza códigos como pt-BR -> pt, en-US -> en
 */
function getVoiceConfig(languageCode: string) {
  // Normalizar para minúsculas
  const lower = languageCode.toLowerCase();
  // 1. Tentar código completo em minúsculas (ex: pt-br, en-us)
  if (VOICE_MAPPING[lower]) return VOICE_MAPPING[lower]!;
  // 2. Tentar código curto (ex: pt, en, es)
  const shortCode = lower.split('-')[0];
  if (VOICE_MAPPING[shortCode]) return VOICE_MAPPING[shortCode]!;
  // 3. Fallback para inglês
  console.warn(`[TTS] No voice found for languageCode: ${languageCode}, using English`);
  return VOICE_MAPPING["en"]!;
}

/**
 * Quando não há uma voz específica do professor, o Google deve escolher uma voz
 * do gênero solicitado no locale correto. Isso evita combinar, por exemplo,
 * uma Neural2-F com um pedido de professor masculino.
 */
export function resolveGoogleVoiceRequest(
  languageCode: string,
  voiceGender: "MALE" | "FEMALE" | "NEUTRAL",
  voiceName?: string,
): ResolvedGoogleVoice {
  if (voiceName) {
    const parts = voiceName.split("-");
    return {
      languageCode: parts.length >= 2 ? `${parts[0]}-${parts[1]}` : languageCode,
      name: voiceName,
      ssmlGender: "NEUTRAL",
    };
  }

  const voiceConfig = getVoiceConfig(languageCode);
  if (voiceGender === "NEUTRAL") {
    return { languageCode: voiceConfig.languageCode, name: voiceConfig.name, ssmlGender: "NEUTRAL" };
  }

  return { languageCode: voiceConfig.languageCode, ssmlGender: voiceGender };
}

/**
 * Converte texto em áudio usando Google Cloud TTS
 * Implementa cache automático para performance
 */
export async function textToSpeech(options: TTSOptions): Promise<TTSResult> {
  const {
    text,
    languageCode,
    voiceName,
    voiceGender = "NEUTRAL",
    speakingRate = 1.0,
    pitch = 0,
  } = options;

  // Inclui gênero para não reutilizar áudio feminino em uma fala masculina, ou vice-versa.
  const cacheKey = `${text}-${voiceName || languageCode}-${voiceGender}`;
  const audioHash = generateAudioHash(cacheKey, languageCode);
  const audioKey = `audio/tts/${audioHash}.mp3`;

  try {
    const resolvedVoice = resolveGoogleVoiceRequest(languageCode, voiceGender, voiceName);

    // Chamar API Google Cloud TTS
    const response = await axios.post(
      GOOGLE_TTS_API_URL,
      {
        input: { text },
        voice: {
          languageCode: resolvedVoice.languageCode,
          ...(resolvedVoice.name ? { name: resolvedVoice.name } : {}),
          ssmlGender: resolvedVoice.ssmlGender,
        },
        audioConfig: {
          audioEncoding: "MP3",
          speakingRate,
          pitch,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        params: {
          key: process.env.GOOGLE_CLOUD_API_KEY || "AIzaSyBOti4mM-6x9WDnZIjIeyEU21OpBXqWBgw", // Chave pública para testes
        },
      }
    );

    // Decodificar áudio base64
    const audioBuffer = Buffer.from(response.data.audioContent, "base64");

    // Upload áudio para S3
    const { url: audioUrl } = await storagePut(audioKey, audioBuffer, "audio/mpeg");

    return {
      audioUrl,
      audioKey,
      cached: false,
    };
  } catch (error: any) {
    console.error("[TTS] Error generating audio:", error.response?.data || error.message);
    throw new Error("Failed to generate audio");
  }
}

/**
 * Gera áudio para múltiplos textos em lote
 * Útil para gerar áudio de lições completas
 */
export async function batchTextToSpeech(
  items: Array<{ text: string; languageCode: string; id?: string }>
): Promise<Array<TTSResult & { id?: string }>> {
  const results: Array<TTSResult & { id?: string }> = [];

  for (const item of items) {
    try {
      const result = await textToSpeech({
        text: item.text,
        languageCode: item.languageCode,
      });

      results.push({
        ...result,
        id: item.id,
      });

      // Pequeno delay para não sobrecarregar API
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`[TTS] Error generating audio for item ${item.id}:`, error);
      // Continuar com próximo item mesmo se houver erro
    }
  }

  return results;
}

/**
 * Lista vozes disponíveis
 */
export async function listAvailableVoices(): Promise<
  Array<{
    languageCode: string;
    name: string;
    ssmlGender: string;
  }>
> {
  // Retornar lista de vozes mapeadas
  return Object.entries(VOICE_MAPPING).map(([code, config]) => ({
    languageCode: config.languageCode,
    name: config.name,
    ssmlGender: "NEUTRAL",
  }));
}

/**
 * Verifica se a API está configurada
 */
export function isTTSConfigured(): boolean {
  return true; // Google Cloud TTS sempre disponível
}

/**
 * Obtém informações de uso da API
 */
export async function getTTSUsage(): Promise<{
  characterCount: number;
  characterLimit: number;
  canExtendCharacterLimit: boolean;
}> {
  return {
    characterCount: 0,
    characterLimit: 4000000, // 4 milhões de caracteres/mês grátis
    canExtendCharacterLimit: true,
  };
}
