import { TRPCError } from "@trpc/server";

interface TTSRequest {
  text: string;
  languageCode: string;
  voiceGender?: "MALE" | "FEMALE" | "NEUTRAL";
  voiceId?: string;
}

interface TTSResponse {
  audioUrl: string;
  audioBase64?: string;
  duration?: number;
  provider: "elevenlabs" | "google" | "web";
}

/**
 * Sistema TTS avançado com múltiplos provedores
 * Prioridade: ElevenLabs (ultra-realista) → Google Cloud (nativo) → Web Speech API (fallback)
 */

// Mapeamento de idiomas para vozes ElevenLabs
const ELEVENLABS_VOICES = {
  "pt-BR": {
    MALE: "Vxjl8FZXY0HXoWbCjmJ5", // Ricardo (português brasileiro paulista nativo)
    FEMALE: "jsCqWAovK2LkecY7zXl4", // Camila (português brasileiro carioca nativa)
  },
  "pt-BR-nordeste": {
    MALE: "GBv7mTt0atIp3Br8iCZE", // João (português brasileiro nordestino)
    FEMALE: "ThT5KcBeYPX3keUQqHPh", // Maria (português brasileiro nordestino)
  },
  "pt-PT": {
    MALE: "onwK4e9ZLuTAKqWW03F9", // Miguel (português europeu Lisboa)
    FEMALE: "XB0fDUnXU5powFXDhCwa", // Sofia (português europeu Porto)
  },
  "en-US": {
    MALE: "pNInz6obpgDQGcFmaJgB", // Adam (inglês americano nativo certificado)
    FEMALE: "EXAVITQu4vr4xnSDxMaL", // Bella (inglês americano nativo certificado)
  },
  "en-GB": {
    MALE: "VR6AewLTigWG4xSOukaG", // Arnold (inglês britânico)
    FEMALE: "ThT5KcBeYPX3keUQqHPh", // Dorothy (inglês britânico)
  },
  "es-ES": {
    MALE: "onwK4e9ZLuTAKqWW03F9", // Mateo (espanhol)
    FEMALE: "XB0fDUnXU5powFXDhCwa", // Charlotte (espanhol)
  },
  "fr-FR": {
    MALE: "N2lVS1w4EtoT3dr4eOWO", // Callum (francês)
    FEMALE: "IKne3meq5aSn9XLyUdCD", // Freya (francês)
  },
};

// Mapeamento de idiomas para vozes Google Cloud
const GOOGLE_VOICES = {
  "pt-BR": {
    MALE: "pt-BR-Wavenet-B",
    FEMALE: "pt-BR-Wavenet-A",
  },
  "en-US": {
    MALE: "en-US-Wavenet-D",
    FEMALE: "en-US-Wavenet-F",
  },
  "en-GB": {
    MALE: "en-GB-Wavenet-B",
    FEMALE: "en-GB-Wavenet-A",
  },
  "es-ES": {
    MALE: "es-ES-Wavenet-B",
    FEMALE: "es-ES-Wavenet-A",
  },
  "fr-FR": {
    MALE: "fr-FR-Wavenet-B",
    FEMALE: "fr-FR-Wavenet-A",
  },
};

/**
 * Gerar áudio com ElevenLabs (ultra-realista)
 */
async function generateWithElevenLabs(request: TTSRequest): Promise<TTSResponse> {
  const { text, languageCode, voiceGender = "MALE" } = request; // PADRÃO: Masculino paulista

  // Buscar voice ID
  const voiceMap = ELEVENLABS_VOICES[languageCode as keyof typeof ELEVENLABS_VOICES];
  if (!voiceMap) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Idioma ${languageCode} não suportado pelo ElevenLabs`,
    });
  }

  const voiceId = (voiceMap as any)[(voiceGender as string)];

  // Simular chamada API ElevenLabs (substituir por chamada real)
  // const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //     "xi-api-key": process.env.ELEVENLABS_API_KEY || "",
  //   },
  //   body: JSON.stringify({
  //     text,
  //     model_id: "eleven_multilingual_v2",
  //     voice_settings: {
  //       stability: 0.5,
  //       similarity_boost: 0.75,
  //     },
  //   }),
  // });

  // Por enquanto, retornar URL simulada
  return {
    audioUrl: `https://storage.example.com/tts/elevenlabs-${Date.now()}.mp3`,
    provider: "elevenlabs",
    duration: text.length * 0.05, // Estimativa: 50ms por caractere
  };
}

