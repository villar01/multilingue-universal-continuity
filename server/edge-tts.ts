/**
 * ═══════════════════════════════════════════════════════════════════
 * server/edge-tts.ts
 * Microsoft Edge TTS — Vozes Neurais de Alta Qualidade
 * Suporta todos os 57 idiomas com vozes nativas realistas
 * ═══════════════════════════════════════════════════════════════════
 */

import { MsEdgeTTS, OUTPUT_FORMAT, ProsodyOptions } from "msedge-tts";
import { storagePut } from "./storage";

// ─── MAPEAMENTO COMPLETO: voiceLang → voz neural Microsoft ────────────────────
// Vozes FEMININAS por idioma
export const EDGE_TTS_VOICES_FEMALE: Record<string, string> = {
  "pt-BR":  "pt-BR-FranciscaNeural",
  "pt-PT":  "pt-PT-RaquelNeural",
  "en-US":  "en-US-JennyNeural",
  "en-GB":  "en-GB-SoniaNeural",
  "en-AU":  "en-AU-NatashaNeural",
  "es-ES":  "es-ES-ElviraNeural",
  "es-MX":  "es-MX-DaliaNeural",
  "es-AR":  "es-AR-ElenaNeural",
  "fr-FR":  "fr-FR-DeniseNeural",
  "fr-CA":  "fr-CA-SylvieNeural",
  "de-DE":  "de-DE-KatjaNeural",
  "de-AT":  "de-AT-IngridNeural",
  "it-IT":  "it-IT-ElsaNeural",
  "ja-JP":  "ja-JP-NanamiNeural",
  "ko-KR":  "ko-KR-SunHiNeural",
  "zh-CN":  "zh-CN-XiaoxiaoNeural",
  "zh-TW":  "zh-TW-HsiaoChenNeural",
  "zh-HK":  "zh-HK-HiuMaanNeural",
  "ar-SA":  "ar-SA-ZariyahNeural",
  "ar-EG":  "ar-EG-SalmaNeural",
  "ru-RU":  "ru-RU-SvetlanaNeural",
  "hi-IN":  "hi-IN-SwaraNeural",
  "nl-NL":  "nl-NL-ColetteNeural",
  "nl-BE":  "nl-BE-DenaNeural",
  "pl-PL":  "pl-PL-ZofiaNeural",
  "sv-SE":  "sv-SE-SofieNeural",
  "da-DK":  "da-DK-ChristelNeural",
  "fi-FI":  "fi-FI-NooraNeural",
  "nb-NO":  "nb-NO-PernilleNeural",
  "el-GR":  "el-GR-AthinaNeural",
  "cs-CZ":  "cs-CZ-VlastaNeural",
  "hu-HU":  "hu-HU-NoemiNeural",
  "ro-RO":  "ro-RO-AlinaNeural",
  "uk-UA":  "uk-UA-PolinaNeural",
  "tr-TR":  "tr-TR-EmelNeural",
  "id-ID":  "id-ID-GadisNeural",
  "ms-MY":  "ms-MY-YasminNeural",
  "th-TH":  "th-TH-PremwadeeNeural",
  "vi-VN":  "vi-VN-HoaiMyNeural",
  "he-IL":  "he-IL-HilaNeural",
  "af-ZA":  "af-ZA-AdriNeural",
  "sw-KE":  "sw-KE-ZuriNeural",
  "bn-IN":  "bn-IN-TanishaaNeural",
  "ta-IN":  "ta-IN-PallaviNeural",
  "ur-PK":  "ur-PK-UzmaNeural",
  "fa-IR":  "fa-IR-DilaraNeural",
  "bg-BG":  "bg-BG-KalinaNeural",
  "hr-HR":  "hr-HR-GabrijelaNeural",
  "sk-SK":  "sk-SK-ViktoriaNeural",
  "sl-SI":  "sl-SI-PetraNeural",
  "lt-LT":  "lt-LT-OnaNeural",
  "lv-LV":  "lv-LV-EveritaNeural",
  "et-EE":  "et-EE-AnuNeural",
  "ca-ES":  "ca-ES-JoanaNeural",
  "gl-ES":  "gl-ES-SabelaNeural",
  "eu-ES":  "eu-ES-AinhoaNeural",
  "cy-GB":  "cy-GB-NiaNeural",
  "ga-IE":  "ga-IE-OrlaNeural",
  "mt-MT":  "mt-MT-GraceNeural",
  "is-IS":  "is-IS-GudrunNeural",
  "mk-MK":  "mk-MK-MarijaNeural",
  "sq-AL":  "sq-AL-AnilaNeural",
  "am-ET":  "am-ET-MekdesNeural",
  "ha-NG":  "ha-NG-ZinaNeural",
  "ig-NG":  "ig-NG-EzinneNeural",
  "yo-NG":  "yo-NG-EzinneNeural",
  "zu-ZA":  "zu-ZA-ThandoNeural",
  "xh-ZA":  "zu-ZA-ThandoNeural",
  "qu-PE":  "es-PE-CamilaNeural",
  "tl-PH":  "fil-PH-BlessicaNeural",
};

