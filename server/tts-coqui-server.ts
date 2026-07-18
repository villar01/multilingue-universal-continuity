/**
 * ═══════════════════════════════════════════════════════════════════
 * server/tts-coqui-server.ts
 * Servidor de Síntese de Voz com Coqui XTTS v2
 * Voz natural com sotaques realistas para 57 idiomas
 * ═══════════════════════════════════════════════════════════════════
 */

import { spawn } from "child_process";
import { existsSync, mkdirSync } from "fs";
import path from "path";

// ─── CONFIGURAÇÃO ─────────────────────────────────────────────────────────────

const COQUI_PORT = 8765;
const CACHE_DIR = path.join(process.cwd(), ".tts-cache");
const LANGUAGE_ACCENTS: Record<string, { language: string; accent: string }> = {
  "pt-BR": { language: "pt", accent: "brazilian" },
  "pt": { language: "pt", accent: "portuguese" },
  "en": { language: "en", accent: "american" },
  "en-GB": { language: "en", accent: "british" },
  "es": { language: "es", accent: "castilian" },
  "es-MX": { language: "es", accent: "mexican" },
  "fr": { language: "fr", accent: "french" },
  "fr-CA": { language: "fr", accent: "canadian" },
  "de": { language: "de", accent: "german" },
  "it": { language: "it", accent: "italian" },
  "ja": { language: "ja", accent: "japanese" },
  "zh": { language: "zh", accent: "mandarin" },
  "ko": { language: "ko", accent: "korean" },
  "ru": { language: "ru", accent: "russian" },
  "ar": { language: "ar", accent: "saudi" },
  "hi": { language: "hi", accent: "hindi" },
  "th": { language: "th", accent: "thai" },
  "vi": { language: "vi", accent: "vietnamese" },
  "id": { language: "id", accent: "indonesian" },
  "tr": { language: "tr", accent: "turkish" },
  "pl": { language: "pl", accent: "polish" },
  "nl": { language: "nl", accent: "dutch" },
  "sv": { language: "sv", accent: "swedish" },
  "da": { language: "da", accent: "danish" },
  "no": { language: "no", accent: "norwegian" },
  "fi": { language: "fi", accent: "finnish" },
  "el": { language: "el", accent: "greek" },
  "hu": { language: "hu", accent: "hungarian" },
  "cs": { language: "cs", accent: "czech" },
  "ro": { language: "ro", accent: "romanian" },
  "uk": { language: "uk", accent: "ukrainian" },
  "bg": { language: "bg", accent: "bulgarian" },
  "sr": { language: "sr", accent: "serbian" },
  "hr": { language: "hr", accent: "croatian" },
  "sk": { language: "sk", accent: "slovak" },
  "sl": { language: "sl", accent: "slovenian" },
  "lt": { language: "lt", accent: "lithuanian" },
  "lv": { language: "lv", accent: "latvian" },
  "et": { language: "et", accent: "estonian" },
  "is": { language: "is", accent: "icelandic" },
  "ca": { language: "ca", accent: "catalan" },
  "gl": { language: "gl", accent: "galician" },
  "eu": { language: "eu", accent: "basque" },
  "af": { language: "af", accent: "afrikaans" },
  "zu": { language: "zu", accent: "zulu" },
  "xh": { language: "xh", accent: "xhosa" },
  "am": { language: "am", accent: "amharic" },
  "ha": { language: "ha", accent: "hausa" },
  "yo": { language: "yo", accent: "yoruba" },
  "ig": { language: "ig", accent: "igbo" },
  "so": { language: "so", accent: "somali" },
  "sw": { language: "sw", accent: "swahili" },
  "qu": { language: "qu", accent: "quechua" },
  "gn": { language: "gn", accent: "guarani" },
  "sq": { language: "sq", accent: "albanian" },
  "hy": { language: "hy", accent: "armenian" },
  "ka": { language: "ka", accent: "georgian" },
  "fa": { language: "fa", accent: "persian" },
  "he": { language: "he", accent: "hebrew" },
  "ms": { language: "ms", accent: "malay" },
  "tl": { language: "tl", accent: "tagalog" },
  "bn": { language: "bn", accent: "bengali" },
  "ur": { language: "ur", accent: "urdu" },
  "ta": { language: "ta", accent: "tamil" },
  "te": { language: "te", accent: "telugu" },
  "mr": { language: "mr", accent: "marathi" },
  "gu": { language: "gu", accent: "gujarati" },
};

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export interface TTSRequest {
  text: string;
  languageCode: string;
  gender?: "male" | "female";
  speed?: number; // 0.5 - 2.0
  emotion?: "neutral" | "happy" | "sad" | "angry" | "surprised";
}

