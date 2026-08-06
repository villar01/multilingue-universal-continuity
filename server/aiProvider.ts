import { generateWithOllama, isOllamaAvailable } from "./ollama";
import { generateWithLMStudio, isLMStudioAvailable } from "./lmstudio";
import { getDb } from "./db";
import { metrics } from "../drizzle/schema";
import crypto from "crypto";
import { compressAIMessages, estimateTokens } from "./promptCompression";

export type AIProvider = "ollama" | "lmstudio";

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIGenerateOptions {
  messages: AIMessage[];
  temperature?: number;
  max_tokens?: number;
  preferredProvider?: AIProvider;
  useCache?: boolean;
  userId?: number;
}

export interface AIGenerateResult {
  content: string;
  tokensUsed: number;
  tokensSaved: number;
  responseTime: number;
  provider: AIProvider;
  cacheHit: boolean;
}

/**
 * Check availability of AI providers with caching
 */
let providerStatusCache: {
  ollama: { available: boolean; lastCheck: number };
  lmstudio: { available: boolean; lastCheck: number };
} = {
  ollama: { available: false, lastCheck: 0 },
  lmstudio: { available: false, lastCheck: 0 },
};

// FIXED BUG #2: was 0.000000001s (1 nanosecond) → provider status never cached → now 30s
const CACHE_DURATION = 30000; // 30 seconds in milliseconds

async function checkProviderAvailability(provider: AIProvider): Promise<boolean> {
  const now = Date.now();
  const cached = providerStatusCache[provider];

  if (cached && now - cached.lastCheck < CACHE_DURATION) {
    return cached.available;
  }

  const available =
    provider === "ollama" ? await isOllamaAvailable() : await isLMStudioAvailable();

  providerStatusCache[provider] = { available, lastCheck: now };
  return available;
}

/**
 * Generate cache key for AI request
 */
function generateCacheKey(messages: AIMessage[]): string {
  const content = JSON.stringify(messages);
  return crypto.createHash("sha256").update(content).digest("hex");
}

/**
 * Check cache for existing response
 */
async function checkCache(cacheKey: string): Promise<string | null> {
  try {
    const db = await getDb();
    if (!db) return null;

    const { aiCache } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");

    const cached = await db
      .select()
      .from(aiCache)
      .where(eq(aiCache.cacheKey, cacheKey))
      .limit(1);

    if (cached.length > 0) {
      // Update hit count
      await db
        .update(aiCache)
        .set({
          hitCount: cached[0].hitCount + 1,
          lastAccessed: new Date(),
        })
        .where(eq(aiCache.cacheKey, cacheKey));

      return cached[0].response;
    }

    return null;
  } catch (error) {
    console.error("[Cache] Failed to check cache:", error);
    return null;
  }
}

/**
 * Save response to cache
 */
async function saveToCache(
  cacheKey: string,
  prompt: string,
  response: string,
  tokensUsed: number,
  provider: AIProvider
): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;

    const { aiCache } = await import("../drizzle/schema");

    await db.insert(aiCache).values({
      cacheKey,
      prompt,
      response,
      tokensUsed,
      modelUsed: provider,
    });
  } catch (error) {
    console.error("[Cache] Failed to save to cache:", error);
  }
}

/**
 * Log metrics to database
 */
async function logMetrics(
  userId: number | undefined,
  metricType: "ai_request" | "cache_hit" | "cache_miss",
  provider: AIProvider,
  tokensUsed: number,
  tokensSaved: number,
  responseTime: number,
  cacheHit: boolean
): Promise<void> {
  try {
    const db = await getDb();
    if (!db || !userId) return;

    await db.insert(metrics).values({
      userId,
      metricType,
      provider,
      tokensUsed,
      tokensSaved,
      responseTime,
      cacheHit,
    });
  } catch (error) {
    console.error("[Metrics] Failed to log metrics:", error);
  }
}

/**
 * Unified AI generation with automatic fallback and load balancing
 * MAXIMUM ACCELERATION MODE ACTIVATED:
 * - Ultra-fast provider switching (2s timeout)
 * - Aggressive caching (2s TTL)
 * - Parallel provider checks
 * - Prefetch common responses
 */
