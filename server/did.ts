/**
 * D-ID API Helper - Avatares Fotorrealistas Falantes
 * Gera vídeos de professores com lip-sync perfeito
 * Documentação: https://docs.d-id.com/reference/createtalk
 */
import https from "https";

// D-ID API config
const DID_API_BASE = "api.d-id.com";
// Key format: Basic base64(email:apikey)
function getDIDAuthHeader(): string {
  const raw = process.env.DID_API_KEY || "";
  // If already contains "Basic " prefix, return as-is
  if (raw.startsWith("Basic ")) return raw;
  // If raw format (email:password), base64 encode it
  const b64 = Buffer.from(raw).toString("base64");
  return `Basic ${b64}`;
}

// Fotos dos professores hospedadas publicamente (avatares de alta qualidade)
// Usando fotos de perfil realistas de domínio público / geradas por IA
export const TEACHER_PHOTOS: Record<string, string> = {
  "prof-pt-br": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
  "prof-en-us": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face",
  "prof-en-gb": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
  "prof-es-es": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
  "prof-es-mx": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
  "prof-fr":    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
  "prof-de":    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face",
  "prof-it":    "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop&crop=face",
  "prof-ja":    "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=400&h=400&fit=crop&crop=face",
  "prof-ko":    "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&h=400&fit=crop&crop=face",
  "prof-zh":    "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face",
  "prof-ar":    "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&h=400&fit=crop&crop=face",
  "prof-ru":    "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face",
  "prof-hi":    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face",
  "prof-pt-pt": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face",
  // Default fallback
  "default":    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
};

// Vozes Microsoft Neural disponíveis no D-ID
export const TEACHER_VOICES: Record<string, { voiceId: string; provider: "microsoft" | "amazon" }> = {
  "pt": { voiceId: "pt-BR-FranciscaNeural", provider: "microsoft" },
  "pt-BR": { voiceId: "pt-BR-FranciscaNeural", provider: "microsoft" },
  "pt-PT": { voiceId: "pt-PT-RaquelNeural", provider: "microsoft" },
  "en": { voiceId: "en-US-JennyNeural", provider: "microsoft" },
  "en-US": { voiceId: "en-US-JennyNeural", provider: "microsoft" },
  "en-GB": { voiceId: "en-GB-SoniaNeural", provider: "microsoft" },
  "es": { voiceId: "es-ES-ElviraNeural", provider: "microsoft" },
  "es-ES": { voiceId: "es-ES-ElviraNeural", provider: "microsoft" },
  "es-MX": { voiceId: "es-MX-DaliaNeural", provider: "microsoft" },
  "fr": { voiceId: "fr-FR-DeniseNeural", provider: "microsoft" },
  "de": { voiceId: "de-DE-KatjaNeural", provider: "microsoft" },
  "it": { voiceId: "it-IT-ElsaNeural", provider: "microsoft" },
  "ja": { voiceId: "ja-JP-NanamiNeural", provider: "microsoft" },
  "ko": { voiceId: "ko-KR-SunHiNeural", provider: "microsoft" },
  "zh": { voiceId: "zh-CN-XiaoxiaoNeural", provider: "microsoft" },
  "zh-TW": { voiceId: "zh-TW-HsiaoChenNeural", provider: "microsoft" },
  "ar": { voiceId: "ar-SA-ZariyahNeural", provider: "microsoft" },
  "ru": { voiceId: "ru-RU-SvetlanaNeural", provider: "microsoft" },
  "hi": { voiceId: "hi-IN-SwaraNeural", provider: "microsoft" },
  "nl": { voiceId: "nl-NL-ColetteNeural", provider: "microsoft" },
  "pl": { voiceId: "pl-PL-ZofiaNeural", provider: "microsoft" },
  "sv": { voiceId: "sv-SE-SofieNeural", provider: "microsoft" },
  "da": { voiceId: "da-DK-ChristelNeural", provider: "microsoft" },
  "fi": { voiceId: "fi-FI-NooraNeural", provider: "microsoft" },
  "nb": { voiceId: "nb-NO-PernilleNeural", provider: "microsoft" },
  "el": { voiceId: "el-GR-AthinaNeural", provider: "microsoft" },
  "cs": { voiceId: "cs-CZ-VlastaNeural", provider: "microsoft" },
  "hu": { voiceId: "hu-HU-NoemiNeural", provider: "microsoft" },
  "ro": { voiceId: "ro-RO-AlinaNeural", provider: "microsoft" },
  "uk": { voiceId: "uk-UA-PolinaNeural", provider: "microsoft" },
  "tr": { voiceId: "tr-TR-EmelNeural", provider: "microsoft" },
  "id": { voiceId: "id-ID-GadisNeural", provider: "microsoft" },
  "ms": { voiceId: "ms-MY-YasminNeural", provider: "microsoft" },
  "th": { voiceId: "th-TH-PremwadeeNeural", provider: "microsoft" },
  "vi": { voiceId: "vi-VN-HoaiMyNeural", provider: "microsoft" },
  "he": { voiceId: "he-IL-HilaNeural", provider: "microsoft" },
  "af": { voiceId: "af-ZA-AdriNeural", provider: "microsoft" },
  "sw": { voiceId: "sw-KE-ZuriNeural", provider: "microsoft" },
  "default": { voiceId: "en-US-JennyNeural", provider: "microsoft" },
};

