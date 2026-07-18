/**
 * Talking Avatar Pipeline — D-ID API
 * Foto + Texto → TTS → Vídeo MP4 animado com lip-sync perfeito
 * Docs: https://docs.d-id.com/reference/createtalk
 */

const DID_API_URL = "https://api.d-id.com";

// Mapeamento de languageCode → voz D-ID (Microsoft Neural TTS)
const DID_VOICE_MAP: Record<string, string> = {
  "en-US": "en-US-JennyNeural",
  "en-GB": "en-GB-SoniaNeural",
  "pt-BR": "pt-BR-FranciscaNeural",
  "pt-PT": "pt-PT-FernandaNeural",
  "es-ES": "es-ES-ElviraNeural",
  "es-MX": "es-MX-DaliaNeural",
  "fr-FR": "fr-FR-DeniseNeural",
  "de-DE": "de-DE-KatjaNeural",
  "it-IT": "it-IT-ElsaNeural",
  "ja-JP": "ja-JP-NanamiNeural",
  "ko-KR": "ko-KR-SunHiNeural",
  "zh-CN": "zh-CN-XiaoxiaoNeural",
  "ru-RU": "ru-RU-SvetlanaNeural",
  "ar-SA": "ar-SA-ZariyahNeural",
};

/**
 * Criar talk D-ID com URL de áudio existente
 */
async function createDIDTalkWithAudio(imageUrl: string, audioUrl: string): Promise<string> {
  const apiKey = process.env.DID_API_KEY;
  if (!apiKey) throw new Error("DID_API_KEY not configured");

  const createResp = await fetch(`${DID_API_URL}/talks`, {
    method: "POST",
    headers: {
      "accept": "application/json",
      "content-type": "application/json",
      "authorization": `Basic ${Buffer.from(apiKey).toString("base64")}`,
    },
    body: JSON.stringify({
      source_url: imageUrl,
      script: {
        type: "audio",
        audio_url: audioUrl,
      },
      config: {
        fluent: true,
        pad_audio: 0.0,
        stitch: true,
        result_format: "mp4",
        motion_factor: 1.0,
        align_driver: true,
        reduce_noise: true,
      },
    }),
  });

  if (!createResp.ok) {
    const err = await createResp.json().catch(() => ({}));
    throw new Error(`D-ID create failed: ${JSON.stringify(err)}`);
  }

  const { id } = await createResp.json();
  if (!id) throw new Error("D-ID returned no talk ID");
  console.log(`[D-ID] Talk created: ${id}`);

  return await pollDIDTalk(id, apiKey);
}

/**
 * Criar talk D-ID com texto direto (Microsoft Neural TTS integrado)
 */
async function createDIDTalkWithText(
  imageUrl: string,
  text: string,
  languageCode = "en-US",
  voiceId?: string
): Promise<string> {
  const apiKey = process.env.DID_API_KEY;
  if (!apiKey) throw new Error("DID_API_KEY not configured");

  const voice = voiceId || DID_VOICE_MAP[languageCode] || "en-US-JennyNeural";

  const createResp = await fetch(`${DID_API_URL}/talks`, {
    method: "POST",
    headers: {
      "accept": "application/json",
      "content-type": "application/json",
      "authorization": `Basic ${Buffer.from(apiKey).toString("base64")}`,
    },
    body: JSON.stringify({
      source_url: imageUrl,
      script: {
        type: "text",
        input: text,
        provider: {
          type: "microsoft",
          voice_id: voice,
        },
        ssml: false,
      },
      config: {
        fluent: true,
        pad_audio: 0.0,
        stitch: true,
        result_format: "mp4",
        motion_factor: 1.0,
        align_driver: true,
        reduce_noise: true,
      },
    }),
  });

  if (!createResp.ok) {
    const err = await createResp.json().catch(() => ({}));
    throw new Error(`D-ID create failed: ${JSON.stringify(err)}`);
  }

  const { id } = await createResp.json();
  if (!id) throw new Error("D-ID returned no talk ID");
  console.log(`[D-ID] Talk created: ${id}`);

  return await pollDIDTalk(id, apiKey);
}

/**
 * Polling até o vídeo estar pronto (máx 90s)
 */
async function pollDIDTalk(id: string, apiKey: string): Promise<string> {
  const authHeader = `Basic ${Buffer.from(apiKey).toString("base64")}`;
  for (let i = 0; i < 45; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const statusResp = await fetch(`${DID_API_URL}/talks/${id}`, {
      headers: { "authorization": authHeader },
    });
    if (!statusResp.ok) continue;
    const status = await statusResp.json();
    console.log(`[D-ID] Poll ${i + 1}: ${status.status}`);
    if (status.status === "done" && status.result_url) {
      console.log(`[D-ID] Video ready: ${status.result_url}`);
      return status.result_url;
    }
    if (status.status === "error") {
      throw new Error(`D-ID failed: ${status.error?.description || "unknown"}`);
    }
  }
  throw new Error("D-ID talk timeout after 90s");
}

// ── Exports públicos ──────────────────────────────────────────────────────────

export async function animatePortrait(imageUrl: string, audioUrl: string): Promise<string> {
  console.log("[AnimatePortrait] imageUrl:", imageUrl, "audioUrl:", audioUrl);
  return await createDIDTalkWithAudio(imageUrl, audioUrl);
}

export async function animatePortraitWithText(
  imageUrl: string,
  text: string,
  languageCode = "en-US",
  voiceId?: string
): Promise<string> {
  console.log("[AnimatePortraitWithText] imageUrl:", imageUrl, "text:", text.slice(0, 50));
  return await createDIDTalkWithText(imageUrl, text, languageCode, voiceId);
}

export async function checkLivePortraitHealth(): Promise<boolean> {
  const apiKey = process.env.DID_API_KEY;
  if (!apiKey) return false;
  try {
    const resp = await fetch(`${DID_API_URL}/talks?limit=1`, {
      headers: {
        "authorization": `Basic ${Buffer.from(apiKey).toString("base64")}`,
      },
    });
    return resp.ok;
  } catch {
    return false;
  }
}