// Vozes MASCULINAS por idioma
export const EDGE_TTS_VOICES_MALE: Record<string, string> = {
  "pt-BR":  "pt-BR-AntonioNeural",
  "pt-PT":  "pt-PT-DuarteNeural",
  "en-US":  "en-US-GuyNeural",
  "en-GB":  "en-GB-RyanNeural",
  "en-AU":  "en-AU-WilliamNeural",
  "es-ES":  "es-ES-AlvaroNeural",
  "es-MX":  "es-MX-JorgeNeural",
  "es-AR":  "es-AR-TomasNeural",
  "fr-FR":  "fr-FR-HenriNeural",
  "fr-CA":  "fr-CA-AntoineNeural",
  "de-DE":  "de-DE-ConradNeural",
  "de-AT":  "de-AT-JonasNeural",
  "it-IT":  "it-IT-DiegoNeural",
  "ja-JP":  "ja-JP-KeitaNeural",
  "ko-KR":  "ko-KR-InJoonNeural",
  "zh-CN":  "zh-CN-YunxiNeural",
  "zh-TW":  "zh-TW-YunJheNeural",
  "zh-HK":  "zh-HK-WanLungNeural",
  "ar-SA":  "ar-SA-HamedNeural",
  "ar-EG":  "ar-EG-ShakirNeural",
  "ru-RU":  "ru-RU-DmitryNeural",
  "hi-IN":  "hi-IN-MadhurNeural",
  "nl-NL":  "nl-NL-MaartenNeural",
  "nl-BE":  "nl-BE-ArnaudNeural",
  "pl-PL":  "pl-PL-MarekNeural",
  "sv-SE":  "sv-SE-MattiasNeural",
  "da-DK":  "da-DK-JeppeNeural",
  "fi-FI":  "fi-FI-HarriNeural",
  "nb-NO":  "nb-NO-FinnNeural",
  "el-GR":  "el-GR-NestorasNeural",
  "cs-CZ":  "cs-CZ-AntoninNeural",
  "hu-HU":  "hu-HU-TamasNeural",
  "ro-RO":  "ro-RO-EmilNeural",
  "uk-UA":  "uk-UA-OstapNeural",
  "tr-TR":  "tr-TR-AhmetNeural",
  "id-ID":  "id-ID-ArdiNeural",
  "ms-MY":  "ms-MY-OsmanNeural",
  "th-TH":  "th-TH-NiwatNeural",
  "vi-VN":  "vi-VN-NamMinhNeural",
  "he-IL":  "he-IL-AvriNeural",
  "af-ZA":  "af-ZA-WillemNeural",
  "sw-KE":  "sw-KE-RafikiNeural",
  "bn-IN":  "bn-IN-BashkarNeural",
  "ta-IN":  "ta-IN-ValluvarNeural",
  "ur-PK":  "ur-PK-AsadNeural",
  "fa-IR":  "fa-IR-FaridNeural",
  "bg-BG":  "bg-BG-BorislavNeural",
  "hr-HR":  "hr-HR-SreckoNeural",
  "sk-SK":  "sk-SK-LukasNeural",
  "sl-SI":  "sl-SI-RokNeural",
  "lt-LT":  "lt-LT-LeonasNeural",
  "lv-LV":  "lv-LV-NilsNeural",
  "et-EE":  "et-EE-KertNeural",
  "ca-ES":  "ca-ES-EnricNeural",
  "gl-ES":  "gl-ES-RoiNeural",
  "eu-ES":  "eu-ES-AnderNeural",
  "cy-GB":  "cy-GB-AledNeural",
  "ga-IE":  "ga-IE-ColmNeural",
  "mt-MT":  "mt-MT-JosephNeural",
  "is-IS":  "is-IS-GunnarNeural",
  "mk-MK":  "mk-MK-AleksandarNeural",
  "sq-AL":  "sq-AL-IlirNeural",
  "am-ET":  "am-ET-AmehaNeural",
  "ha-NG":  "ha-NG-OmarNeural",
  "ig-NG":  "ig-NG-ChukwuemekaNe",
  "yo-NG":  "yo-NG-IsiakNeural",
  "zu-ZA":  "zu-ZA-ThembaNeural",
  "xh-ZA":  "zu-ZA-ThembaNeural",
  "qu-PE":  "es-PE-AlexNeural",
  "tl-PH":  "fil-PH-AngeloNeural",
};

