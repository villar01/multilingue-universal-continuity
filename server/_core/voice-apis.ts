/**
 * VOICE APIS INTEGRATION
 * Integração com Narakeet (voz infantil) e ElevenLabs (voz adulto/adolescente)
 */

// ============================================================
// NARAKEET API (VOZ INFANTIL)
// ============================================================

interface NarakeetOptions {
  text: string;
  voice: string; // Ex: "emma-uk-child", "noah-us-child"
  language: string; // ISO 639-1 code
}

export async function generateChildVoice(options: NarakeetOptions): Promise<Buffer> {
  const apiKey = process.env.NARAKEET_API_KEY;
  
  if (!apiKey) {
    console.warn('[Narakeet] API key not configured. Using fallback.');
    // Fallback: retornar buffer vazio ou usar TTS alternativo
    return Buffer.from('');
  }

  try {
    const response = await fetch('https://api.narakeet.com/text-to-speech/mp3', {
      method: 'POST',
      headers: {
        'Accept': 'application/octet-stream',
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        text: options.text,
        voice: options.voice,
        language: options.language,
      }),
    });

    if (!response.ok) {
      throw new Error(`Narakeet API error: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('[Narakeet] Error generating voice:', error);
    throw error;
  }
}

// ============================================================
// ELEVENLABS API (VOZ ADULTO/ADOLESCENTE)
// ============================================================

interface ElevenLabsOptions {
  text: string;
  voiceId: string; // ID da voz (ex: "21m00Tcm4TlvDq8ikWAM" - Rachel)
  modelId?: string; // "eleven_multilingual_v2" (padrão)
  stability?: number; // 0.0 - 1.0 (padrão: 0.5)
  similarityBoost?: number; // 0.0 - 1.0 (padrão: 0.75)
}

export async function generateNaturalVoice(options: ElevenLabsOptions): Promise<Buffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  
  if (!apiKey) {
    console.warn('[ElevenLabs] API key not configured. Using fallback.');
    return Buffer.from('');
  }

  const {
    text,
    voiceId,
    modelId = 'eleven_multilingual_v2',
    stability = 0.5,
    similarityBoost = 0.75,
  } = options;

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
          voice_settings: {
            stability,
            similarity_boost: similarityBoost,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('[ElevenLabs] Error generating voice:', error);
    throw error;
  }
}

// ============================================================
// VOICE HELPER (ESCOLHE API BASEADO NO NÍVEL)
// ============================================================

interface GenerateVoiceOptions {
  text: string;
  ageLevel: 'infantil' | 'adolescente' | 'adulto';
  language: string;
  gender?: 'male' | 'female';
}

export async function generateVoiceForLevel(
  options: GenerateVoiceOptions
): Promise<Buffer> {
  const { text, ageLevel, language, gender = 'female' } = options;

  // Nível infantil: usar Narakeet
  if (ageLevel === 'infantil') {
    const childVoice = gender === 'female' ? 'emma-uk-child' : 'noah-us-child';
    return generateChildVoice({
      text,
      voice: childVoice,
      language,
    });
  }

  // Nível adolescente/adulto: usar ElevenLabs
  // Vozes recomendadas: Rachel (female), Adam (male)
  const adultVoiceId = gender === 'female' 
    ? '21m00Tcm4TlvDq8ikWAM' // Rachel
    : 'pNInz6obpgDQGcFmaJgB'; // Adam

  return generateNaturalVoice({
    text,
    voiceId: adultVoiceId,
  });
}

// ============================================================
// VOZES DISPONÍVEIS POR IDIOMA
// ============================================================

export const NARAKEET_VOICES = {
  en: ['emma-uk-child', 'noah-us-child', 'olivia-uk-child'],
  es: ['sofia-es-child', 'mateo-es-child'],
  pt: ['ana-br-child', 'pedro-br-child'],
  fr: ['lea-fr-child', 'louis-fr-child'],
  de: ['hannah-de-child', 'leon-de-child'],
};

export const ELEVENLABS_VOICES = {
  // Vozes multilíngues (suportam 29+ idiomas)
  female: [
    { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', accent: 'American' },
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', accent: 'American' },
    { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', accent: 'American' },
  ],
  male: [
    { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', accent: 'American' },
    { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam', accent: 'American' },
    { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', accent: 'American' },
  ],
};
