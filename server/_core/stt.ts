/**
 * SPEECH-TO-TEXT (STT) - RECONHECIMENTO DE VOZ
 * Integração com Whisper API para transcrição e análise de pronúncia
 * Suporta todos os 57 idiomas
 */

import { transcribeAudio } from "./voiceTranscription";

export interface STTOptions {
  audioUrl: string;
  languageCode: string;
  expectedText?: string; // Para análise de pronúncia
  prompt?: string; // Contexto para melhorar precisão
}

export interface STTResult {
  transcribedText: string;
  language: string;
  confidence?: number;
  segments?: Array<{
    text: string;
    start: number;
    end: number;
  }>;
}

export interface PronunciationAnalysisResult {
  transcribedText: string;
  expectedText: string;
  accuracy: number; // 0-100
  matchPercentage: number; // 0-100
  wordAccuracy: Array<{
    word: string;
    correct: boolean;
    transcribed?: string;
  }>;
  feedback: string;
}

/**
 * Transcreve áudio para texto usando Whisper
 */
export async function speechToText(options: STTOptions): Promise<STTResult> {
  const { audioUrl, languageCode, prompt } = options;

  try {
    const result = await transcribeAudio({
      audioUrl,
      language: languageCode,
      prompt,
    });

    // Verificar se houve erro
    if ('error' in result) {
      throw new Error(result.error);
    }

    return {
      transcribedText: result.text,
      language: result.language,
      segments: result.segments?.map((seg: any) => ({
        text: seg.text,
        start: seg.start,
        end: seg.end,
      })),
    };
  } catch (error) {
    console.error("[STT] Error transcribing audio:", error);
    throw new Error("Failed to transcribe audio");
  }
}

/**
 * Analisa pronúncia comparando transcrição com texto esperado
 */
export async function analyzePronunciation(
  audioUrl: string,
  expectedText: string,
  languageCode: string
): Promise<PronunciationAnalysisResult> {
  // Transcrever áudio
  const transcription = await speechToText({
    audioUrl,
    languageCode,
    expectedText, // Usar como prompt para melhorar precisão
  });

  const transcribedText = transcription.transcribedText.trim().toLowerCase();
  const expectedLower = expectedText.trim().toLowerCase();

  // Calcular similaridade básica
  const matchPercentage = calculateSimilarity(transcribedText, expectedLower);

  // Analisar palavra por palavra
  const expectedWords = expectedLower.split(/\s+/);
  const transcribedWords = transcribedText.split(/\s+/);

  const wordAccuracy: Array<{
    word: string;
    correct: boolean;
    transcribed?: string;
  }> = [];

  for (let i = 0; i < expectedWords.length; i++) {
    const expectedWord = expectedWords[i] || "";
    const transcribedWord = transcribedWords[i] || "";

    const isCorrect = expectedWord === transcribedWord;

    wordAccuracy.push({
      word: expectedWord,
      correct: isCorrect,
      transcribed: !isCorrect ? transcribedWord : undefined,
    });
  }

  // Calcular precisão geral
  const correctWords = wordAccuracy.filter((w) => w.correct).length;
  const accuracy = (correctWords / expectedWords.length) * 100;

  // Gerar feedback
  const feedback = generatePronunciationFeedback(accuracy, wordAccuracy);

  return {
    transcribedText: transcription.transcribedText,
    expectedText,
    accuracy: Math.round(accuracy),
    matchPercentage: Math.round(matchPercentage),
    wordAccuracy,
    feedback,
  };
}

/**
 * Calcula similaridade entre dois textos (algoritmo de Levenshtein simplificado)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) {
    return 100;
  }

  const editDistance = levenshteinDistance(longer, shorter);
  return ((longer.length - editDistance) / longer.length) * 100;
}

/**
 * Calcula distância de Levenshtein entre duas strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0]![j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2[i - 1] === str1[j - 1]) {
        matrix[i]![j] = matrix[i - 1]![j - 1]!;
      } else {
        matrix[i]![j] = Math.min(
          matrix[i - 1]![j - 1]! + 1, // substituição
          matrix[i]![j - 1]! + 1, // inserção
          matrix[i - 1]![j]! + 1 // remoção
        );
      }
    }
  }

  return matrix[str2.length]![str1.length]!;
}

/**
 * Gera feedback encorajador baseado na precisão
 */
function generatePronunciationFeedback(
  accuracy: number,
  wordAccuracy: Array<{ word: string; correct: boolean; transcribed?: string }>
): string {
  let feedback = "";

  if (accuracy >= 95) {
    feedback = "🎉 Excelente! Sua pronúncia está perfeita!";
  } else if (accuracy >= 85) {
    feedback = "👏 Muito bem! Sua pronúncia está ótima!";
  } else if (accuracy >= 70) {
    feedback = "👍 Bom trabalho! Continue praticando.";
  } else if (accuracy >= 50) {
    feedback = "💪 Você está no caminho certo! Vamos melhorar.";
  } else {
    feedback = "🌟 Continue tentando! A prática leva à perfeição.";
  }

  // Adicionar palavras que precisam de atenção
  const incorrectWords = wordAccuracy.filter((w) => !w.correct);

  if (incorrectWords.length > 0 && incorrectWords.length <= 5) {
    feedback += `\n\nPalavras para praticar: ${incorrectWords.map((w) => w.word).join(", ")}`;
  }

  return feedback;
}

/**
 * Transcreve áudio em lote
 */
export async function batchSpeechToText(
  items: Array<{ audioUrl: string; languageCode: string; id?: string }>
): Promise<Array<STTResult & { id?: string }>> {
  const results: Array<STTResult & { id?: string }> = [];

  for (const item of items) {
    try {
      const result = await speechToText({
        audioUrl: item.audioUrl,
        languageCode: item.languageCode,
      });

      results.push({
        ...result,
        id: item.id,
      });

      // Pequeno delay para não sobrecarregar API
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`[STT] Error transcribing audio for item ${item.id}:`, error);
      // Continuar com próximo item mesmo se houver erro
    }
  }

  return results;
}

/**
 * Verifica se o sistema STT está configurado
 */
export function isSTTConfigured(): boolean {
  // Whisper está sempre disponível via voiceTranscription helper
  return true;
}