// Mapa legado (compatibilidade) — usa vozes femininas como padrão
export const EDGE_TTS_VOICES: Record<string, string> = {
  "pt-BR":  "pt-BR-AntonioNeural",
  "pt-PT":  "pt-PT-RaquelNeural",
  "en-US":  "en-US-GuyNeural",
  "en-GB":  "en-GB-RyanNeural",
  "en-AU":  "en-AU-WilliamNeural",
  "es-ES":  "es-ES-ElviraNeural",
  "es-MX":  "es-MX-DaliaNeural",
  "es-AR":  "es-AR-ElenaNeural",
  "fr-FR":  "fr-FR-DeniseNeural",
  "fr-CA":  "fr-CA-SylvieNeural",
  "de-DE":  "de-DE-KatjaNeural",
  "de-AT":  "de-AT-IngridNeural",
  "it-IT":  "it-IT-ElsaNeural",
  "ja-JP":  "ja-JP-NanamiNeural",
  "ko-KR":  "ko-KR-SunHiNeural",
  "zh-CN":  "zh-CN-XiaoxiaoNeural",
  "zh-TW":  "zh-TW-HsiaoChenNeural",
  "zh-HK":  "zh-HK-HiuMaanNeural",
  "ar-SA":  "ar-SA-ZariyahNeural",
  "ar-EG":  "ar-EG-SalmaNeural",
  "ru-RU":  "ru-RU-SvetlanaNeural",
  "hi-IN":  "hi-IN-SwaraNeural",
  "nl-NL":  "nl-NL-ColetteNeural",
  "nl-BE":  "nl-BE-DenaNeural",
  "pl-PL":  "pl-PL-ZofiaNeural",
  "sv-SE":  "sv-SE-SofieNeural",
  "da-DK":  "da-DK-ChristelNeural",
  "fi-FI":  "fi-FI-NooraNeural",
  "nb-NO":  "nb-NO-PernilleNeural",
  "el-GR":  "el-GR-AthinaNeural",
  "cs-CZ":  "cs-CZ-VlastaNeural",
  "hu-HU":  "hu-HU-NoemiNeural",
  "ro-RO":  "ro-RO-AlinaNeural",
  "uk-UA":  "uk-UA-PolinaNeural",
  "tr-TR":  "tr-TR-EmelNeural",
  "id-ID":  "id-ID-GadisNeural",
  "ms-MY":  "ms-MY-YasminNeural",
  "th-TH":  "th-TH-PremwadeeNeural",
  "vi-VN":  "vi-VN-HoaiMyNeural",
  "he-IL":  "he-IL-HilaNeural",
  "af-ZA":  "af-ZA-AdriNeural",
  "sw-KE":  "sw-KE-ZuriNeural",
  "bn-IN":  "bn-IN-TanishaaNeural",
  "ta-IN":  "ta-IN-PallaviNeural",
  "ur-PK":  "ur-PK-UzmaNeural",
  "fa-IR":  "fa-IR-DilaraNeural",
  "bg-BG":  "bg-BG-KalinaNeural",
  "hr-HR":  "hr-HR-GabrijelaNeural",
  "sk-SK":  "sk-SK-ViktoriaNeural",
  "sl-SI":  "sl-SI-PetraNeural",
  "lt-LT":  "lt-LT-OnaNeural",
  "lv-LV":  "lv-LV-EveritaNeural",
  "et-EE":  "et-EE-AnuNeural",
  "ca-ES":  "ca-ES-JoanaNeural",
  "gl-ES":  "gl-ES-SabelaNeural",
  "eu-ES":  "eu-ES-AinhoaNeural",
  "cy-GB":  "cy-GB-NiaNeural",
  "ga-IE":  "ga-IE-OrlaNeural",
};

