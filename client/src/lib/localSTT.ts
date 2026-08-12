import { pipeline } from '@xenova/transformers';
import { createAudioRecorder, requestMicrophoneStream } from './microphoneAccess';

let transcriber: any = null;

// Inicializar modelo de transcrição
export async function initializeTranscriber() {
  if (!transcriber) {
    try {
      transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny');
      console.log('✅ Modelo Whisper carregado');
    } catch (error) {
      console.error('❌ Erro ao carregar modelo Whisper:', error);
      throw error;
    }
  }
  return transcriber;
}

// Transcrever áudio local
export async function transcribeAudioLocal(audioUrl: string, language?: string): Promise<string> {
  try {
    const model = await initializeTranscriber();
    
    // Carregar áudio
    const response = await fetch(audioUrl);
    const arrayBuffer = await response.arrayBuffer();
    
    // Decodificar áudio
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // Converter para Float32Array
    const channelData = audioBuffer.getChannelData(0);
    
    // Transcrever
    const result = await model(channelData, {
      language: language || 'english',
      top_k: 0,
      do_sample: false,
      chunk_length_s: 30,
      stride_length_s: 5,
    });
    
    return result.text || '';
  } catch (error) {
    console.error('Erro na transcrição:', error);
    throw error;
  }
}

// Analisar pronúncia comparando com texto esperado
export async function analyzePronunciationLocal(
  audioUrl: string,
  expectedText: string,
  language?: string
): Promise<{
  transcribed: string;
  accuracy: number;
  matches: boolean;
  suggestions: string[];
}> {
  try {
    const transcribed = await transcribeAudioLocal(audioUrl, language);
    
    // Normalizar textos
    const normalize = (text: string) => 
      text.toLowerCase().trim().replace(/[.,!?;:]/g, '');
    
    const normalizedTranscribed = normalize(transcribed);
    const normalizedExpected = normalize(expectedText);
    
    // Calcular similaridade (Levenshtein distance)
    const similarity = calculateSimilarity(normalizedTranscribed, normalizedExpected);
    const accuracy = Math.round(similarity * 100);
    
    // Gerar sugestões
    const suggestions: string[] = [];
    if (accuracy < 50) {
      suggestions.push('Tente pronunciar mais claramente');
      suggestions.push('Fale mais devagar');
    } else if (accuracy < 80) {
      suggestions.push('Quase lá! Pratique a pronúncia');
    } else {
      suggestions.push('Excelente pronúncia!');
    }
    
    return {
      transcribed,
      accuracy,
      matches: accuracy >= 80,
      suggestions,
    };
  } catch (error) {
    console.error('Erro na análise de pronúncia:', error);
    throw error;
  }
}

// Calcular similaridade entre strings (Levenshtein distance)
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = getEditDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function getEditDistance(s1: string, s2: string): number {
  const costs: number[] = [];
  
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  
  return costs[s2.length];
}

// Verificar suporte a Web Audio API
export function isWebAudioSupported(): boolean {
  return 'AudioContext' in window || 'webkitAudioContext' in window;
}

// Gravar áudio do microfone
export async function recordAudioFromMicrophone(durationMs: number = 5000): Promise<Blob> {
  return new Promise(async (resolve, reject) => {
    try {
      const stream = await requestMicrophoneStream();
      const mediaRecorder = createAudioRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mediaRecorder.mimeType || 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        resolve(blob);
      };

      mediaRecorder.start();

      // Parar após duração especificada
      setTimeout(() => {
        mediaRecorder.stop();
      }, durationMs);
    } catch (error) {
      reject(error);
    }
  });
}

// Converter Blob de áudio para URL
export function blobToUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}