function makeRequest(method: string, path: string, body?: object): Promise<{ status: number; data: unknown }> {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : undefined;
    const options: https.RequestOptions = {
      hostname: DID_API_BASE,
      path,
      method,
      headers: {
        "Authorization": getDIDAuthHeader(),
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...(bodyStr ? { "Content-Length": Buffer.byteLength(bodyStr) } : {}),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode || 0, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode || 0, data });
        }
      });
    });

    req.on("error", reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error("D-ID request timeout"));
    });

    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

export interface DIDTalkRequest {
  teacherId: string;
  text: string;
  langCode: string;
  photoUrl?: string;
}

export interface DIDTalkResult {
  talkId: string;
  status: "created" | "started" | "done" | "error";
  videoUrl?: string;
}

/**
 * Cria um vídeo de professor falando com lip-sync perfeito via D-ID
 */
export async function createTalkingAvatar(req: DIDTalkRequest): Promise<DIDTalkResult> {
  const photoUrl = req.photoUrl || TEACHER_PHOTOS[req.teacherId] || TEACHER_PHOTOS["default"];
  const voiceConfig = TEACHER_VOICES[req.langCode] || TEACHER_VOICES["default"];

  const payload = {
    source_url: photoUrl,
    script: {
      type: "text",
      input: req.text,
      provider: {
        type: voiceConfig.provider,
        voice_id: voiceConfig.voiceId,
      },
      ssml: false,
    },
    config: {
      fluent: true,
      pad_audio: 0.0,
      stitch: true,
    },
    driver_url: "bank://lively/",
  };

  const result = await makeRequest("POST", "/talks", payload);

  if (result.status !== 201 && result.status !== 200) {
    throw new Error(`D-ID error ${result.status}: ${JSON.stringify(result.data)}`);
  }

  const data = result.data as { id: string; status: string };
  return {
    talkId: data.id,
    status: "created",
  };
}

/**
 * Verifica o status de um vídeo D-ID e retorna a URL quando pronto
 */
export async function getTalkStatus(talkId: string): Promise<DIDTalkResult> {
  const result = await makeRequest("GET", `/talks/${talkId}`);
  const data = result.data as { id: string; status: string; result_url?: string };

  return {
    talkId: data.id,
    status: (data.status as DIDTalkResult["status"]) || "started",
    videoUrl: data.result_url,
  };
}

/**
 * Verifica créditos disponíveis
 */
export async function getDIDCredits(): Promise<{ remaining: number; total: number }> {
  const result = await makeRequest("GET", "/credits");
  const data = result.data as { remaining: number; total: number };
  return { remaining: data.remaining || 0, total: data.total || 0 };
}

/**
 * Aguarda o vídeo ficar pronto (polling com timeout)
 */
export async function waitForTalk(talkId: string, maxWaitMs = 60000): Promise<DIDTalkResult> {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const status = await getTalkStatus(talkId);
    if (status.status === "done" && status.videoUrl) {
      return status;
    }
    if (status.status === "error") {
      throw new Error(`D-ID talk failed: ${talkId}`);
    }
    // Wait 2 seconds before polling again
    await new Promise(r => setTimeout(r, 2000));
  }
  throw new Error("D-ID talk timeout");
}