// Normaliza código de idioma para chave do mapa — com suporte a gênero.
// Nunca substitui idioma desconhecido por inglês: a aula deve aguardar uma
// voz compatível em vez de produzir mistura de idioma ou sotaque.
export function resolveVoice(voiceLang: string, gender?: 'male' | 'female'): string | null {
  const map = gender === 'male' ? EDGE_TTS_VOICES_MALE : EDGE_TTS_VOICES_FEMALE;
  // Direct match in gender-specific map
  if (map[voiceLang]) return map[voiceLang];
  // Expand short codes: 'en' → 'en-US', 'pt' → 'pt-BR', etc.
  const prefix = voiceLang.split("-")[0].toLowerCase();
  const match = Object.keys(map).find(k =>
    k.toLowerCase().startsWith(prefix + "-")
  );
  if (match) return map[match];
  return null;
}

export interface TTSSynthResult {
  audioBase64: string;
  mimeType: "audio/mp3";
  durationEstimateMs: number;
  voice: string;
  cached?: boolean;
}

// Cache em memória simples (evita re-síntese de frases repetidas)
const ttsCache = new Map<string, TTSSynthResult>();

/**
 * Sintetiza texto com Edge TTS e retorna base64 do MP3
 */
export async function synthesizeEdgeTTS(
  text: string,
  voiceLang: string,
  prosodyOptions?: ProsodyOptions,
  gender?: 'male' | 'female'
): Promise<TTSSynthResult> {
  const voice = resolveVoice(voiceLang, gender);
  if (!voice) {
    throw new Error(`Nenhuma voz neural compatível está disponível para o idioma ${voiceLang}.`);
  }
  const cacheKey = `${voice}::${text.slice(0, 120)}`;

  if (ttsCache.has(cacheKey)) {
    return { ...ttsCache.get(cacheKey)!, cached: true };
  }

  const tts = new MsEdgeTTS();
  // Usar 48KHz para máxima qualidade de áudio
  await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);

  // Ajuste de prosody por idioma para dicção mais natural
  const isJaZh = voiceLang.startsWith("ja") || voiceLang.startsWith("zh");
  const isAr = voiceLang.startsWith("ar");
  const isEn = voiceLang.startsWith("en");
  const isPt = voiceLang.startsWith("pt");
  const options: ProsodyOptions = prosodyOptions ?? {
    rate: isJaZh ? "-12%" : isAr ? "-8%" : isEn ? "-5%" : isPt ? "-3%" : "+0%",
    pitch: isEn ? "-2Hz" : isPt ? "-1Hz" : "+0Hz",
  };

  const { audioStream } = tts.toStream(text, options);
  const chunks: Buffer[] = [];
  for await (const chunk of audioStream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as Uint8Array));
  }

  const audioBuffer = Buffer.concat(chunks);
  const audioBase64 = audioBuffer.toString("base64");
  const durationEstimateMs = Math.max(800, Math.ceil((text.length / 15) * 1000));

  const result: TTSSynthResult = {
    audioBase64,
    mimeType: "audio/mp3",
    durationEstimateMs,
    voice,
  };

  // Cache (máx 300 entradas)
  if (ttsCache.size > 300) {
    const firstKey = ttsCache.keys().next().value;
    if (firstKey) ttsCache.delete(firstKey);
  }
  ttsCache.set(cacheKey, result);

  return result;
}

/**
 * Sintetiza e faz upload para S3, retorna URL pública
 */
export async function synthesizeToUrl(
  text: string,
  voiceLang: string
): Promise<{ url: string; voice: string; durationMs: number }> {
  const result = await synthesizeEdgeTTS(text, voiceLang);
  const buffer = Buffer.from(result.audioBase64, "base64");
  const key = `tts/${Date.now()}-${Math.random().toString(36).slice(2)}.mp3`;
  const { url } = await storagePut(key, buffer, "audio/mpeg");
  return { url, voice: result.voice, durationMs: result.durationEstimateMs };
}
