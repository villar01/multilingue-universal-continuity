/**
 * TRANSLATION & PRONUNCIATION APIS
 * Integração com DeepL (tradução contextual) e Whisper (avaliação de pronúncia)
 */

// ============================================================
// DEEPL API (TRADUÇÃO CONTEXTUAL SUPERIOR)
// ============================================================

interface DeepLTranslateOptions {
  text: string;
  targetLang: string; // ISO 639-1 code (ex: 'PT', 'ES', 'FR')
  sourceLang?: string; // Opcional, DeepL detecta automaticamente
  context?: string; // Contexto adicional para melhor tradução
}

export async function translateWithDeepL(
  options: DeepLTranslateOptions
): Promise<string> {
  const apiKey = process.env.DEEPL_API_KEY;

  if (!apiKey) {
    console.warn('[DeepL] API key not configured. Using fallback translation.');
    // Fallback: usar Google Translate ou retornar texto original
    return options.text;
  }

  const { text, targetLang, sourceLang, context } = options;

  try {
    const params = new URLSearchParams({
      auth_key: apiKey,
      text: text,
      target_lang: targetLang.toUpperCase(),
    });

    if (sourceLang) {
      params.append('source_lang', sourceLang.toUpperCase());
    }

    if (context) {
      params.append('context', context);
    }

    const response = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    if (!response.ok) {
      throw new Error(`DeepL API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.translations[0].text;
  } catch (error) {
    console.error('[DeepL] Error translating text:', error);
    return options.text; // Fallback: retornar texto original
  }
}

// ============================================================
// WHISPER API (AVALIAÇÃO DE PRONÚNCIA)
// ============================================================

interface WhisperTranscribeOptions {
  audioBuffer: Buffer;
  language: string; // ISO 639-1 code
  prompt?: string; // Texto esperado para melhor precisão
}

interface PronunciationResult {
  transcription: string;
  confidence: number; // 0.0 - 1.0
  words: Array<{
    word: string;
    confidence: number;
    start: number;
    end: number;
  }>;
  accuracy: number; // % de acurácia comparado ao texto esperado
  feedback: string; // Feedback textual
}

export async function evaluatePronunciation(
  options: WhisperTranscribeOptions & { expectedText: string }
): Promise<PronunciationResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.warn('[Whisper] API key not configured. Using fallback.');
    return {
      transcription: '',
      confidence: 0,
      words: [],
      accuracy: 0,
      feedback: 'Avaliação de pronúncia não disponível.',
    };
  }

  const { audioBuffer, language, expectedText, prompt } = options;

  try {
    // 1. Transcrever áudio com Whisper
    const formData = new FormData();
    const audioBlob = new Blob([audioBuffer as unknown as BlobPart], { type: 'audio/wav' });
    formData.append('file', audioBlob, 'audio.wav');
    formData.append('model', 'whisper-1');
    formData.append('language', language);
    formData.append('response_format', 'verbose_json');
    
    if (prompt) {
      formData.append('prompt', prompt);
    }

    const response = await fetch(
      'https://api.openai.com/v1/audio/transcriptions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Whisper API error: ${response.statusText}`);
    }

    const data = await response.json();
    const transcription = data.text;
    const words = data.words || [];

    // 2. Calcular acurácia comparando com texto esperado
    const accuracy = calculateAccuracy(transcription, expectedText);

    // 3. Gerar feedback
    const feedback = generatePronunciationFeedback(accuracy, transcription, expectedText);

    return {
      transcription,
      confidence: data.confidence || 0.8,
      words,
      accuracy,
      feedback,
    };
  } catch (error) {
    console.error('[Whisper] Error evaluating pronunciation:', error);
    throw error;
  }
}

// ============================================================
// HELPERS
// ============================================================

function calculateAccuracy(transcription: string, expected: string): number {
  const trans = transcription.toLowerCase().trim();
  const exp = expected.toLowerCase().trim();

  // Levenshtein distance simplificado
  if (trans === exp) return 100;

  const transWords = trans.split(/\s+/);
  const expWords = exp.split(/\s+/);

  let matches = 0;
  expWords.forEach((word) => {
    if (transWords.includes(word)) matches++;
  });

  return Math.round((matches / expWords.length) * 100);
}

function generatePronunciationFeedback(
  accuracy: number,
  transcription: string,
  expected: string
): string {
  if (accuracy >= 90) {
    return '🎉 Excelente! Sua pronúncia está perfeita!';
  } else if (accuracy >= 70) {
    return '👍 Muito bom! Continue praticando para melhorar ainda mais.';
  } else if (accuracy >= 50) {
    return '💪 Bom esforço! Tente prestar atenção em: ' + findDifferences(transcription, expected);
  } else {
    return '🔄 Vamos tentar novamente? Ouça o áudio de exemplo e repita devagar.';
  }
}

function findDifferences(transcription: string, expected: string): string {
  const transWords = transcription.toLowerCase().split(/\s+/);
  const expWords = expected.toLowerCase().split(/\s+/);

  const missing = expWords.filter((word) => !transWords.includes(word));
  
  if (missing.length > 0) {
    return `"${missing.slice(0, 3).join('", "')}"`;
  }

  return 'pronúncia geral';
}

// ============================================================
// LANGUAGE CODES MAPPING
// ============================================================

export const DEEPL_SUPPORTED_LANGUAGES = [
  'BG', 'CS', 'DA', 'DE', 'EL', 'EN', 'ES', 'ET', 'FI', 'FR',
  'HU', 'ID', 'IT', 'JA', 'KO', 'LT', 'LV', 'NB', 'NL', 'PL',
  'PT', 'RO', 'RU', 'SK', 'SL', 'SV', 'TR', 'UK', 'ZH',
];