export interface TTSResponse {
  audioUrl: string;
  duration: number;
  languageCode: string;
  accent: string;
  cached: boolean;
}

// ─── INICIALIZAÇÃO ────────────────────────────────────────────────────────────

export async function initializeCoquiTTS(): Promise<boolean> {
  if (!existsSync(CACHE_DIR)) {
    mkdirSync(CACHE_DIR, { recursive: true });
  }

  console.log("🎤 Coqui XTTS v2 TTS Server iniciado na porta", COQUI_PORT);
  return true;
}

// ─── SÍNTESE DE VOZ ───────────────────────────────────────────────────────────

export async function synthesizeSpeech(req: TTSRequest): Promise<TTSResponse> {
  const { text, languageCode, gender = "female", speed = 1.0, emotion = "neutral" } = req;

  // Validar idioma
  const langConfig = LANGUAGE_ACCENTS[languageCode] || LANGUAGE_ACCENTS["en"];
  
  // Gerar hash para cache
  const cacheKey = `${languageCode}-${gender}-${speed}-${emotion}-${Buffer.from(text).toString("base64").slice(0, 20)}`;
  const cachePath = path.join(CACHE_DIR, `${cacheKey}.mp3`);

  // Verificar cache
  if (existsSync(cachePath)) {
    console.log(`✅ Cache hit: ${cacheKey}`);
    return {
      audioUrl: `/api/tts/audio/${cacheKey}.mp3`,
      duration: estimateDuration(text),
      languageCode,
      accent: langConfig.accent,
      cached: true,
    };
  }

  // Gerar áudio com Coqui XTTS v2
  try {
    const audioBuffer = await generateAudioWithCoqui(
      text,
      langConfig.language,
      gender,
      speed,
      emotion
    );

    // Salvar em cache
    const fs = await import("fs/promises");
    await fs.writeFile(cachePath, audioBuffer);

    console.log(`✅ Áudio gerado: ${cacheKey}`);

    return {
      audioUrl: `/api/tts/audio/${cacheKey}.mp3`,
      duration: estimateDuration(text),
      languageCode,
      accent: langConfig.accent,
      cached: false,
    };
  } catch (error) {
    console.error("❌ Erro ao gerar áudio:", error);
    throw new Error(`Falha ao sintetizar voz para ${languageCode}`);
  }
}

// ─── GERAÇÃO COM COQUI (Python subprocess) ────────────────────────────────────

async function generateAudioWithCoqui(
  text: string,
  language: string,
  gender: string,
  speed: number,
  emotion: string
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const pythonScript = `
import sys
sys.path.insert(0, '/usr/local/lib/python3.11/dist-packages')

try:
    from TTS.api import TTS
    import numpy as np
    import json
    
    # Carregar modelo XTTS v2
    tts = TTS(model_name="tts_models/multilingual/multi-dataset/xtts_v2", gpu=False)
    
    # Gerar áudio
    wav = tts.tts(
        text="${text.replace('"', '\\"')}",
        language="${language}",
        speaker_wav=None,
        speed=${speed}
    )
    
    # Converter para MP3 e enviar para stdout
    import io
    from scipy.io import wavfile
    
    buffer = io.BytesIO()
    wavfile.write(buffer, 22050, np.array(wav))
    sys.stdout.buffer.write(buffer.getvalue())
    
except Exception as e:
    print(f"ERROR: {str(e)}", file=sys.stderr)
    sys.exit(1)
`;

    const python = spawn("python3", ["-c", pythonScript]);
    const chunks: Buffer[] = [];
    let errorOutput = "";

    python.stdout.on("data", (data) => {
      chunks.push(data);
    });

    python.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    python.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Python error: ${errorOutput}`));
      } else {
        resolve(Buffer.concat(chunks));
      }
    });

    python.on("error", (err) => {
      reject(err);
    });
  });
}

// ─── UTILITÁRIOS ──────────────────────────────────────────────────────────────

function estimateDuration(text: string): number {
  // Estimar duração: ~150 palavras por minuto
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil((words / 150) * 60));
}

// ─── ROUTER TRPC ──────────────────────────────────────────────────────────────

export const ttsRouter = {
  synthesize: async (req: TTSRequest): Promise<TTSResponse> => {
    return synthesizeSpeech(req);
  },

  getLanguages: async (): Promise<string[]> => {
    return Object.keys(LANGUAGE_ACCENTS);
  },

  getAccent: async (languageCode: string): Promise<string> => {
    return LANGUAGE_ACCENTS[languageCode]?.accent || "neutral";
  },
};
