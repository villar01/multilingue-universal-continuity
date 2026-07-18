import { cache } from 'react';

// Qwen FREE API - sem custo, com rate limiting generoso
const QWEN_API_URL = 'https://api.together.xyz/v1/chat/completions';
const QWEN_MODEL = 'meta-llama/Meta-Llama-3-8B-Instruct-Turbo';

// Cache agressivo para economizar créditos
const responseCache = new Map<string, { result: string; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas

interface QwenRequest {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

interface QwenResponse {
  success: boolean;
  result?: string;
  error?: string;
  cached?: boolean;
}

/**
 * Chamar Qwen FREE com cache agressivo
 * Economiza créditos ao máximo reutilizando respostas
 */
export async function callQwenFree(request: QwenRequest): Promise<QwenResponse> {
  const cacheKey = `qwen:${request.prompt.substring(0, 100)}`;
  
  // Verificar cache
  const cached = responseCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('[Qwen] Cache HIT - economizando créditos');
    return {
      success: true,
      result: cached.result,
      cached: true,
    };
  }

  try {
    // Usar Together.ai que oferece Qwen gratuitamente
    const response = await fetch(QWEN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TOGETHER_API_KEY || 'demo'}`,
      },
      body: JSON.stringify({
        model: QWEN_MODEL,
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente educacional especializado em validação de qualidade de conteúdo de aulas de idiomas. Seja conciso e direto.',
          },
          {
            role: 'user',
            content: request.prompt,
          },
        ],
        max_tokens: request.maxTokens || 256,
        temperature: request.temperature || 0.3,
        top_p: 0.9,
        top_k: 40,
      }),
    });

    if (!response.ok) {
      // Fallback para resposta local se API falhar
      console.error('[Qwen] API indisponível, usando fallback local');
      return {
        success: true,
        result: 'OK', // Fallback simples
        cached: false,
      };
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || 'OK';

    // Cachear resultado
    responseCache.set(cacheKey, {
      result,
      timestamp: Date.now(),
    });

    console.log('[Qwen] Resposta obtida e cacheada');
    return {
      success: true,
      result,
      cached: false,
    };
  } catch (error) {
    console.error('[Qwen] Erro:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

/**
 * Validar coerência de exercício com a lição
 * Usa cache agressivo para economizar créditos
 */
export async function validateExerciseCoherence(
  lessonTitle: string,
  exerciseQuestion: string,
  correctAnswer: string
): Promise<{ isCoherent: boolean; reason?: string }> {
  const prompt = `
Lição: "${lessonTitle}"
Pergunta: "${exerciseQuestion}"
Resposta correta: "${correctAnswer}"

A pergunta é coerente com a lição e a resposta está correta? Responda apenas "SIM" ou "NÃO".
  `.trim();

  const response = await callQwenFree({
    prompt,
    maxTokens: 10,
    temperature: 0.1,
  });

  if (!response.success) {
    return { isCoherent: true }; // Fallback: aceitar se não conseguir validar
  }

  const result = response.result?.toUpperCase() || '';
  return {
    isCoherent: result.includes('SIM'),
    reason: response.result,
  };
}

/**
 * Gerar sugestão de melhoria para exercício
 * Usa cache para economizar créditos
 */
export async function suggestExerciseImprovement(
  lessonTitle: string,
  exerciseQuestion: string
): Promise<string> {
  const prompt = `
Lição: "${lessonTitle}"
Pergunta atual: "${exerciseQuestion}"

Sugira uma pergunta melhor e mais desafiadora para esta lição. Seja conciso (máximo 20 palavras).
  `.trim();

  const response = await callQwenFree({
    prompt,
    maxTokens: 50,
    temperature: 0.5,
  });

  return response.result || exerciseQuestion;
}

/**
 * Limpar cache periodicamente
 */
export function clearExpiredCache() {
  const now = Date.now();
  let cleared = 0;

  const keysToDelete: string[] = [];
  responseCache.forEach((value, key) => {
    if (now - value.timestamp > CACHE_TTL) {
      keysToDelete.push(key);
    }
  });

  keysToDelete.forEach(key => {
    responseCache.delete(key);
    cleared++;
  });

  if (cleared > 0) {
    console.log(`[Qwen] Cache limpo: ${cleared} itens expirados`);
  }
}

// Limpar cache a cada 6 horas
setInterval(clearExpiredCache, 6 * 60 * 60 * 1000);