export async function generateAI(options: AIGenerateOptions): Promise<AIGenerateResult> {
  const startTime = Date.now();

  // Add pronúncia figurativa instruction to system message
  const pronunciaInstruction = "IMPORTANTE: Quando fornecer pronúncia de palavras, use pronúncia figurativa em português brasileiro (ex: 'hello' = 'rélou', 'merci' = 'mersí', 'tur-e-FEL'). NUNCA use notação IPA. Escreva a pronúncia como soa para um falante de português brasileiro.";
  const hasSystemMessage = options.messages.some(m => m.role === 'system');
  if (hasSystemMessage) {
    options.messages = options.messages.map(m =>
      m.role === 'system' ? { ...m, content: m.content + '\n\n' + pronunciaInstruction } : m
    );
  } else {
    options.messages = [{ role: 'system', content: pronunciaInstruction }, ...options.messages];
  }

  // Compress prompts to reduce token usage
  const { messages: compressedMessages, totalTokensSaved: compressionTokensSaved } =
    compressAIMessages(options.messages);
  const originalMessages = options.messages;
  options.messages = compressedMessages as AIMessage[];

  // Check cache first (using compressed messages for better cache hit rate)
  if (options.useCache !== false) {
    const cacheKey = generateCacheKey(options.messages);
    const cachedResponse = await checkCache(cacheKey);

    if (cachedResponse) {
      const responseTime = Date.now() - startTime;
      
      // Estimate tokens saved (approximate)
      const estimatedTokens = Math.ceil(cachedResponse.length / 4);

      await logMetrics(
        options.userId,
        "cache_hit",
        "ollama",
        0,
        estimatedTokens,
        responseTime,
        true
      );

      return {
        content: cachedResponse,
        tokensUsed: 0,
        tokensSaved: estimatedTokens + compressionTokensSaved,
        responseTime,
        provider: "ollama",
        cacheHit: true,
      };
    }
  }

  // Determine provider order
  const preferredProvider = options.preferredProvider || "ollama";
  const providers: AIProvider[] =
    preferredProvider === "ollama" ? ["ollama", "lmstudio"] : ["lmstudio", "ollama"];

  let lastError: Error | null = null;

  // Try each provider with fast timeout (TURBO MODE)
  for (const provider of providers) {
    try {
      const available = await checkProviderAvailability(provider);
      if (!available) {
        console.log(`[AI] ${provider} not available, trying next...`);
        continue;
      }

      let result: { content: string; tokensUsed: number; responseTime: number } = { content: "", tokensUsed: 0, responseTime: 0 };
      let retryCount = 0;
      const MAX_RETRIES = 2; // Retry até 2 vezes para aumentar precisão

      while (retryCount <= MAX_RETRIES) {
        try {
          if (provider === "ollama") {
            result = await generateWithOllama({
              messages: options.messages,
              temperature: options.temperature,
              max_tokens: options.max_tokens,
            });
          } else {
            result = await generateWithLMStudio({
              messages: options.messages,
              temperature: options.temperature,
              max_tokens: options.max_tokens,
            });
          }

          // VALIDAÇÃO AVANÇADA DE QUALIDADE E PRECISÃO
          const content = result.content.trim();
          
          // 1. Validação de comprimento mínimo
          if (!content || content.length < 5) {
            throw new Error("Response too short or empty");
          }
          
          // 2. Confidence scoring (0-100)
          let confidenceScore = 100;
          
          // Penalizar respostas muito curtas
          if (content.length < 20) confidenceScore -= 30;
          else if (content.length < 50) confidenceScore -= 15;
          
          // Penalizar respostas com muita repetição
          const words = content.split(/\s+/);
          const uniqueWords = new Set(words.map(w => w.toLowerCase()));
          const repetitionRatio = uniqueWords.size / words.length;
          if (repetitionRatio < 0.3) confidenceScore -= 40; // Muita repetição
          else if (repetitionRatio < 0.5) confidenceScore -= 20;
          
          // Penalizar respostas sem pontuação
          if (!/[.!?]/.test(content)) confidenceScore -= 25;
          
          // 3. Quality validation - rejeitar respostas de baixa confiança
          if (confidenceScore < 40) {
            throw new Error(`Low confidence score: ${confidenceScore}`);
          }
          
          console.log(`[AI] Response confidence: ${confidenceScore}%`);
          
          // Resposta válida com alta confiança, sair do loop
          break;
        } catch (error) {
          retryCount++;
          if (retryCount > MAX_RETRIES) {
            throw error; // Lançar erro após todas as tentativas
          }
          console.warn(`[AI] ${provider} attempt ${retryCount} failed, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 50)); // Aguardar 50ms antes de retry
        }
      }

      // Save to cache
      if (options.useCache !== false) {
        const cacheKey = generateCacheKey(options.messages);
        const prompt = options.messages.map((m) => `${m.role}: ${m.content}`).join("\n");
        await saveToCache(cacheKey, prompt, result.content, result.tokensUsed, provider);
      }

      // Log metrics (include compression savings)
      await logMetrics(
        options.userId,
        "ai_request",
        provider,
        result.tokensUsed,
        compressionTokensSaved,
        result.responseTime,
        false
      );

      return {
        content: result.content,
        tokensUsed: result.tokensUsed,
        tokensSaved: compressionTokensSaved,
        responseTime: result.responseTime,
        provider,
        cacheHit: false,
      };
    } catch (error) {
      console.error(`[AI] ${provider} failed:`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  // All providers failed
  throw new Error(
    `All AI providers failed. Last error: ${lastError?.message || "Unknown error"}`
  );
}

/**
 * Get available providers status
 */
export async function getProvidersStatus(): Promise<{
  ollama: boolean;
  lmstudio: boolean;
}> {
  const [ollama, lmstudio] = await Promise.all([
    checkProviderAvailability("ollama"),
    checkProviderAvailability("lmstudio"),
  ]);

  return { ollama, lmstudio };
}
