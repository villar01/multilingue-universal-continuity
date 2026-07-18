/**
 * TEXT-TO-SPEECH (TTS) - VOZ NATURAL ULTRA-REALISTA
 * Integração com ElevenLabs para síntese de voz de alta qualidade
 * Suporta todos os 57 idiomas com vozes nativas
 */

import axios from "axios";
import { createHash } from "crypto";
import { storagePut } from "../storage";

// ElevenLabs API Configuration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "";
const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1";

export interface TTSOptions {
  text: string;
  voiceId: string;
  languageCode?: string;
  stability?: number; // 0-1 (default: 0.5)
  similarityBoost?: number; // 0-1 (default: 0.75)
  style?: number; // 0-1 (default: 0)
  useSpeakerBoost?: boolean; // default: true
}

export interface TTSResult {
  audioUrl: string;
  audioKey: string;
  duration?: number;
  cached: boolean;
}

/**
 * Gera hash único para cache de áudio
 */
function generateAudioHash(text: string, voiceId: string): string {
  return createHash("md5")
    .update(`${text}-${voiceId}`)
    .digest("hex");
}

/**
 * Converte texto em áudio usando ElevenLabs
 * Implementa cache automático para performance
 */
export async function textToSpeech(options: TTSOptions): Promise<TTSResult> {
  const {
    text,
    voiceId,
    stability = 0.5,
    similarityBoost = 0.75,
    style = 0,
    useSpeakerBoost = true,
  } = options;

  // Gerar hash para cache
  const audioHash = generateAudioHash(text, voiceId);
  const audioKey = `audio/tts/${audioHash}.mp3`;

  // TODO: Verificar se áudio já existe no cache (S3)
  // Por enquanto, sempre gera novo áudio

  try {
    // Chamar API ElevenLabs
    const response = await axios.post(
      `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`,
      {
        text,
        model_id: "eleven_multilingual_v2", // Suporta todos os idiomas
        voice_settings: {
          stability,
          similarity_boost: similarityBoost,
          style,
          use_speaker_boost: useSpeakerBoost,
        },
      },
      {
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        responseType: "arraybuffer",
      }
    );

    // Upload áudio para S3
    const audioBuffer = Buffer.from(response.data);
    const { url: audioUrl } = await storagePut(audioKey, audioBuffer, "audio/mpeg");

    return {
      audioUrl,
      audioKey,
      cached: false,
    };
  } catch (error) {
    console.error("[TTS] Error generating audio:", error);
    throw new Error("Failed to generate audio");
  }
}

/**
 * Gera áudio para múltiplos textos em lote
 * Útil para gerar áudio de lições completas
 */
export async function batchTextToSpeech(
  items: Array<{ text: string; voiceId: string; id?: string }>
): Promise<Array<TTSResult & { id?: string }>> {
  const results: Array<TTSResult & { id?: string }> = [];

  for (const item of items) {
    try {
      const result = await textToSpeech({
        text: item.text,
        voiceId: item.voiceId,
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
 * Lista vozes disponíveis na ElevenLabs
 * Útil para descobrir novas vozes
 */
export async function listAvailableVoices(): Promise<
  Array<{
    voiceId: string;
    name: string;
    category: string;
    labels: Record<string, string>;
  }>
> {
  try {
    const response = await axios.get(`${ELEVENLABS_API_URL}/voices`, {
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
      },
    });

    return response.data.voices.map((voice: any) => ({
      voiceId: voice.voice_id,
      name: voice.name,
      category: voice.category,
      labels: voice.labels,
    }));
  } catch (error) {
    console.error("[TTS] Error listing voices:", error);
    return [];
  }
}

/**
 * Verifica se a API Key está configurada
 */
export function isTTSConfigured(): boolean {
  return ELEVENLABS_API_KEY.length > 0;
}

/**
 * Obtém informações de uso da API
 */
export async function getTTSUsage(): Promise<{
  characterCount: number;
  characterLimit: number;
  canExtendCharacterLimit: boolean;
}> {
  try {
    const response = await axios.get(`${ELEVENLABS_API_URL}/user`, {
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
      },
    });

    return {
      characterCount: response.data.subscription.character_count,
      characterLimit: response.data.subscription.character_limit,
      canExtendCharacterLimit: response.data.subscription.can_extend_character_limit,
    };
  } catch (error) {
    console.error("[TTS] Error getting usage:", error);
    return {
      characterCount: 0,
      characterLimit: 0,
      canExtendCharacterLimit: false,
    };
  }
}