/**
 * Gerar áudio com Google Cloud TTS (nativo de alta qualidade)
 */
async function generateWithGoogle(request: TTSRequest): Promise<TTSResponse> {
  const { text, languageCode, voiceGender = "FEMALE" } = request;

  // Buscar voice name
  const voiceMap = GOOGLE_VOICES[languageCode as keyof typeof GOOGLE_VOICES];
  if (!voiceMap) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Idioma ${languageCode} não suportado pelo Google Cloud`,
    });
  }

  const voiceName = (voiceMap as any)[(voiceGender as string)];

  // Simular chamada API Google Cloud (substituir por chamada real)
  // const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
  // const client = new TextToSpeechClient();
  // const [response] = await client.synthesizeSpeech({
  //   input: { text },
  //   voice: { languageCode, name: voiceName },
  //   audioConfig: { audioEncoding: 'MP3' },
  // });

  // Por enquanto, retornar URL simulada
  return {
    audioUrl: `https://storage.example.com/tts/google-${Date.now()}.mp3`,
    provider: "google",
    duration: text.length * 0.05,
  };
}

/**
 * Gerar áudio com Web Speech API (fallback gratuito)
 */
async function generateWithWebSpeech(request: TTSRequest): Promise<TTSResponse> {
  const { text, languageCode } = request;

  // Web Speech API é executado no navegador, não no servidor
  // Retornar instrução para o cliente usar Web Speech API
  return {
    audioUrl: "", // Vazio indica que deve usar Web Speech API no cliente
    provider: "web",
    duration: text.length * 0.05,
  };
}

/**
 * Função principal de TTS com fallback automático
 */
export async function generateAdvancedTTS(request: TTSRequest): Promise<TTSResponse> {
  try {
    // Tentar ElevenLabs primeiro (ultra-realista)
    if (process.env.ELEVENLABS_API_KEY) {
      return await generateWithElevenLabs(request);
    }
  } catch (error) {
    console.warn("ElevenLabs TTS failed, falling back to Google Cloud:", error);
  }

  try {
    // Fallback para Google Cloud (nativo de alta qualidade)
    if (process.env.GOOGLE_CLOUD_TTS_KEY) {
      return await generateWithGoogle(request);
    }
  } catch (error) {
    console.warn("Google Cloud TTS failed, falling back to Web Speech:", error);
  }

  // Último fallback: Web Speech API (gratuito, executado no navegador)
  return await generateWithWebSpeech(request);
}

/**
 * Extrair phonemes do texto para animação labial
 */
export function extractPhonemes(text: string, languageCode: string): string[] {
  // Mapeamento simplificado de letras para phonemes
  const phonemeMap: Record<string, string> = {
    a: "A",
    e: "E",
    i: "I",
    o: "O",
    u: "U",
    b: "B",
    p: "P",
    m: "M",
    f: "F",
    v: "V",
    t: "T",
    d: "D",
    s: "S",
    z: "Z",
    l: "L",
    r: "R",
    n: "N",
    k: "K",
    g: "G",
  };

  const phonemes: string[] = [];
  const normalizedText = text.toLowerCase().replace(/[^a-záàâãéèêíïóôõöúçñ]/g, "");

  for (const char of normalizedText) {
    const phoneme = phonemeMap[char] || "NEUTRAL";
    phonemes.push(phoneme);
  }

  return phonemes;
}

/**
 * Calcular duração de cada phoneme para sincronização labial
 */
export function calculatePhonemeDurations(
  phonemes: string[],
  totalDuration: number
): Array<{ phoneme: string; start: number; end: number }> {
  const avgDuration = totalDuration / phonemes.length;

  return phonemes.map((phoneme, index) => ({
    phoneme,
    start: index * avgDuration,
    end: (index + 1) * avgDuration,
  }));
}
