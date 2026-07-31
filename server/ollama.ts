import axios from "axios";

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

// Cache em memória para respostas repetidas (TTL 5 minutos)
const responseCache = new Map<string, { content: string; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

// Modelo leve para respostas rápidas, modelo maior para tarefas complexas
const FAST_MODEL = "qwen2.5:1.5b";
const FULL_MODEL = "qwen2.5:3b";

export interface OllamaMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OllamaGenerateOptions {
  model?: string;
  messages: OllamaMessage[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
  fast?: boolean; // usar modelo 1.5b para respostas rápidas
}

export interface OllamaResponse {
  model: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
}

/**
 * Check if Ollama service is available (verificação rápida 1s)
 */
export async function isOllamaAvailable(): Promise<boolean> {
  try {
    const response = await axios.get(`${OLLAMA_BASE_URL}/api/tags`, {
        timeout: 1000, // 1 segundo - verificação rápida
    });
    return response.status === 200;
  } catch {
    return false;
  }
}

/**
 * List available models in Ollama
 */
export async function listOllamaModels(): Promise<string[]> {
  try {
    const response = await axios.get(`${OLLAMA_BASE_URL}/api/tags`, { timeout: 2000 });
    return response.data.models?.map((m: any) => m.name) || [];
  } catch {
    return [];
  }
}

/**
 * Generate completion using Ollama with smart model selection and caching
 */
export async function generateWithOllama(
  options: OllamaGenerateOptions
): Promise<{ content: string; tokensUsed: number; responseTime: number }> {
  const startTime = Date.now();
  
  // Seleção inteligente de modelo: fast=1.5b, default=3b
  const model = options.model || (options.fast ? FAST_MODEL : FULL_MODEL);
  
  // Verificar cache primeiro
  const cacheKey = `${model}:${JSON.stringify(options.messages)}:${options.temperature || 0.7}`;
  const cached = responseCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return {
      content: cached.content,
      tokensUsed: 0,
      responseTime: Date.now() - startTime,
    };
  }
  
  try {
    // Reduzir max_tokens para respostas mais rápidas
    const maxTokens = options.max_tokens || (options.fast ? 500 : 2000);
    
    const response = await axios.post<OllamaResponse>(
      `${OLLAMA_BASE_URL}/api/chat`,
      {
        model,
        messages: options.messages,
        stream: false,
        options: {
          temperature: options.temperature || 0.7,
          num_predict: maxTokens,
          // Otimizações de velocidade
          num_ctx: options.fast ? 2048 : 4096, // contexto menor = mais rápido
          seed: 0, // determinístico para melhor cache
          top_k: 20, // reduzir amostragem para mais velocidade
          top_p: 0.8,
        },
      },
      {
        timeout: options.fast ? 15000 : 30000, // 15s para fast, 30s para full
      }
    );

    const responseTime = Date.now() - startTime;
    const tokensUsed = (response.data.prompt_eval_count || 0) + (response.data.eval_count || 0);
    const content = response.data.message.content;

    // Salvar no cache
    responseCache.set(cacheKey, { content, ts: Date.now() });

    // Limpar cache antigo periodicamente
    if (responseCache.size > 1000) {
      const now = Date.now();
      for (const [key, val] of responseCache) {
        if (now - val.ts > CACHE_TTL) responseCache.delete(key);
      }
    }

    return { content, tokensUsed, responseTime };
  } catch (error) {
    console.error("[Ollama] Generation failed:", error);
    throw new Error(
      `Ollama generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Generate streaming completion using Ollama (texto aparece palavra por palavra)
 */
export async function* generateWithOllamaStream(
  options: OllamaGenerateOptions
): AsyncGenerator<string, void, unknown> {
  const model = options.model || (options.fast ? FAST_MODEL : FULL_MODEL);
  
  try {
    const response = await axios.post(
      `${OLLAMA_BASE_URL}/api/chat`,
      {
        model,
        messages: options.messages,
        stream: true,
        options: {
          temperature: options.temperature || 0.7,
          num_predict: options.max_tokens || (options.fast ? 500 : 2000),
          num_ctx: options.fast ? 2048 : 4096,
          top_k: 20,
          top_p: 0.8,
        },
      },
      {
        timeout: 30000,
        responseType: "stream",
      }
    );

    const stream = response.data as any;
    let buffer = "";

    for await (const chunk of stream) {
      buffer += chunk.toString();
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const data = JSON.parse(line);
          if (data.message?.content) {
            yield data.message.content;
          }
          if (data.done) return;
        } catch {
          // linha incompleta, continuar
        }
      }
    }
  } catch (error) {
    console.error("[Ollama] Stream failed:", error);
    throw new Error(`Ollama stream failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Pull a model from Ollama registry
 */
export async function pullOllamaModel(modelName: string): Promise<boolean> {
  try {
    await axios.post(`${OLLAMA_BASE_URL}/api/pull`, { name: modelName }, { timeout: 300000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get model info
 */
export async function getModelInfo(modelName: string): Promise<any> {
  try {
    const response = await axios.post(`${OLLAMA_BASE_URL}/api/show`, { name: modelName }, { timeout: 5000 });
    return response.data;
  } catch {
    return null;
  }
}
